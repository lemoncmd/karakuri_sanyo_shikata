import { compile } from "../src/lib.ts";
import requireFromString from "require-from-string";

test("或陰陽、別之陰陽に御座候や否やを問関数", () => {
  const module = requireFromString(
    compile(`
一、陰陽甲、陰陽乙を以御座之儀
甲、乙に御座候や否やを差戻し候
御座之儀仍如件
    `),
  );
  expect(typeof module.御座).toBe("function");
  expect(module.御座).not.toThrow();
  expect(module.御座(true, true)).toBe(true);
  expect(module.御座(true, false)).toBe(false);
  expect(module.御座(false, true)).toBe(false);
  expect(module.御座(false, false)).toBe(true);
});
test("或文句、別之文句に御座候や否やを問関数", () => {
  const module = requireFromString(
    compile(`
一、文句甲、文句乙を以御座之儀
甲、乙に御座候や否やを差戻し候
御座之儀仍如件
    `),
  );
  expect(typeof module.御座).toBe("function");
  expect(module.御座).not.toThrow();
  expect(module.御座("山", "山")).toBe(true);
  expect(module.御座("山", "川")).toBe(false);
});
test("或陰陽、別之文句に御座候や否や者不可問", () => {
  expect(() =>
    compile(`
一、甲之儀
陽、〽何奴ぢやに御座候や否やを差戻し候
甲之儀仍如件
    `),
  ).toThrow("左式と右式之型相異候");
});
test("或陰陽、別之陰陽に無御座候や否やを問関数", () => {
  const module = requireFromString(
    compile(`
一、陰陽甲、陰陽乙を以無御座之儀
甲、乙に無御座候や否やを差戻し候
無御座之儀仍如件
    `),
  );
  expect(typeof module.無御座).toBe("function");
  expect(module.無御座).not.toThrow();
  expect(module.無御座(true, true)).toBe(false);
  expect(module.無御座(true, false)).toBe(true);
  expect(module.無御座(false, true)).toBe(true);
  expect(module.無御座(false, false)).toBe(false);
});
test("或文句、別之文句に無御座候や否やを問関数", () => {
  const module = requireFromString(
    compile(`
一、文句甲、文句乙を以無御座之儀
甲、乙に無御座候や否やを差戻し候
無御座之儀仍如件
    `),
  );
  expect(typeof module.無御座).toBe("function");
  expect(module.無御座).not.toThrow();
  expect(module.無御座("山", "山")).toBe(false);
  expect(module.無御座("山", "川")).toBe(true);
});
test("或陰陽且別之陰陽を問関数", () => {
  const module = requireFromString(
    compile(`
一、陰陽甲、陰陽乙を以且之儀
甲に御座候且乙に御座候や否やを差戻し候
且之儀仍如件
    `),
  );
  expect(typeof module.且).toBe("function");
  expect(module.且).not.toThrow();
  expect(module.且(true, true)).toBe(true);
  expect(module.且(true, false)).toBe(false);
  expect(module.且(false, true)).toBe(false);
  expect(module.且(false, false)).toBe(false);
});
test("或陰陽又ハ別之陰陽を問関数", () => {
  const module = requireFromString(
    compile(`
一、陰陽甲、陰陽乙を以又ハ之儀
甲に御座候又ハ乙に御座候や否やを差戻し候
又ハ之儀仍如件
    `),
  );
  expect(typeof module.又ハ).toBe("function");
  expect(module.又ハ).not.toThrow();
  expect(module.又ハ(true, true)).toBe(true);
  expect(module.又ハ(true, false)).toBe(true);
  expect(module.又ハ(false, true)).toBe(true);
  expect(module.又ハ(false, false)).toBe(false);
});
test("或陰陽ニ非事を問関数", () => {
  const module = requireFromString(
    compile(`
一、陰陽甲を以非之儀
甲に御座候ニ非候や否やを差戻し候
非之儀仍如件
    `),
  );
  expect(typeof module.非).toBe("function");
  expect(module.非).not.toThrow();
  expect(module.非(true)).toBe(false);
  expect(module.非(false)).toBe(true);
});
test("非陰陽者且又ハニ非に不可問", () => {
  expect(() =>
    compile(`
一、甲之儀
陽に御座候且〽何奴ぢやに御座候や否やを差戻し候
甲之儀仍如件
    `),
  ).toThrow("右条件式陰陽に無御座候");
  expect(() =>
    compile(`
一、甲之儀
〽何奴ぢやに御座候又ハ陽に御座候や否やを差戻し候
甲之儀仍如件
    `),
  ).toThrow("左条件式陰陽に無御座候");
  expect(() =>
    compile(`
一、甲之儀
〽何奴ぢやに御座候ニ非候や否やを差戻し候
甲之儀仍如件
    `),
  ).toThrow("条件式陰陽に無御座候");
});
