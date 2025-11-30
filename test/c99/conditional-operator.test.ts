import { compile, compileAndLoadC } from "../../src/lib.ts";

test("或陰陽、別之陰陽に御座候や否やを問函数", () => {
  const module = compileAndLoadC(
    compile(
      `
一、陰陽甲、陰陽乙を以御座之儀
甲、乙に御座候や否やを差戻し候
御座之儀仍如件
    `,
      "c",
    ),
  );
  const 御座 = module.func("御座", "bool", ["bool", "bool"]);
  expect(御座(true, true)).toBe(true);
  expect(御座(true, false)).toBe(false);
  expect(御座(false, true)).toBe(false);
  expect(御座(false, false)).toBe(true);
});
test("或文句、別之文句に御座候や否やを問函数", () => {
  const module = compileAndLoadC(
    compile(
      `
一、文句甲、文句乙を以御座之儀
甲、乙に御座候や否やを差戻し候
御座之儀仍如件
    `,
      "c",
    ),
  );
  const 御座 = module.func("御座", "bool", ["str", "str"]);
  expect(御座("山", "山")).toBe(true);
  expect(御座("山", "川")).toBe(false);
});
test("或陰陽、別之文句に御座候や否や者不可問", () => {
  expect(() =>
    compile(
      `
一、甲之儀
陽、〽何奴ぢやに御座候や否やを差戻し候
甲之儀仍如件
    `,
      "c",
    ),
  ).toThrow("左式と右式之型相異候");
});
test("或陰陽、別之陰陽に無御座候や否やを問函数", () => {
  const module = compileAndLoadC(
    compile(
      `
一、陰陽甲、陰陽乙を以無御座之儀
甲、乙に無御座候や否やを差戻し候
無御座之儀仍如件
    `,
      "c",
    ),
  );
  const 無御座 = module.func("無御座", "bool", ["bool", "bool"]);
  expect(無御座(true, true)).toBe(false);
  expect(無御座(true, false)).toBe(true);
  expect(無御座(false, true)).toBe(true);
  expect(無御座(false, false)).toBe(false);
});
test("或文句、別之文句に無御座候や否やを問函数", () => {
  const module = compileAndLoadC(
    compile(
      `
一、文句甲、文句乙を以無御座之儀
甲、乙に無御座候や否やを差戻し候
無御座之儀仍如件
    `,
      "c",
    ),
  );
  const 無御座 = module.func("無御座", "bool", ["str", "str"]);
  expect(無御座("山", "山")).toBe(false);
  expect(無御座("山", "川")).toBe(true);
});
test("或陰陽且別之陰陽を問函数", () => {
  const module = compileAndLoadC(
    compile(
      `
一、陰陽甲、陰陽乙を以且之儀
甲に御座候且乙に御座候や否やを差戻し候
且之儀仍如件
    `,
      "c",
    ),
  );
  const 且 = module.func("且", "bool", ["bool", "bool"]);
  expect(且(true, true)).toBe(true);
  expect(且(true, false)).toBe(false);
  expect(且(false, true)).toBe(false);
  expect(且(false, false)).toBe(false);
});
test("或陰陽又ハ別之陰陽を問函数", () => {
  const module = compileAndLoadC(
    compile(
      `
一、陰陽甲、陰陽乙を以又ハ之儀
甲に御座候又ハ乙に御座候や否やを差戻し候
又ハ之儀仍如件
    `,
      "c",
    ),
  );
  const 又ハ = module.func("又ハ", "bool", ["bool", "bool"]);
  expect(又ハ(true, true)).toBe(true);
  expect(又ハ(true, false)).toBe(true);
  expect(又ハ(false, true)).toBe(true);
  expect(又ハ(false, false)).toBe(false);
});
test("或陰陽ニ非事を問函数", () => {
  const module = compileAndLoadC(
    compile(
      `
一、陰陽甲を以非之儀
甲に御座候ニ非候や否やを差戻し候
非之儀仍如件
    `,
      "c",
    ),
  );
  const 非 = module.func("非", "bool", ["bool"]);
  expect(非(true)).toBe(false);
  expect(非(false)).toBe(true);
});
test("非陰陽者且又ハニ非に不可問", () => {
  expect(() =>
    compile(
      `
一、甲之儀
陽に御座候且〽何奴ぢやに御座候や否やを差戻し候
甲之儀仍如件
    `,
      "c",
    ),
  ).toThrow("右条件式陰陽に無御座候");
  expect(() =>
    compile(
      `
一、甲之儀
〽何奴ぢやに御座候又ハ陽に御座候や否やを差戻し候
甲之儀仍如件
    `,
      "c",
    ),
  ).toThrow("左条件式陰陽に無御座候");
  expect(() =>
    compile(
      `
一、甲之儀
〽何奴ぢやに御座候ニ非候や否やを差戻し候
甲之儀仍如件
    `,
      "c",
    ),
  ).toThrow("条件式陰陽に無御座候");
});
