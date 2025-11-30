import * as fs from "fs";
import * as os from "os";
import path from "path";
import * as nearley from "nearley";
import grammar from "../built-grammar/grammar.ts";
import { ASTType } from "./ast.ts";
import { check } from "./checker.ts";
import * as jsback from "./backends/js.ts";
import * as cback from "./backends/c99.ts";
import { execFileSync } from "child_process";
import * as koffi from "koffi";

export function compile(source: string, backend: "js" | "c" = "js"): string {
  const library = fs.readFileSync(
    path.resolve(__dirname, `../lib/builtin.${backend}.kss`),
    "utf-8",
  );
  const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
  parser.feed(library);
  parser.feed(source);
  if (parser.results.length > 1) {
    console.log(parser.results.length);
    console.error(
      "Grammar is ambiguous! Please report the source code to the developer! 文法曖昧に御座候故、源文を以て開発者へ御取次賜度候",
    );
  }
  if (parser.results.length === 0) {
    console.error("what");
  }
  const ast: ASTType = parser.results[0];
  const typed_ast = check(ast);
  switch (backend) {
    case "js":
      return jsback.generate(typed_ast);
    case "c":
      return cback.generate(typed_ast);
  }
}

export function compileAndLoadC(source: string): koffi.IKoffiLib {
  const tmpBase = fs.mkdtempSync(path.join(os.tmpdir(), "cffi-"));
  const cPath = path.join(tmpBase, "karakuriMain.c");
  const soPath = path.join(tmpBase, "libkarakuriMain.so");

  fs.writeFileSync(cPath, source);

  execFileSync("gcc", ["-shared", "-fPIC", "-O2", "-o", soPath, cPath], {
    stdio: "inherit",
  });

  const lib = koffi.load(soPath);

  fs.unlinkSync(cPath);
  fs.unlinkSync(soPath);
  fs.rmdirSync(tmpBase);
  return lib;
}
