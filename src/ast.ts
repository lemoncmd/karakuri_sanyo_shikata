export type ASTType = Func[];

export type Func = {
  type: "func";
  params: Param[];
  name: string;
  body: Statement[];
};
export type Param = {
  dtype: DType;
  name: string;
};

export type DType = "数" | "文句" | "陰陽";

export type Statement =
  | NoneStmt
  | ReturnStmt
  | DeclareStmt
  | AssignStmt
  | CallExpr
  | InlineStmt
  | IfStmt
  | ForStmt
  | WhileStmt;

export type NoneStmt = {
  type: "none";
};
export type ReturnStmt = {
  type: "return";
  value: Expr;
};
export type DeclareStmt = {
  type: "declare";
  dtype: DType;
  name: string;
  value: Expr | null;
};
export type AssignStmt = {
  type: "assign";
  name: string;
  value: Expr;
};
export type InlineStmt = {
  type: "inline";
  content: string;
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
  dtype: DType;
  name: string;
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
  | NumberLiteral
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
  left: Expr;
  right: Expr;
};
export type NeExpr = {
  type: "ne";
  left: Expr;
  right: Expr;
};
export type GtExpr = {
  type: "gt";
  left: Expr;
  right: Expr;
};
export type LtExpr = {
  type: "lt";
  left: Expr;
  right: Expr;
};
export type GeExpr = {
  type: "ge";
  left: Expr;
  right: Expr;
};
export type LeExpr = {
  type: "le";
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
export type NumberLiteral = {
  type: "number";
  value: string;
};
export type Ident = {
  type: "ident";
  name: string;
};
