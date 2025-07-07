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
test("何も不辺関数呼付", () => {
  const module = requireFromString(
    compile(`
一、無之儀
如斯御座候
無之儀仍如件
一、子之儀
無之儀を致し候
子之儀仍如件
    `),
  );
  expect(typeof module.子).toBe("function");
  expect(module.子).not.toThrow();
});
test("単変数関数", () => {
  const module = requireFromString(
    compile(`
一、陰陽甲を以単変数関数之儀
甲を差戻し候
単変数関数之儀仍如件
    `),
  );
  expect(typeof module.単変数関数).toBe("function");
  expect(module.単変数関数).not.toThrow();
  expect(module.単変数関数(true)).toBe(true);
  expect(module.単変数関数(false)).toBe(false);
});
test("多変数関数", () => {
  const module = requireFromString(
    compile(`
一、陰陽甲、文句乙を以多変数関数之儀
乙を差戻し候
多変数関数之儀仍如件
    `),
  );
  expect(typeof module.多変数関数).toBe("function");
  expect(module.多変数関数).not.toThrow();
  expect(module.多変数関数(true, "foo")).toBe("foo");
  expect(module.多変数関数(false, "bar")).toBe("bar");
});
test("単変数関数呼付", () => {
  const module = requireFromString(
    compile(`
一、陰陽甲を以子之儀
甲を差戻し候
子之儀仍如件
一、陰陽甲を以丑之儀
甲を以子之儀を致し候段を差戻し候
丑之儀仍如件
    `),
  );
  expect(typeof module.子).toBe("function");
  expect(typeof module.丑).toBe("function");
  expect(module.丑).not.toThrow();
  expect(module.丑(true)).toBe(true);
  expect(module.丑(false)).toBe(false);
});
test("多変数関数呼付", () => {
  const module = requireFromString(
    compile(`
一、文句甲、文句乙、文句丙を以子之儀
乙を差戻し候
子之儀仍如件
一、文句甲、文句乙、文句丙を以丑之儀
乙、丙、甲を以子之儀を致し候段を差戻し候
丑之儀仍如件
    `),
  );
  expect(typeof module.子).toBe("function");
  expect(typeof module.丑).toBe("function");
  expect(module.丑).not.toThrow();
  expect(module.丑("甲", "乙", "丙")).toBe("丙");
});
test("相異る型之値不可差戻", () => {
  expect(() =>
    compile(`
一、甲之儀
陽を差戻し候て
〽あヽを差戻し候
甲之儀仍如件
    `),
  ).toThrow("戻値之型先と相異候");
});
