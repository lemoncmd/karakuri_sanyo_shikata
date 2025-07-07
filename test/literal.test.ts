import { compile } from "../src/lib.ts";
import requireFromString from "require-from-string";

test("陽を差戻関数", () => {
  const module = requireFromString(
    compile(`
一、値之儀
陽を差戻し候
値之儀仍如件
    `),
  );
  expect(typeof module.値).toBe("function");
  expect(module.値).not.toThrow();
  expect(module.値()).toBe(true);
});
test("文句を差戻関数", () => {
  const module = requireFromString(
    compile(`
一、値之儀
〽あヽ佳き天気を差戻し候
値之儀仍如件
    `),
  );
  expect(typeof module.値).toBe("function");
  expect(module.値).not.toThrow();
  expect(module.値()).toBe("あヽ佳き天気");
});
test("陰を諄く差戻関数", () => {
  const module = requireFromString(
    compile(`
一、値之儀
陰に御座候や否やを差戻し候
値之儀仍如件
    `),
  );
  expect(typeof module.値).toBe("function");
  expect(module.値).not.toThrow();
  expect(module.値()).toBe(false);
});
