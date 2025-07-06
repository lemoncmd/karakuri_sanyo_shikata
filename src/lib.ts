import grammar from "../built-grammar/grammar.ts";
import * as nearley from "nearley";
import { ASTType } from "./ast.ts";
import { check } from "./checker.ts";
import { generate } from "./backends/js.ts";

export function compile(source: string): string {
  const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
  parser.feed(source);
  if (parser.results.length > 1) {
    console.error(
      "Grammar is ambiguous! Please report the source code to the developer! 文法曖昧に候故、源文を以て開発者へ御取次賜度候",
    );
  }
  const ast: ASTType = parser.results[0];
  const typed_ast = check(ast);
  const genjs = generate(typed_ast);
  return genjs;
}
