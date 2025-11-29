import * as typed_ast from "./typed_ast";
import * as ast from "./ast";
import * as ty from "./type";

export function check(tree: ast.ASTType): typed_ast.TypedASTType {
  const checker = new Checker(tree);
  checker.applyInferredType();
  return checker.funcs;
}

function convertDType(type: ast.DType): ty.Type {
  switch (type) {
    case "数":
      return { type: "number" };
    case "文句":
      return { type: "string" };
    case "陰陽":
      return { type: "bool" };
  }
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
  scope: Block[] = [];
  hasRes = false;
  unifyEnv = new ty.UnifyEnv();
  resTy: ty.Type = { type: "unknown" };

  constructor(tree: ast.ASTType) {
    tree.forEach((func) => this.constructFuncParams(func));
    tree.forEach((func) => this.constructFunc(func));
  }
  constructFuncParams(func: ast.Func) {
    const params: typed_ast.Var[] = func.params.map((param) => ({
      dtype: convertDType(param.dtype),
      name: param.name,
    }));
    const resTy = this.unifyEnv.getNewParamTy();
    const functype: ty.FuncType = {
      type: "func",
      params: params.map((param) => param.dtype),
      res: resTy,
    };
    this.funcs.set(func.name, { dtype: functype, params, body: [] });
  }
  constructFunc(func: ast.Func) {
    const typedFunc = this.funcs.get(func.name);
    if (typeof typedFunc === "undefined") {
      throw "unreachable";
    }
    this.resTy = typedFunc.dtype.res;
    this.scope.push(
      new Map(typedFunc.params.map((param) => [param.name, param])),
    );
    const body: typed_ast.Statement[] = func.body
      .map((stmt) => this.constructStatement(stmt))
      .filter((stmt) => stmt !== null);
    this.scope.pop();
    if (!this.hasRes) {
      this.unifyEnv.unify(typedFunc.dtype.res, { type: "void" });
    }
    typedFunc.body = body;
  }
  constructStatement(stmt: ast.Statement): typed_ast.Statement | null {
    switch (stmt.type) {
      case "none":
        return null;
      case "return": {
        const [value, type] = this.constructExpr(stmt.value);

        this.unifyEnv.unify(
          this.resTy,
          type,
          "Return type is different from before. 戻値之型先と相異候",
        );
        this.hasRes = true;
        return { type: "return", value };
      }
      case "declare": {
        const [value, type] =
          stmt.value !== null
            ? this.constructExpr(stmt.value)
            : [null, { type: "unknown" } as ty.UnknownType];

        const concatType = this.unifyEnv.unify(
          type,
          convertDType(stmt.dtype),
          "The initial value and the type of the variable is different. 初期値と変数之型相異候",
        );
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
        this.unifyEnv.unify(
          variable.dtype,
          type,
          "The value and the type of the variable is different. 値と変数之型相異候",
        );

        return { type: "assign", variable, value };
      }
      case "if": {
        const conds = stmt.conds.map((condition): typed_ast.Condition => {
          const [cond, type] = this.constructExpr(condition.cond);
          this.unifyEnv.unify(
            type,
            { type: "bool" },
            "The conditional expression is not bool. 条件式陰陽に無御座候",
          );
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
          dtype: convertDType(stmt.dtype),
        };
        const [init, initType] = this.constructExpr(stmt.init);
        this.unifyEnv.unify(
          variable.dtype,
          initType,
          "Init type is different. 初期値之型相異候",
        );
        const [end, endType] = this.constructExpr(stmt.end);
        this.unifyEnv.unify(
          variable.dtype,
          endType,
          "End type is different. 終値之型相異候",
        );
        stmt.call.args.unshift({ type: "ident", name: stmt.name });
        this.scope.push(new Map([[stmt.name, variable]]));
        const call = this.constructExpr(stmt.call)[0] as typed_ast.CallExpr;
        const body = stmt.body
          .map((stmt) => this.constructStatement(stmt))
          .filter((stmt) => stmt !== null);
        this.scope.pop();
        return { type: "for", body, call, end, init, variable };
      }
      case "while": {
        const [cond, type] = this.constructExpr(stmt.cond);
        this.unifyEnv.unify(
          type,
          { type: "bool" },
          "The conditional expression is not bool. 条件式陰陽に無御座候",
        );
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
        const argsAndTypes = expr.args.map((arg) => this.constructExpr(arg));
        const args = argsAndTypes.map((x) => x[0]);
        const argTypes = argsAndTypes.map((x) => x[1]);
        const calledFunc = this.funcs.get(expr.funcname);
        if (typeof calledFunc === "undefined") {
          throw `The function ${expr.funcname} not found. 変数${expr.funcname}不被見出候`;
        }
        const funcType = this.unifyEnv.unify(
          {
            type: "func",
            params: argTypes,
            res: { type: "unknown" },
          },
          this.unifyEnv.cloneParam(calledFunc.dtype),
          "The argument type is different. 引数之型相異候",
        ) as ty.FuncType;
        return [
          {
            type: "call",
            args,
            dtype: funcType,
            funcname: expr.funcname,
          },
          funcType.res,
        ];
      }
      case "and":
      case "or": {
        const [left, leftType] = this.constructExpr(expr.left);
        const [right, rightType] = this.constructExpr(expr.right);
        this.unifyEnv.unify(
          leftType,
          { type: "bool" },
          "The left conditional expression is not bool. 左条件式陰陽に無御座候",
        );
        this.unifyEnv.unify(
          rightType,
          { type: "bool" },
          "The right conditional expression is not bool. 右条件式陰陽に無御座候",
        );
        return [{ type: expr.type, left, right }, { type: "bool" }];
      }
      case "not": {
        const [value, type] = this.constructExpr(expr.value);
        this.unifyEnv.unify(
          type,
          { type: "bool" },
          "The conditional expression is not bool. 条件式陰陽に無御座候",
        );
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
        const dtype = this.unifyEnv.unify(
          leftType,
          rightType,
          "The type of the expressions is different. 左式と右式之型相異候",
        );
        return [{ type: expr.type, left, right, dtype }, { type: "bool" }];
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

  applyInferredType() {
    this.funcs.forEach((func) => {
      func.dtype.res = this.unifyEnv.resolve(func.dtype.res);
    });
  }
  applyInferredTypeToStatement(stmt: typed_ast.Statement) {
    switch (stmt.type) {
      case "return":
        this.applyInferredTypeToExpression(stmt.value);
        return;
      case "declare":
        stmt.variable.dtype = this.unifyEnv.resolve(stmt.variable.dtype);
        if (stmt.value !== null) {
          this.applyInferredTypeToExpression(stmt.value);
        }
        return;
      case "assign":
        this.applyInferredTypeToExpression(stmt.value);
        return;
      case "inline":
        return;
      case "if":
        stmt.conds.forEach((cond) => {
          this.applyInferredTypeToExpression(cond.cond);
          cond.body.forEach((stmt) => this.applyInferredTypeToStatement(stmt));
        });
        if (stmt.else !== null) {
          stmt.else.forEach((stmt) => this.applyInferredTypeToStatement(stmt));
        }
        return;
      case "for":
        stmt.variable.dtype = this.unifyEnv.resolve(stmt.variable.dtype);
        this.applyInferredTypeToExpression(stmt.init);
        this.applyInferredTypeToExpression(stmt.end);
        this.applyInferredTypeToExpression(stmt.call);
        stmt.body.forEach((stmt) => this.applyInferredTypeToStatement(stmt));
        return;
      case "while":
        this.applyInferredTypeToExpression(stmt.cond);
        stmt.body.forEach((stmt) => this.applyInferredTypeToStatement(stmt));
        return;
      case "call":
        this.applyInferredTypeToExpression(stmt.call);
        return;
    }
  }
  applyInferredTypeToExpression(expr: typed_ast.Expr) {
    switch (expr.type) {
      case "ident":
        expr.variable.dtype = this.unifyEnv.resolve(expr.variable.dtype);
        return;
      case "and":
      case "or":
        this.applyInferredTypeToExpression(expr.right);
        this.applyInferredTypeToExpression(expr.left);
        return;
      case "not":
        this.applyInferredTypeToExpression(expr.value);
        return;
      case "eq":
      case "ne":
      case "gt":
      case "lt":
      case "ge":
      case "le":
        expr.dtype = this.unifyEnv.resolve(expr.dtype);
        this.applyInferredTypeToExpression(expr.right);
        this.applyInferredTypeToExpression(expr.left);
        return;
      case "call":
        expr.dtype = this.unifyEnv.resolve(expr.dtype);
        expr.args.forEach((arg) => this.applyInferredTypeToExpression(arg));
        return;
      case "string":
      case "number":
      case "bool":
        return;
    }
  }
}
