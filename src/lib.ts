import * as fs from "fs";
import path from "path";
import * as nearley from "nearley";
import grammar from "../built-grammar/grammar.ts";
import { ASTType } from "./ast.ts";
import { check } from "./checker.ts";
import { generate } from "./backends/js.ts";

export function compile(source: string): string {
  const library = fs.readFileSync(
    path.resolve(__dirname, "../lib/builtin.kss"),
    "utf-8",
  );
  const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
  parser.feed(library);
  parser.feed(source);
  if (parser.results.length > 1) {
    console.error(
      "Grammar is ambiguous! Please report the source code to the developer! 文法曖昧に御座候故、源文を以て開発者へ御取次賜度候",
    );
  }
  if (parser.results.length === 0) {
    console.error("what");
  }
  const ast: ASTType = parser.results[0];
  const typed_ast = check(ast);
  const genjs = generate(typed_ast);
  return genjs;
}
