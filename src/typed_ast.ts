import { FuncType, Type } from "./type";

export type TypedASTType = Map<string, Func>;

export interface Func {
  dtype: FuncType;
  params: Var[];
  body: Statement[];
}

export interface Var {
  dtype: Type;
  name: string;
}

export type Statement =
  | ReturnStmt
  | DeclareStmt
  | AssignStmt
  | CallStmt
  | IfStmt
  | ForStmt
  | WhileStmt;

export interface ReturnStmt {
  type: "return";
  value: Expr;
}
export interface DeclareStmt {
  type: "declare";
  dtype: Type;
  name: string;
  value: Expr | null;
}
export interface AssignStmt {
  type: "assign";
  name: string;
  value: Expr;
}
export interface CallStmt {
  type: "call";
  call: CallExpr;
}
export interface IfStmt {
  type: "if";
  conds: Condition[];
  else: Statement[] | null;
}
export interface Condition {
  cond: Expr;
  body: Statement[];
}
export interface ForStmt {
  type: "for";
  dtype: Type;
  name: string;
  init: Expr;
  end: Expr;
  call: CallExpr;
  body: Statement[];
}
export interface WhileStmt {
  type: "while";
  cond: Expr;
  body: Statement[];
}

export type Expr =
  | BoolLiteral
  | StringLiteral
  | Ident
  | AndExpr
  | OrExpr
  | NotExpr
  | EqExpr
  | NeExpr
  | GtExpr
  | LtExpr
  | GeExpr
  | LeExpr
  | CallExpr;

export interface CallExpr {
  type: "call";
  dtype: FuncType;
  args: Expr[];
  funcname: string;
}

export interface AndExpr {
  type: "and";
  left: Expr;
  right: Expr;
}
export interface OrExpr {
  type: "or";
  left: Expr;
  right: Expr;
}
export interface NotExpr {
  type: "not";
  value: Expr;
}
export interface EqExpr {
  type: "eq";
  dtype: Type;
  left: Expr;
  right: Expr;
}
export interface NeExpr {
  type: "ne";
  dtype: Type;
  left: Expr;
  right: Expr;
}
export interface GtExpr {
  type: "gt";
  dtype: Type;
  left: Expr;
  right: Expr;
}
export interface LtExpr {
  type: "lt";
  dtype: Type;
  left: Expr;
  right: Expr;
}
export interface GeExpr {
  type: "ge";
  dtype: Type;
  left: Expr;
  right: Expr;
}
export interface LeExpr {
  type: "le";
  dtype: Type;
  left: Expr;
  right: Expr;
}
export interface BoolLiteral {
  type: "bool";
  value: boolean;
}
export interface StringLiteral {
  type: "string";
  value: string;
}
export interface Ident {
  type: "ident";
  name: string;
}
