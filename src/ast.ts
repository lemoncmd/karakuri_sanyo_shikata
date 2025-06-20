export type ASTType = Func[]

export interface Func {type: "type", params: Param[], body: Statement[]}
export interface Param {dtype: DType, name: string}

export type DType = "数" | "文句" | "陰陽"


export type Statement = NoneStmt | ReturnStmt | DeclareStmt | AssignStmt | CallExpr | IfStmt | ForStmt | WhileStmt

export interface NoneStmt {type: "none"}
export interface ReturnStmt {type: "return", value: Expr}
export interface DeclareStmt {type: "declare", dtype: DType, name: string, value: Expr | null}
export interface AssignStmt {type: "assign", name: string, value: Expr}
export interface IfStmt {type: "if", conds: Condition[], else: Statement[] | null}
export interface Condition {cond: Expr, body: Statement[]}
export interface ForStmt {type: "for", dtype: DType, name: string, init: Expr, end: Expr, call: CallExpr, body: Statement[]}
export interface WhileStmt {type: "while", cond: Expr, body: Statement[]}


export type Expr = BoolLiteral | StringLiteral | Ident | AndExpr | OrExpr | NotExpr | EqExpr | NeExpr | GtExpr | LtExpr | GeExpr | LeExpr | CallExpr

export interface CallExpr {type: "call", args: Expr[], funcname: string}

export interface AndExpr {type: "and", left: Expr, right: Expr}
export interface OrExpr {type: "or", left: Expr, right: Expr}
export interface NotExpr {type: "not", value: Expr}
export interface EqExpr {type: "eq", left: Expr, right: Expr}
export interface NeExpr {type: "ne", left: Expr, right: Expr}
export interface GtExpr {type: "gt", left: Expr, right: Expr}
export interface LtExpr {type: "lt", left: Expr, right: Expr}
export interface GeExpr {type: "ge", left: Expr, right: Expr}
export interface LeExpr {type: "le", left: Expr, right: Expr}
export interface BoolLiteral {type: "bool", value: boolean}
export interface StringLiteral {type: "string", value: string}
export interface Ident {type: "ident", name: string}
