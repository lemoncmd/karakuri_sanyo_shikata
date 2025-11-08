import * as fs from "fs";
import { argv } from "process";
import { compile } from "./lib";
import requireFromString from "require-from-string";

const input = fs.readFileSync(argv[2], "utf-8");
if (argv[3] === "--run") {
  const module = requireFromString(compile(input));
  module.本丸();
} else {
  console.log(compile(input));
}
