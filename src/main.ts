import * as fs from "fs";
import { argv } from "process";
import { compile } from "./lib";

const input = fs.readFileSync(argv[2], "utf-8");
console.log(compile(input));
