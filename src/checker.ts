import * as typed_ast from "./typed_ast";
import * as ast from "./ast";
import * as ty from "./type";

export function check(tree: ast.ASTType): typed_ast.TypedASTType {
  const checker = new Checker(tree);
  checker.deduceType();
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
      dtype: convertDType(param.dtype),
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

        const concatType = ty.concatType(type, convertDType(stmt.dtype));
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
            throw "The condtional expression is not bool. 条件式陰陽に無御座候";
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
          dtype: convertDType(stmt.dtype),
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
        call.dtype.params.unshift(variable.dtype);
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
          throw "The condtional expression is not bool. 条件式陰陽に無御座候";
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
    }
  }
  constructExpr(expr: ast.Expr): [typed_ast.Expr, ty.Type] {
    switch (expr.type) {
      case "call": {
        const args_and_types = expr.args.map((arg) => this.constructExpr(arg));
        const args = args_and_types.map((arg) => arg[0]);
        const types = args_and_types.map((arg) => arg[1]);
        return [
          {
            type: "call",
            dtype: { type: "func", params: types, res: { type: "unknown" } },
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
          throw "The left condtional expression is not bool. 左条件式陰陽に無御座候";
        }
        if (!["unknown", "bool"].includes(rightType.type)) {
          throw "The right condtional expression is not bool. 右条件式陰陽に無御座候";
        }
        return [{ type: expr.type, left, right }, { type: "bool" }];
      }
      case "not": {
        const [value, type] = this.constructExpr(expr.value);
        if (!["unknown", "bool"].includes(type.type)) {
          throw "The condtional expression is not bool. 条件式陰陽に無御座候";
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
      case "bool":
        return [expr, { type: "bool" }];
      case "string":
        return [expr, { type: "string" }];
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
  deduceType() {}
}
