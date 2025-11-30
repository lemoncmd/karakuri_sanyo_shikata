import { Type } from "../type";
import { Expr, Func, Statement, TypedASTType } from "../typed_ast";

export function generate(ast: TypedASTType): string {
  return new Generator().generate(ast);
}

class Generator {
  headers: string[] = [];
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
    if (this.headers.length > 0) {
      this.result = this.headers.join("\n\n") + "\n" + this.result;
    }
    return this.result;
  }
  generateType(t: Type) {
    switch (t.type) {
      case "void":
        return "void";
      case "number":
        return "double";
      case "string":
        return "const char *";
      case "bool":
        return "int";
      case "unknown":
        throw `Internal compiler error: 'unknown' should already be resolved in the frontend`;
      default:
        throw `Unsupported type for C99 backend: ${t.type}`;
    }
  }
  generateFunc(func: Func, name: string) {
    let result_type: Type = func.dtype.res;
    this.print(`${this.generateType(result_type)} ${name}(`);
    this.print(
      func.params
        .map((param) => `${this.generateType(param.dtype)} ${param.name}`)
        .join(", "),
    );
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
        let t: Type = stmt.variable.dtype;
        this.print(`${this.generateType(t)} ${stmt.variable.name}`);
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
      case "inline":
        let content = stmt.content.trim();
        switch (content.slice(0, 2)) {
          case "前書":
            this.headers.push(`${content.slice(2)}`);
            break;
          case "本文":
            this.println(`${content.slice(2)}`);
            break;
          default:
            throw "C FFI must start with either '椎言葉にて前書' or '椎言葉にて本文'. 〽椎言葉にて前書とも〽椎言葉にて本文とも不申は致間敷候";
        }
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
          `${this.generateType(stmt.variable.dtype)} ${stmt.variable.name} = ${this.generateExpr(stmt.init)};`,
        );
        this.print(`${stmt.variable.name} != ${this.generateExpr(stmt.end)};`);
        this.println(
          `${stmt.variable.name} = ${stmt.call.funcname}(${stmt.call.args.map((arg) => this.generateExpr(arg)).join(", ")})) {`,
        );
        this.indent++;
        stmt.body.forEach((stmt) => this.generateStmt(stmt));
        this.indent--;
        this.println("}");
        break;
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
        return `${expr.value ? 1 : 0}`;
      case "number":
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
        return `(${this.generateExpr(expr.left)}) == (${this.generateExpr(expr.right)})`;
      case "ne":
        return `(${this.generateExpr(expr.left)}) != (${this.generateExpr(expr.right)})`;
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
