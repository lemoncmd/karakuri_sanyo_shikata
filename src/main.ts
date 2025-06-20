import * as fs from "fs";
import * as grammar from "../built-grammar/grammar.js";
import * as nearley from "nearley";

const input = fs.readFileSync("test/sample.kss", "utf-8");
const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
parser.feed(input);
if (parser.results.length > 1) {
  console.error("Grammar is ambiguous! Please report the source code to the developer! 文法曖昧に候故、源文を以て開発者へ御取次賜度候");
}
console.log(JSON.stringify(parser.results[0]));
