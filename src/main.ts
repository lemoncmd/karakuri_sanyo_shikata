import * as fs from "fs";
import grammar from "../built-grammar/grammar.ts";
import * as nearley from "nearley";
import {ASTType} from "./ast.ts";

const input = fs.readFileSync("test/sample.kss", "utf-8");
const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
parser.feed(input);
if (parser.results.length > 1) {
  console.error("Grammar is ambiguous! Please report the source code to the developer! 文法曖昧に候故、源文を以て開発者へ御取次賜度候");
}
const ast: ASTType = parser.results[0];
console.log(JSON.stringify(ast));
