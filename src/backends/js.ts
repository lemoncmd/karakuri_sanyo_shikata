import { Expr, Func, Statement, TypedASTType } from "../typed_ast";

export function generate(ast: TypedASTType): string {
  return new Generator().generate(ast);
}

class Generator {
  result: string = "";
  indent: number = 0;
  bol: boolean = true;
  print(str: string) {
    if (this.bol && str !== "") {
      this.result += "\t".repeat(this.indent);
      this.bol = false;
    }
    this.result += str;
  }
  println(str: string = "") {
    this.print(str);
    this.result += "\n";
    this.bol = true;
  }

  generate(ast: TypedASTType): string {
    ast.forEach((func, name) => this.generateFunc(func, name));
    return this.result;
  }
  generateFunc(func: Func, name: string) {
    this.print(`export function ${name}(`);
    this.print(func.params.map((param) => param.name).join(", "));
    this.println(") {");
    this.indent++;
    func.body.forEach((stmt) => this.generateStmt(stmt));
    this.indent--;
    this.println("}");
    this.println();
  }
  generateStmt(stmt: Statement) {
    switch (stmt.type) {
      case "return":
        this.println(`return ${this.generateExpr(stmt.value)};`);
        break;
      case "declare":
        this.print(`let ${stmt.variable.name}`);
        if (stmt.value !== null) {
          this.print(` = ${this.generateExpr(stmt.value)}`);
        }
        this.println(";");
        break;
      case "assign":
        this.println(
          `${stmt.variable.name} = ${this.generateExpr(stmt.value)};`,
        );
        break;
      case "call":
        this.println(`${this.generateExpr(stmt.call)};`);
        break;
      case "if":
        stmt.conds.forEach((cond) => {
          this.println(`if (${this.generateExpr(cond.cond)}) {`);
          this.indent++;
          cond.body.forEach((stmt) => this.generateStmt(stmt));
          this.indent--;
          this.print(`} else `);
        });
        if (stmt.else !== null) {
          this.println(`{`);
          this.indent++;
          stmt.else.forEach((stmt) => this.generateStmt(stmt));
          this.indent--;
          this.println(`}`);
        } else {
          this.println(";");
        }
        break;
      case "for":
        this.print("for (");
        this.print(
          `let ${stmt.variable.name} = ${this.generateExpr(stmt.init)};`,
        );
        this.print(`${stmt.variable.name} !== ${this.generateExpr(stmt.end)};`);
        this.println(
          `${stmt.variable.name} = ${stmt.call.funcname}(${stmt.variable.name}, ${stmt.call.args.map((arg) => this.generateExpr(arg)).join(", ")})) {`,
        );
        this.indent++;
        stmt.body.forEach((stmt) => this.generateStmt(stmt));
        this.indent--;
        this.println("}");
        throw "todo";
      case "while":
        this.println(`while (${this.generateExpr(stmt.cond)}) {`);
        this.indent++;
        stmt.body.forEach((stmt) => this.generateStmt(stmt));
        this.indent--;
        this.println("}");
        break;
      default:
        const _exhaustiveCheck: never = stmt;
        throw "unreachable";
    }
  }
  generateExpr(expr: Expr): string {
    switch (expr.type) {
      case "string":
        return `"${expr.value}"`;
      case "bool":
        return `${expr.value}`;
      case "ident":
        return `${expr.variable.name}`;
      case "and":
        return `(${this.generateExpr(expr.left)}) && (${this.generateExpr(expr.right)})`;
      case "or":
        return `(${this.generateExpr(expr.left)}) || (${this.generateExpr(expr.right)})`;
      case "not":
        return `!(${this.generateExpr(expr.value)})`;
      case "eq":
        return `(${this.generateExpr(expr.left)}) === (${this.generateExpr(expr.right)})`;
      case "ne":
        return `(${this.generateExpr(expr.left)}) !== (${this.generateExpr(expr.right)})`;
      case "gt":
        return `(${this.generateExpr(expr.left)}) > (${this.generateExpr(expr.right)})`;
      case "lt":
        return `(${this.generateExpr(expr.left)}) < (${this.generateExpr(expr.right)})`;
      case "ge":
        return `(${this.generateExpr(expr.left)}) >= (${this.generateExpr(expr.right)})`;
      case "le":
        return `(${this.generateExpr(expr.left)}) <= (${this.generateExpr(expr.right)})`;
      case "call":
        return `${expr.funcname}(${expr.args.map((arg) => this.generateExpr(arg)).join(", ")})`;
    }
  }
}
