import { compile, compileAndLoadC } from "../../src/lib.ts";

test("陽を差戻函数", () => {
  const module = compileAndLoadC(
    compile(
      `
一、値之儀
陽を差戻し候
値之儀仍如件
    `,
      "c",
    ),
  );
  expect(module.func("値", "bool", [])()).toBe(true);
});
test("文句を差戻函数", () => {
  const module = compileAndLoadC(
    compile(
      `
一、値之儀
〽あヽ佳き天気を差戻し候
値之儀仍如件
    `,
      "c",
    ),
  );
  expect(module.func("値", "str", [])()).toBe("あヽ佳き天気");
});
test("陰を諄く差戻函数", () => {
  const module = compileAndLoadC(
    compile(
      `
一、値之儀
陰に御座候や否やを差戻し候
値之儀仍如件
    `,
      "c",
    ),
  );
  expect(module.func("値", "bool", [])()).toBe(false);
});
test("無御座変数不可見", () => {
  expect(() =>
    compile(
      `
一、甲之儀
乙を差戻し候
甲之儀仍如件
    `,
      "c",
    ),
  ).toThrow("変数乙不被見出候");
});
test("数を差戻函数", () => {
  const module = compileAndLoadC(
    compile(
      `
一、値之儀
壱億仟弐拾陸萬佰拾を差戻し候
値之儀仍如件
    `,
      "c",
    ),
  );
  expect(module.func("値", "double", [])()).toBe(110260110);
});
