import { compile, compileAndLoadC } from "../../src/lib.ts";

test("陽や否やを尋候函数", () => {
  const module = compileAndLoadC(
    compile(
      `
一、陰陽甲を以真偽之儀
若甲に御座候ハヽ
  〽これぢやを差戻し候事
〽これぢやあらぬを差戻し候
真偽之儀仍如件
    `,
      "c",
    ),
  );
  const 真偽 = module.func("真偽", "str", ["bool"]);
  expect(真偽(true)).toBe("これぢや");
  expect(真偽(false)).toBe("これぢやあらぬ");
});
test("陽や否やを尋候函数弐", () => {
  const module = compileAndLoadC(
    compile(
      `
一、陰陽甲を以真偽之儀
若甲に御座候ハヽ
  〽これぢやを差戻し候て
不然
  〽これぢやあらぬを差戻し候事
〽なんぢやを差戻し候
真偽之儀仍如件
    `,
      "c",
    ),
  );
  const 真偽 = module.func("真偽", "str", ["bool"]);
  expect(真偽(true)).toBe("これぢや");
  expect(真偽(false)).toBe("これぢやあらぬ");
});
test("選び候函数", () => {
  const module = compileAndLoadC(
    compile(
      `
一、陰陽甲、陰陽乙を以真偽之儀
若甲に御座候ハヽ
  〽ひとつめを差戻し候て
不然若乙に御座候ハヽ
  〽ふたつめを差戻し候事
〽なんぢやを差戻し候
真偽之儀仍如件
    `,
      "c",
    ),
  );
  const 真偽 = module.func("真偽", "str", ["bool", "bool"]);
  expect(真偽(true, false)).toBe("ひとつめ");
  expect(真偽(false, true)).toBe("ふたつめ");
  expect(真偽(false, false)).toBe("なんぢや");
});
test("選び候函数弐", () => {
  const module = compileAndLoadC(
    compile(
      `
一、陰陽甲、陰陽乙を以真偽之儀
若甲に御座候ハヽ
  〽ひとつめを差戻し候て
不然若乙に御座候ハヽ
  〽ふたつめを差戻し候て
不然
  〽みつめを差戻し候事
〽なんぢやを差戻し候
真偽之儀仍如件
    `,
      "c",
    ),
  );
  const 真偽 = module.func("真偽", "str", ["bool", "bool"]);
  expect(真偽(true, false)).toBe("ひとつめ");
  expect(真偽(false, true)).toBe("ふたつめ");
  expect(真偽(false, false)).toBe("みつめ");
});
test("文句を不可尋", () => {
  expect(() =>
    compile(
      `
一、文句甲を以真偽之儀
若甲に御座候ハヽ
  〽これぢやを差戻し候事
〽これぢやあらぬを差戻し候
真偽之儀仍如件
    `,
      "c",
    ),
  ).toThrow("条件式陰陽に無御座候");
});
test("不回函数", () => {
  const module = compileAndLoadC(
    compile(
      `
一、回之儀
陰に御座候限
  〽回りまするを差戻し候事
〽もつと回さぬかを差戻し候
回之儀仍如件
    `,
      "c",
    ),
  );
  const 回 = module.func("回", "str", []);
  expect(回()).toBe("もつと回さぬか");
});
test("文句を不可回", () => {
  expect(() =>
    compile(
      `
一、文句甲を以真偽之儀
甲に御座候限
  〽これぢやを差戻し候事
〽これぢやあらぬを差戻し候
真偽之儀仍如件
    `,
      "c",
    ),
  ).toThrow("条件式陰陽に無御座候");
});
test("一回函数", () => {
  const module = compileAndLoadC(
    compile(
      `
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
    `,
      "c",
    ),
  );
  const 丑 = module.func("丑", "str", []);
  const 寅 = module.func("寅", "str", []);
  expect(丑()).toBe("回りまする");
  expect(寅()).toBe("回つた回つた");
});
test("毎々之初期値之型不可異", () => {
  expect(() =>
    compile(
      `
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
    `,
      "c",
    ),
  ).toThrow("初期値之型相異候");
});
test("毎々之終値之型不可異", () => {
  expect(() =>
    compile(
      `
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
    `,
      "c",
    ),
  ).toThrow("終値之型相異候");
});

test("変数に蓄候", () => {
  const module = compileAndLoadC(
    compile(
      `
一、陰陽甲を以子之儀
或文句をして乙と致し候て
若甲に御座候ハヽ
  〽よろしきをして乙と致し候て
不然
  〽あしきをして乙と致し候事
乙を差戻し候
子之儀仍如件
    `,
      "c",
    ),
  );
  const 子 = module.func("子", "str", ["bool"]);
  expect(子(true)).toBe("よろしき");
  expect(子(false)).toBe("あしき");
});
test("型之異なる変数に不可蓄", () => {
  expect(() =>
    compile(
      `
一、子之儀
或陰陽をして乙と致し候て
〽わろきをして乙と致し候
子之儀仍如件
    `,
      "c",
    ),
  ).toThrow("値と変数之型相異候");
});
test("度重なる変数に不可蓄", () => {
  expect(() =>
    compile(
      `
一、子之儀
或陰陽をして乙と致し候て
或陰陽をして乙と致し候
子之儀仍如件
    `,
      "c",
    ),
  ).toThrow("既ニ乙被宣言候");
});
test("無き変数に不可蓄", () => {
  expect(() =>
    compile(
      `
一、子之儀
〽わろきをして乙と致し候
子之儀仍如件
    `,
      "c",
    ),
  ).toThrow("変数乙不被見出候");
});
test("初期値を以変数に蓄候", () => {
  const module = compileAndLoadC(
    compile(
      `
一、陰陽甲を以子之儀
〽あしきと云文句をして乙と致し候て
若甲に御座候ハヽ
  〽よろしきをして乙と致し候事
乙を差戻し候
子之儀仍如件
    `,
      "c",
    ),
  );
  const 子 = module.func("子", "str", ["bool"]);
  expect(子(true)).toBe("よろしき");
  expect(子(false)).toBe("あしき");
});
test("戻値を以変数に蓄候", () => {
  const module = compileAndLoadC(
    compile(
      `
一、陰陽甲を以子之儀
〽あしきと云文句をして乙と致し候て
若甲に御座候ハヽ
  丑之儀をして乙と致し候事
乙を差戻し候
子之儀仍如件
一、丑之儀
〽よろしきを差戻し候
丑之儀仍如件
    `,
      "c",
    ),
  );
  const 子 = module.func("子", "str", ["bool"]);
  expect(子(true)).toBe("よろしき");
  expect(子(false)).toBe("あしき");
});
test("型之異なる初期値を以変数に不可蓄", () => {
  expect(() =>
    compile(
      `
一、子之儀
〽わろきと云陰陽をして乙と致し候
子之儀仍如件
    `,
      "c",
    ),
  ).toThrow("初期値と変数之型相異候");
});
test("南蛮人之台詞", () => {
  const module = compileAndLoadC(
    compile(
      `
一、文句甲、文句乙を以続け書之儀
或文句をして丙と致し候て
南蛮人、椎言葉にて前書
#include <string.h>
と申上候て
南蛮人、椎言葉にて本文
size_t len_a = strlen(甲);
size_t len_b = strlen(乙);
丙 = malloc(len_a + len_b + 1);
memcpy(丙, 甲, len_a);
memcpy(丙 + len_a, 乙, len_b + 1);
と申上候て
丙を差戻し候
続け書之儀仍如件
    `,
      "c",
    ),
  );
  const 続け書 = module.func("続け書", "str", ["str", "str"]);
  expect(続け書("びっくり下谷の", "広徳寺")).toBe("びっくり下谷の広徳寺");
});
