import { FuncType, Type } from "./type";

export type TypedASTType = Map<string, Func>;

export type Func = {
  dtype: FuncType;
  params: Var[];
  body: Statement[];
};

export type Var = {
  dtype: Type;
  name: string;
};

export type Statement =
  | ReturnStmt
  | DeclareStmt
  | AssignStmt
  | CallStmt
  | IfStmt
  | ForStmt
  | WhileStmt;

export type ReturnStmt = {
  type: "return";
  value: Expr;
};
export type DeclareStmt = {
  type: "declare";
  variable: Var;
  value: Expr | null;
};
export type AssignStmt = {
  type: "assign";
  variable: Var;
  value: Expr;
};
export type CallStmt = {
  type: "call";
  call: CallExpr;
};
export type IfStmt = {
  type: "if";
  conds: Condition[];
  else: Statement[] | null;
};
export type Condition = {
  cond: Expr;
  body: Statement[];
};
export type ForStmt = {
  type: "for";
  variable: Var;
  init: Expr;
  end: Expr;
  call: CallExpr;
  body: Statement[];
};
export type WhileStmt = {
  type: "while";
  cond: Expr;
  body: Statement[];
};

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

export type CallExpr = {
  type: "call";
  dtype: FuncType;
  args: Expr[];
  funcname: string;
};

export type AndExpr = {
  type: "and";
  left: Expr;
  right: Expr;
};
export type OrExpr = {
  type: "or";
  left: Expr;
  right: Expr;
};
export type NotExpr = {
  type: "not";
  value: Expr;
};
export type EqExpr = {
  type: "eq";
  dtype: Type;
  left: Expr;
  right: Expr;
};
export type NeExpr = {
  type: "ne";
  dtype: Type;
  left: Expr;
  right: Expr;
};
export type GtExpr = {
  type: "gt";
  dtype: Type;
  left: Expr;
  right: Expr;
};
export type LtExpr = {
  type: "lt";
  dtype: Type;
  left: Expr;
  right: Expr;
};
export type GeExpr = {
  type: "ge";
  dtype: Type;
  left: Expr;
  right: Expr;
};
export type LeExpr = {
  type: "le";
  dtype: Type;
  left: Expr;
  right: Expr;
};
export type BoolLiteral = {
  type: "bool";
  value: boolean;
};
export type StringLiteral = {
  type: "string";
  value: string;
};
export type Ident = {
  type: "ident";
  variable: Var;
};
