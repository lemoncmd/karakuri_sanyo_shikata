import { compile, compileAndLoadC } from "../../src/lib.ts";

test("何も不為函数", () => {
  const module = compileAndLoadC(
    compile(
      `
一、無之儀
如斯御座候
無之儀仍如件
    `,
      "c",
    ),
  );
  expect(module.func("無", "void", [])).not.toThrow();
});
test("何も不辺函数呼付", () => {
  const module = compileAndLoadC(
    compile(
      `
一、無之儀
如斯御座候
無之儀仍如件
一、子之儀
無之儀を致し候
子之儀仍如件
    `,
      "c",
    ),
  );
  expect(module.func("子", "void", [])).not.toThrow();
});
test("単変数函数", () => {
  const module = compileAndLoadC(
    compile(
      `
一、陰陽甲を以単変数函数之儀
甲を差戻し候
単変数函数之儀仍如件
    `,
      "c",
    ),
  );
  const 単変数函数 = module.func("単変数函数", "bool", ["bool"]);
  expect(単変数函数(true)).toBe(true);
  expect(単変数函数(false)).toBe(false);
});
test("多変数函数", () => {
  const module = compileAndLoadC(
    compile(
      `
一、陰陽甲、文句乙を以多変数函数之儀
乙を差戻し候
多変数函数之儀仍如件
    `,
      "c",
    ),
  );
  const 多変数函数 = module.func("多変数函数", "str", ["bool", "str"]);
  expect(多変数函数(true, "foo")).toBe("foo");
  expect(多変数函数(false, "bar")).toBe("bar");
});
test("単変数函数呼付", () => {
  const module = compileAndLoadC(
    compile(
      `
一、陰陽甲を以子之儀
甲を差戻し候
子之儀仍如件
一、陰陽甲を以丑之儀
甲を以子之儀を致し候段を差戻し候
丑之儀仍如件
    `,
      "c",
    ),
  );
  const 丑 = module.func("丑", "bool", ["bool"]);
  expect(丑(true)).toBe(true);
  expect(丑(false)).toBe(false);
});
test("多変数函数呼付", () => {
  const module = compileAndLoadC(
    compile(
      `
一、文句甲、文句乙、文句丙を以子之儀
乙を差戻し候
子之儀仍如件
一、文句甲、文句乙、文句丙を以丑之儀
乙、丙、甲を以子之儀を致し候段を差戻し候
丑之儀仍如件
    `,
      "c",
    ),
  );
  const 丑 = module.func("丑", "str", ["str", "str", "str"]);
  expect(丑("甲", "乙", "丙")).toBe("丙");
});
test("相異る型之値不可差戻", () => {
  expect(() =>
    compile(
      `
一、甲之儀
陽を差戻し候て
〽あヽを差戻し候
甲之儀仍如件
    `,
      "c",
    ),
  ).toThrow("戻値之型先と相異候");
});
test("再帰函数", () => {
  const module = compileAndLoadC(
    compile(
      `
一、数甲を以ひぼなつち之儀
若甲、零に御座候ハヽ
　零を差戻し候事
若甲、壱に御座候ハヽ
　壱を差戻し候事
或数をして乙と致し候て
甲、壱を以引き乙と致し候て
乙を以ひぼなつち之儀をして乙と致し候て
或数をして丙と致し候て
甲、弐を以引き丙と致し候て
丙を以ひぼなつち之儀をして丙と致し候て
乙、丙を以足し乙と致し候て
乙を差戻し候
ひぼなつち之儀仍如件
    `,
      "c",
    ),
  );
  const ひぼなつち = module.func("ひぼなつち", "double", ["double"]);
  expect(ひぼなつち(0)).toBe(0);
  expect(ひぼなつち(1)).toBe(1);
  expect(ひぼなつち(2)).toBe(1);
  expect(ひぼなつち(3)).toBe(2);
  expect(ひぼなつち(4)).toBe(3);
  expect(ひぼなつち(5)).toBe(5);
  expect(ひぼなつち(6)).toBe(8);
});
