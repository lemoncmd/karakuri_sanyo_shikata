import * as typed_ast from "./typed_ast";
import * as ast from "./ast";
import * as ty from "./type";

export function check(tree: ast.ASTType): typed_ast.TypedASTType {
  const checker = new Checker(tree);
  checker.deduceType();
  return checker.funcs;
}

function parseNumber(str: string): number | null {
  const digitMap: Record<string, number> = {
    零: 0,
    壱: 1,
    弐: 2,
    参: 3,
    肆: 4,
    伍: 5,
    陸: 6,
    漆: 7,
    捌: 8,
    玖: 9,
  };

  const unitMap: Record<string, number> = {
    拾: 10,
    佰: 100,
    仟: 1000,
  };

  const groupUnitMap: Record<string, number> = {
    萬: 1e4,
    億: 1e8,
    兆: 1e12,
  };

  let total = 0;
  let groupValue = 0;
  let sectionValue = 0;
  let lastDigit = 0;

  const chars = str.split("");

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];

    if (digitMap.hasOwnProperty(ch)) {
      lastDigit = digitMap[ch];
    } else if (unitMap.hasOwnProperty(ch)) {
      sectionValue += (lastDigit || 1) * unitMap[ch];
      lastDigit = 0;
    } else if (groupUnitMap.hasOwnProperty(ch)) {
      sectionValue += lastDigit;
      groupValue += sectionValue * groupUnitMap[ch];
      sectionValue = 0;
      lastDigit = 0;
    } else if (ch === "零") {
      lastDigit = 0;
    } else {
      return null;
    }
  }

  total = groupValue + sectionValue + lastDigit;
  return total;
}

type Block = Map<string, typed_ast.Var>;
class Checker {
  funcs: typed_ast.TypedASTType = new Map();
  has_res: boolean = false;
  res_ty: ty.Type = { type: "unknown" };
  scope: Block[] = [];
  constructor(tree: ast.ASTType) {
    tree.forEach((func) => this.constructFunc(func));
  }
  constructFunc(func: ast.Func) {
    const params: typed_ast.Var[] = func.params.map((param) => ({
      dtype: param.dtype,
      name: param.name,
    }));
    const functype: ty.FuncType = {
      type: "func",
      params: params.map((param) => param.dtype),
      res: { type: "unknown" },
    };

    this.scope.push(new Map(params.map((param) => [param.name, param])));
    this.res_ty = { type: "unknown" };
    const body: typed_ast.Statement[] = func.body
      .map((stmt) => this.constructStatement(stmt))
      .filter((stmt) => stmt !== null);
    this.scope.pop();
    functype.res = this.has_res ? this.res_ty : { type: "void" };
    this.funcs.set(func.name, { dtype: functype, params, body });
  }
  constructStatement(stmt: ast.Statement): typed_ast.Statement | null {
    switch (stmt.type) {
      case "none":
        return null;
      case "return": {
        const [value, type] = this.constructExpr(stmt.value);

        const concatType = ty.concatType(this.res_ty, type);
        if (concatType === null) {
          throw "Return type is different from before. 戻値之型先と相異候";
        }
        this.res_ty = concatType;
        this.has_res = true;
        return { type: "return", value };
      }
      case "declare": {
        const [value, type] =
          stmt.value !== null
            ? this.constructExpr(stmt.value)
            : [null, { type: "unknown" } as ty.UnknownType];

        const concatType = ty.concatType(type, stmt.dtype);
        if (concatType === null) {
          throw "The initial value and the type of the variable is different. 初期値と変数之型相異候";
        }
        const name = stmt.name;
        const variable = { dtype: concatType, name };
        if (!this.scope.at(-1)?.has(name)) {
          this.scope.at(-1)?.set(name, variable);
        } else {
          throw `${name} is already declared. 既ニ${name}被宣言候`;
        }
        return { type: "declare", variable, value };
      }
      case "assign": {
        const variable = this.findVar(stmt.name);
        if (variable === null) {
          throw `The variable ${stmt.name} not found. 変数${stmt.name}不被見出候`;
        }

        const [value, type] = this.constructExpr(stmt.value);
        const concatType = ty.concatType(variable.dtype, type);
        if (concatType === null) {
          throw "The value and the type of the variable is different. 値と変数之型相異候";
        }

        return { type: "assign", variable, value };
      }
      case "if": {
        const conds = stmt.conds.map((condition): typed_ast.Condition => {
          const [cond, type] = this.constructExpr(condition.cond);
          if (!["unknown", "bool"].includes(type.type)) {
            throw "The conditional expression is not bool. 条件式陰陽に無御座候";
          }
          this.scope.push(new Map());
          const body = condition.body
            .map((stmt) => this.constructStatement(stmt))
            .filter((stmt) => stmt !== null);
          this.scope.pop();
          return { cond, body };
        });

        this.scope.push(new Map());
        const els =
          stmt.else &&
          stmt.else
            .map((stmt) => this.constructStatement(stmt))
            .filter((stmt) => stmt !== null);
        this.scope.pop();

        return { type: "if", conds, else: els };
      }
      case "for": {
        const variable: typed_ast.Var = {
          name: stmt.name,
          dtype: stmt.dtype,
        };
        const [init, initType] = this.constructExpr(stmt.init);
        if (ty.concatType(variable.dtype, initType) === null) {
          throw "Init type is different. 初期値之型相異候";
        }
        const [end, endType] = this.constructExpr(stmt.end);
        if (ty.concatType(variable.dtype, endType) === null) {
          throw "End type is different. 終値之型相異候";
        }
        const call = this.constructExpr(stmt.call)[0] as typed_ast.CallExpr;
        call.args.unshift({ type: "ident", variable });
        this.scope.push(new Map([[stmt.name, variable]]));
        const body = stmt.body
          .map((stmt) => this.constructStatement(stmt))
          .filter((stmt) => stmt !== null);
        this.scope.pop();
        return { type: "for", body, call, end, init, variable };
      }
      case "while": {
        const [cond, type] = this.constructExpr(stmt.cond);
        if (!["unknown", "bool"].includes(type.type)) {
          throw "The conditional expression is not bool. 条件式陰陽に無御座候";
        }
        this.scope.push(new Map());
        const body = stmt.body
          .map((stmt) => this.constructStatement(stmt))
          .filter((stmt) => stmt !== null);
        this.scope.pop();
        return { type: "while", cond, body };
      }
      case "call":
        return {
          type: "call",
          call: this.constructExpr(stmt)[0] as typed_ast.CallExpr,
        };
      case "inline":
        return stmt;
    }
  }
  constructExpr(expr: ast.Expr): [typed_ast.Expr, ty.Type] {
    switch (expr.type) {
      case "call": {
        const args = expr.args.map((arg) => this.constructExpr(arg)[0]);
        return [
          {
            type: "call",
            args,
            funcname: expr.funcname,
          },
          { type: "unknown" },
        ];
      }
      case "and":
      case "or": {
        const [left, leftType] = this.constructExpr(expr.left);
        const [right, rightType] = this.constructExpr(expr.right);
        if (!["unknown", "bool"].includes(leftType.type)) {
          throw "The left conditional expression is not bool. 左条件式陰陽に無御座候";
        }
        if (!["unknown", "bool"].includes(rightType.type)) {
          throw "The right conditional expression is not bool. 右条件式陰陽に無御座候";
        }
        return [{ type: expr.type, left, right }, { type: "bool" }];
      }
      case "not": {
        const [value, type] = this.constructExpr(expr.value);
        if (!["unknown", "bool"].includes(type.type)) {
          throw "The conditional expression is not bool. 条件式陰陽に無御座候";
        }
        return [{ type: expr.type, value }, { type: "bool" }];
      }
      case "eq":
      case "ne":
      case "gt":
      case "lt":
      case "ge":
      case "le": {
        const [left, leftType] = this.constructExpr(expr.left);
        const [right, rightType] = this.constructExpr(expr.right);
        const dtype = ty.concatType(leftType, rightType);
        if (dtype === null) {
          throw "The type of the expressions is different. 左式と右式之型相異候";
        }
        return [{ type: expr.type, left, right, dtype }, { type: "bool" }];
      }
      case "array_access": {
        const [value, valueType] = this.constructExpr(expr.value);
        const [index, indexType] = this.constructExpr(expr.index);
        if (!["unknown", "array"].includes(valueType.type)) {
          throw "The value accessed by number index must be an array. 数を以て被読候値、列に無御座候";
        }
        if (!["unknown", "number"].includes(indexType.type)) {
          throw "The index of array access is not number. 列の番号数に無御座候";
        }
        const baseType: ty.Type =
          valueType.type == "array" ? valueType.base : { type: "unknown" };
        return [{ type: "array_access", baseType, value, index }, baseType];
      }
      case "bool":
        return [expr, { type: "bool" }];
      case "string":
        return [expr, { type: "string" }];
      case "number": {
        const num = parseNumber(expr.value);
        if (num === null) {
          throw "The number literal is illegal. 数之表現奇怪に御座候";
        }
        return [{ type: "number", value: num }, { type: "number" }];
      }
      case "ident": {
        const variable = this.findVar(expr.name);
        if (variable === null) {
          throw `The variable ${expr.name} not found. 変数${expr.name}不被見出候`;
        }
        return [{ type: "ident", variable }, variable.dtype];
      }
    }
  }
  findVar(name: string): typed_ast.Var | null {
    for (let block of this.scope.toReversed()) {
      const maybeVar = block.get(name);
      if (maybeVar) return maybeVar;
    }
    return null;
  }

  deduceType() {
    while (
      this.funcs
        .values()
        .map((func) => {
          this.res_ty = func.dtype.res;
          const funcDeduced = func.body
            .map((stmt) => this.deduceStmtType(stmt))
            .some((value) => value);
          func.dtype.res = this.res_ty;
          return funcDeduced;
        })
        .some((x) => x)
    );
  }
  deduceStmtType(stmt: typed_ast.Statement): boolean {
    switch (stmt.type) {
      case "return": {
        const [updated, res] = this.deduceExprType(stmt.value, this.res_ty);
        let tyUpdated;
        [tyUpdated, this.res_ty] = ty.tryUpdate(
          this.res_ty,
          res,
          "incompatible type. 相異なる型に御座候",
        );
        return updated || tyUpdated;
      }
      case "declare": {
        if (stmt.value !== null) {
          const [updated, type] = this.deduceExprType(
            stmt.value,
            stmt.variable.dtype,
          );
          let tyUpdated;
          [tyUpdated, stmt.variable.dtype] = ty.tryUpdate(
            stmt.variable.dtype,
            type,
            "incompatible type. 相異なる型に御座候",
          );
          return updated || tyUpdated;
        }
        return false;
      }
      case "assign": {
        const [updated, type] = this.deduceExprType(
          stmt.value,
          stmt.variable.dtype,
        );
        let tyUpdated;
        [tyUpdated, stmt.variable.dtype] = ty.tryUpdate(
          stmt.variable.dtype,
          type,
          "incompatible type. 相異なる型に御座候",
        );
        return updated || tyUpdated;
      }
      case "call":
        return this.deduceExprType(stmt.call, { type: "unknown" })[0];
      case "inline":
        return false;
      case "if": {
        const condsUpdated = stmt.conds
          .map((cond) => {
            const [condUpdated, type] = this.deduceExprType(cond.cond, {
              type: "bool",
            });
            if (type.type !== "bool")
              throw "The conditional expression is not bool. 条件式陰陽に無御座候";

            const bodyUpdated = cond.body
              .map((stmt) => this.deduceStmtType(stmt))
              .some((x) => x);

            return condUpdated || bodyUpdated;
          })
          .some((x) => x);
        const elseUpdated =
          stmt.else === null
            ? false
            : stmt.else.map((stmt) => this.deduceStmtType(stmt)).some((x) => x);
        return condsUpdated || elseUpdated;
      }
      case "for": {
        const [initUpdated, initType] = this.deduceExprType(
          stmt.init,
          stmt.variable.dtype,
        );
        let initTypeUpdated;
        [initTypeUpdated, stmt.variable.dtype] = ty.tryUpdate(
          stmt.variable.dtype,
          initType,
          "Init type is different. 初期値之型相異候",
        );
        const [endUpdated, endType] = this.deduceExprType(
          stmt.end,
          stmt.variable.dtype,
        );
        let endTypeUpdated;
        [endTypeUpdated, stmt.variable.dtype] = ty.tryUpdate(
          stmt.variable.dtype,
          endType,
          "End type is different. 終値之型相異候",
        );
        const [callUpdated, callType] = this.deduceExprType(
          stmt.call,
          stmt.variable.dtype,
        );
        let callTypeUpdated;
        [callTypeUpdated, stmt.variable.dtype] = ty.tryUpdate(
          stmt.variable.dtype,
          callType,
          `Function ${stmt.call.funcname} which is called at every end of the loop returns different types. 毎々終に被呼函数${stmt.call.funcname}異る型返賜候`,
        );

        const bodyUpdated = stmt.body
          .map((stmt) => this.deduceStmtType(stmt))
          .some((x) => x);
        return (
          initUpdated ||
          initTypeUpdated ||
          endUpdated ||
          endTypeUpdated ||
          callUpdated ||
          callTypeUpdated ||
          bodyUpdated
        );
      }
      case "while": {
        const [condUpdated, type] = this.deduceExprType(stmt.cond, {
          type: "bool",
        });
        if (type.type !== "bool")
          throw "The conditional expression is not bool. 条件式陰陽に無御座候";

        const bodyUpdated = stmt.body
          .map((stmt) => this.deduceStmtType(stmt))
          .some((x) => x);

        return condUpdated || bodyUpdated;
      }
    }
  }

  deduceExprType(expr: typed_ast.Expr, hint: ty.Type): [boolean, ty.Type] {
    switch (expr.type) {
      case "string":
        return ty.tryUpdate(
          { type: "string" },
          hint,
          "The expression wasn't expected to be string. 文字列不可用",
        );
      case "bool":
        return ty.tryUpdate(
          { type: "bool" },
          hint,
          "The expression wasn't expected to be bool. 陰陽不可用",
        );
      case "number":
        return ty.tryUpdate(
          { type: "number" },
          hint,
          "The expression wasn't expected to be number. 数不可用",
        );
      case "ident": {
        let updated;
        return ([updated, expr.variable.dtype] = ty.tryUpdate(
          expr.variable.dtype,
          hint,
          "The expression wasn't expected to be bool. 陰陽不可用",
        ));
      }
      case "array_access": {
        const [indexUpdated, indexType] = this.deduceExprType(expr.index, {
          type: "number",
        });
        if (!["unknown", "number"].includes(indexType.type)) {
          throw "The index of array access is not number. 列の番号数に無御座候";
        }
        let typeUpdated1, typeUpdated2;
        [typeUpdated1, expr.baseType] = ty.tryUpdate(
          expr.baseType,
          hint,
          "foobar",
        );
        const [valueUpdated, valueType] = this.deduceExprType(expr.value, {
          type: "array",
          base: expr.baseType,
        });
        if (valueType.type !== "array") {
          throw "The value accessed by number index must be an array. 数を以て被読候値、列に無御座候";
        }
        [typeUpdated2, expr.baseType] = ty.tryUpdate(
          expr.baseType,
          valueType.base,
          "",
        );
        return [
          indexUpdated || typeUpdated1 || typeUpdated2 || valueUpdated,
          expr.baseType,
        ];
      }
      case "and":
      case "or": {
        const [leftUpdate, leftType] = this.deduceExprType(expr.left, {
          type: "bool",
        });
        if (!["unknown", "bool"].includes(leftType.type)) {
          throw "The left conditional expression is not bool. 左条件式陰陽に無御座候";
        }
        const [rightUpdate, rightType] = this.deduceExprType(expr.right, {
          type: "bool",
        });
        if (!["unknown", "bool"].includes(rightType.type)) {
          throw "The right conditional expression is not bool. 右条件式陰陽に無御座候";
        }
        if (!["unknown", "bool"].includes(hint.type)) {
          throw "The expression wasn't expected to be bool. 陰陽不可用";
        }
        return [leftUpdate || rightUpdate, { type: "bool" }];
      }
      case "not": {
        const [update, type] = this.deduceExprType(expr.value, {
          type: "bool",
        });
        if (!["unknown", "bool"].includes(type.type)) {
          throw "The left conditional expression is not bool. 左条件式陰陽に無御座候";
        }
        if (!["unknown", "bool"].includes(hint.type)) {
          throw "The expression wasn't expected to be bool. 陰陽不可用";
        }
        return [update, { type: "bool" }];
      }
      case "eq":
      case "ne":
      case "gt":
      case "lt":
      case "ge":
      case "le": {
        const [leftUpdate, leftType] = this.deduceExprType(
          expr.left,
          expr.dtype,
        );
        let leftTypeUpdate;
        [leftTypeUpdate, expr.dtype] = ty.tryUpdate(
          expr.dtype,
          leftType,
          "The type of the expressions is different. 左式と右式之型相異候",
        );

        const [rightUpdate, rightType] = this.deduceExprType(
          expr.right,
          expr.dtype,
        );
        let rightTypeUpdate;
        [rightTypeUpdate, expr.dtype] = ty.tryUpdate(
          expr.dtype,
          rightType,
          "The type of the expressions is different. 左式と右式之型相異候",
        );

        if (!["unknown", "bool"].includes(hint.type)) {
          throw "The expression wasn't expected to be bool. 陰陽不可用";
        }

        return [
          leftUpdate || leftTypeUpdate || rightUpdate || rightTypeUpdate,
          { type: "bool" },
        ];
      }
      case "call": {
        const callee = this.funcs.get(expr.funcname);
        if (typeof callee === "undefined")
          throw `Function ${expr.funcname} not found. 函数${expr.funcname}不被見出候`;

        let resTypeUpdated;
        [resTypeUpdated, callee.dtype.res] = ty.tryUpdate(
          callee.dtype.res,
          hint,
          "Usage of function return type is different. 函数之被使様相異候",
        );

        const argsUpdated = expr.args
          .map((arg, i) => {
            const [argUpdated, argType] = this.deduceExprType(
              arg,
              callee.dtype.params[i],
            );
            let argTypeUpdated;
            [argTypeUpdated, callee.dtype.params[i]] = ty.tryUpdate(
              callee.dtype.params[i],
              argType,
              "Function argument type is different.",
            );
            return argUpdated || argTypeUpdated;
          })
          .some((x) => x);

        return [resTypeUpdated || argsUpdated, callee.dtype.res];
      }
    }
  }
}
