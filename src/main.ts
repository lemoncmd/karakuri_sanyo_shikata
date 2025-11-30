import * as fs from "fs";
import { argv } from "process";
import { compile, compileAndLoadC } from "./lib";
import requireFromString from "require-from-string";

const input = fs.readFileSync(argv[2], "utf-8");
const opts = argv.slice(3);
const backend = opts.includes("--backend=c") ? "c" : "js";
const output = compile(input, backend);
if (opts.includes("--run")) {
  switch (backend) {
    case "js": {
      const module = requireFromString(output);
      module.本丸();
      break;
    }
    case "c": {
      const lib = compileAndLoadC(output);
      lib.func("");
      break;
    }
  }
} else {
  console.log(output);
}
