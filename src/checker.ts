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
          throw "";
        }
        const name = stmt.name;
        if (this.scope.at(-1)?.has(name)) {
          this.scope.at(-1)?.set(name, { dtype: concatType, name });
        } else {
          throw `${name} is already declared. 既ニ${name}被宣言候`;
        }
        return { type: "declare", dtype: concatType, name, value };
      }
      case "assign":
      case "if":
      case "for":
      case "while":
      case "call":
        throw "todo";
    }
  }
  constructExpr(expr: ast.Expr): [typed_ast.Expr, ty.Type] {
    switch (expr.type) {
      case "call":
      case "and":
      case "or":
      case "not":
      case "eq":
      case "ne":
      case "gt":
      case "lt":
      case "ge":
      case "le":
      case "bool":
      case "string":
      case "ident":
        throw "todo";
    }
  }
  deduceType() {}
}
