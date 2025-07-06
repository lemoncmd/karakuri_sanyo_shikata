import { compile } from "../src/lib.ts";
import requireFromString from "require-from-string";

test("何も不為関数", () => {
  const module = requireFromString(
    compile(`
一、無之儀
如斯御座候
無之儀仍如件
    `),
  );
  expect(typeof module.無).toBe("function");
  expect(module.無).not.toThrow();
});
test("陽を差戻関数", () => {
  const module = requireFromString(
    compile(`
一、値之儀
陽を差戻し候
値之儀仍如件
    `),
  );
  console.log(module);
  expect(typeof module.値).toBe("function");
  expect(module.値).not.toThrow();
  expect(module.値()).toBe(true);
});
