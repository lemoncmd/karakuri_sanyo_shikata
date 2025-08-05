import { compile } from "../src/lib.ts";
import requireFromString from "require-from-string";

test("陽や否やを尋候関数", () => {
  const module = requireFromString(
    compile(`
一、陰陽甲を以真偽之儀
若甲に御座候ハヽ
  〽これぢやを差戻し候事
〽これぢやあらぬを差戻し候
真偽之儀仍如件
    `),
  );
  expect(typeof module.真偽).toBe("function");
  expect(module.真偽).not.toThrow();
  expect(module.真偽(true)).toBe("これぢや");
  expect(module.真偽(false)).toBe("これぢやあらぬ");
});
test("陽や否やを尋候関数弐", () => {
  const module = requireFromString(
    compile(`
一、陰陽甲を以真偽之儀
若甲に御座候ハヽ
  〽これぢやを差戻し候て
不然
  〽これぢやあらぬを差戻し候事
〽なんぢやを差戻し候
真偽之儀仍如件
    `),
  );
  expect(typeof module.真偽).toBe("function");
  expect(module.真偽).not.toThrow();
  expect(module.真偽(true)).toBe("これぢや");
  expect(module.真偽(false)).toBe("これぢやあらぬ");
});
test("選び候関数", () => {
  const module = requireFromString(
    compile(`
一、陰陽甲、陰陽乙を以真偽之儀
若甲に御座候ハヽ
  〽ひとつめを差戻し候て
不然若乙に御座候ハヽ
  〽ふたつめを差戻し候事
〽なんぢやを差戻し候
真偽之儀仍如件
    `),
  );
  expect(typeof module.真偽).toBe("function");
  expect(module.真偽).not.toThrow();
  expect(module.真偽(true, false)).toBe("ひとつめ");
  expect(module.真偽(false, true)).toBe("ふたつめ");
  expect(module.真偽(false, false)).toBe("なんぢや");
});
test("選び候関数弐", () => {
  const module = requireFromString(
    compile(`
一、陰陽甲、陰陽乙を以真偽之儀
若甲に御座候ハヽ
  〽ひとつめを差戻し候て
不然若乙に御座候ハヽ
  〽ふたつめを差戻し候て
不然
  〽みつめを差戻し候事
〽なんぢやを差戻し候
真偽之儀仍如件
    `),
  );
  expect(typeof module.真偽).toBe("function");
  expect(module.真偽).not.toThrow();
  expect(module.真偽(true, false)).toBe("ひとつめ");
  expect(module.真偽(false, true)).toBe("ふたつめ");
  expect(module.真偽(false, false)).toBe("みつめ");
});
test("文句を不可尋", () => {
  expect(() =>
    compile(`
一、文句甲を以真偽之儀
若甲に御座候ハヽ
  〽これぢやを差戻し候事
〽これぢやあらぬを差戻し候
真偽之儀仍如件
    `),
  ).toThrow("条件式陰陽に無御座候");
});
test("不回関数", () => {
  const module = requireFromString(
    compile(`
一、回之儀
陰に御座候限
  〽回りまするを差戻し候事
〽もつと回さぬかを差戻し候
回之儀仍如件
    `),
  );
  expect(typeof module.回).toBe("function");
  expect(module.回).not.toThrow();
  expect(module.回()).toBe("もつと回さぬか");
});
test("文句を不可回", () => {
  expect(() =>
    compile(`
一、文句甲を以真偽之儀
甲に御座候限
  〽これぢやを差戻し候事
〽これぢやあらぬを差戻し候
真偽之儀仍如件
    `),
  ).toThrow("条件式陰陽に無御座候");
});
test("一回関数", () => {
  const module = requireFromString(
    compile(`
一、陰陽甲を以子之儀
陽を差戻し候
子之儀仍如件
一、丑之儀
毎々陰陽甲を陰ゟ陽迄子之儀を致し候乍
  〽回りまするを差戻し候事
〽もつと回さぬかを差戻し候
丑之儀仍如件
一、寅之儀
毎々陰陽甲を陰ゟ陽迄子之儀を致し候乍
  如斯御座候事
〽回つた回つたを差戻し候
寅之儀仍如件
    `),
  );
  expect(typeof module.丑).toBe("function");
  expect(typeof module.寅).toBe("function");
  expect(module.丑).not.toThrow();
  expect(module.寅).not.toThrow();
  expect(module.丑()).toBe("回りまする");
  expect(module.寅()).toBe("回つた回つた");
});
test("毎々之初期値之型不可異", () => {
  expect(() =>
    compile(`
一、陰陽甲を以子之儀
陽を差戻し候
子之儀仍如件
一、丑之儀
毎々陰陽甲を〽あヽゟ陽迄子之儀を致し候乍
  〽回りまするを差戻し候事
〽もつと回さぬかを差戻し候
丑之儀仍如件
一、寅之儀
毎々陰陽甲を陰ゟ陽迄子之儀を致し候乍
  如斯御座候事
〽回つた回つたを差戻し候
寅之儀仍如件
    `),
  ).toThrow("初期値之型相異候");
});
test("毎々之終値之型不可異", () => {
  expect(() =>
    compile(`
一、陰陽甲を以子之儀
陽を差戻し候
子之儀仍如件
一、丑之儀
毎々陰陽甲を陰ゟ〽あヽ迄子之儀を致し候乍
  〽回りまするを差戻し候事
〽もつと回さぬかを差戻し候
丑之儀仍如件
一、寅之儀
毎々陰陽甲を陰ゟ陽迄子之儀を致し候乍
  如斯御座候事
〽回つた回つたを差戻し候
寅之儀仍如件
    `),
  ).toThrow("終値之型相異候");
});

test("変数に蓄候", () => {
  const module = requireFromString(
    compile(`
一、陰陽甲を以子之儀
或文句をして乙と致し候て
若甲に御座候ハヽ
  〽よろしきをして乙と致し候て
不然
  〽あしきをして乙と致し候事
乙を差戻し候
子之儀仍如件
    `),
  );
  expect(typeof module.子).toBe("function");
  expect(module.子).not.toThrow();
  expect(module.子(true)).toBe("よろしき");
  expect(module.子(false)).toBe("あしき");
});
test("型之異なる変数に不可蓄", () => {
  expect(() =>
    compile(`
一、子之儀
或陰陽をして乙と致し候て
〽わろきをして乙と致し候
子之儀仍如件
    `),
  ).toThrow("値と変数之型相異候");
});
test("度重なる変数に不可蓄", () => {
  expect(() =>
    compile(`
一、子之儀
或陰陽をして乙と致し候て
或陰陽をして乙と致し候
子之儀仍如件
    `),
  ).toThrow("既ニ乙被宣言候");
});
test("無き変数に不可蓄", () => {
  expect(() =>
    compile(`
一、子之儀
〽わろきをして乙と致し候
子之儀仍如件
    `),
  ).toThrow("変数乙不被見出候");
});
test("初期値を以変数に蓄候", () => {
  const module = requireFromString(
    compile(`
一、陰陽甲を以子之儀
〽あしきと云文句をして乙と致し候て
若甲に御座候ハヽ
  〽よろしきをして乙と致し候事
乙を差戻し候
子之儀仍如件
    `),
  );
  expect(typeof module.子).toBe("function");
  expect(module.子).not.toThrow();
  expect(module.子(true)).toBe("よろしき");
  expect(module.子(false)).toBe("あしき");
});
test("戻値を以変数に蓄候", () => {
  const module = requireFromString(
    compile(`
一、陰陽甲を以子之儀
〽あしきと云文句をして乙と致し候て
若甲に御座候ハヽ
  丑之儀をして乙と致し候事
乙を差戻し候
子之儀仍如件
一、丑之儀
〽よろしきを差戻し候
丑之儀仍如件
    `),
  );
  expect(typeof module.子).toBe("function");
  expect(module.子).not.toThrow();
  expect(module.子(true)).toBe("よろしき");
  expect(module.子(false)).toBe("あしき");
});
test("型之異なる初期値を以変数に不可蓄", () => {
  expect(() =>
    compile(`
一、子之儀
〽わろきと云陰陽をして乙と致し候
子之儀仍如件
    `),
  ).toThrow("初期値と変数之型相異候");
});
test("南蛮人之台詞", () => {
  const module = requireFromString(
    compile(`
一、文句甲、文句乙を以続け書之儀
南蛮人、爪哇国台詞にて
甲 = 甲 + 乙;
と申上候て
甲を差戻し候
続け書之儀仍如件
    `),
  );
  expect(typeof module.続け書).toBe("function");
  expect(module.続け書).not.toThrow();
  expect(module.続け書("びっくり下谷の", "広徳寺")).toBe(
    "びっくり下谷の広徳寺",
  );
});
