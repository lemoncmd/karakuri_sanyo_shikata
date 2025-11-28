export type Type =
  | VoidType
  | NumberType
  | StringType
  | BoolType
  | FuncType
  | ParamType
  | UnknownType;

export type VoidType = {
  type: "void";
};
export type NumberType = {
  type: "number";
};
export type StringType = {
  type: "string";
};
export type BoolType = {
  type: "bool";
};
export type UnknownType = {
  type: "unknown";
};
export type FuncType = {
  type: "func";
  params: Type[];
  res: Type;
};
export type ParamType = {
  type: "param";
  id: number;
};

export function concatType(ty1: Type, ty2: Type): Type | null {
  if (ty1.type === "unknown") return ty2;
  if (ty2.type === "unknown") return ty1;
  if (ty1.type !== ty2.type) return null;
  if (ty1.type !== "func") return ty1;
  const ty2f = ty2 as FuncType;
  if (ty1.params.length !== ty2f.params.length) return null;
  const res = concatType(ty1.res, ty2f.res);
  if (res === null) return null;
  const params = ty1.params.map((ty, i) => concatType(ty, ty2f.params[i]));
  if (params.includes(null)) return null;
  return { type: "func", params: params as Type[], res };
}

export function tryUpdate<T>(
  base: Type,
  override: Type,
  err: T,
): [boolean, Type] {
  if (override.type === "unknown") return [false, base];
  if (base.type === "unknown") return [true, override];
  if (base.type !== override.type) throw err;
  if (!(base.type === "func" && override.type === "func")) return [false, base];
  if (base.params.length !== override.params.length) throw err;
  const [resUpdated, res] = tryUpdate(base.res, override.res, err);
  const paramsAndUpdates = base.params.map((ty, i) =>
    tryUpdate(ty, override.params[i], err),
  );
  const paramUpdated = paramsAndUpdates
      .map(([update, _]) => update)
      .some((x) => x),
    params = paramsAndUpdates.map(([_, param]) => param);
  if (!resUpdated && !paramUpdated) return [false, base];
  return [true, { type: "func", res, params }];
}

class UnifyEnv {
  env: Type[] = [];
  resolve(ty: Type): Type {
    if (ty.type === "func") {
      return {
        type: "func",
        params: ty.params.map((x) => this.resolve(x)),
        res: this.resolve(ty.res),
      };
    }
    if (ty.type === "param") {
      const paramTy = this.env[ty.id];
      if (typeof paramTy !== "undefined") {
        return this.resolve(paramTy);
      } else {
        return ty;
      }
    }
    return ty;
  }
  unify(ty1_: Type, ty2_: Type): Type {
    const ty1 = this.resolve(ty1_);
    const ty2 = this.resolve(ty2_);
    if (ty1.type === "param" && ty2.type === "param" && ty1.id === ty2.id)
      return ty1;
    if (ty1.type === "param") {
      this.env[ty1.id] = ty2;
      return ty2;
    }
    if (ty2.type === "param") {
      this.env[ty2.id] = ty1;
      return ty1;
    }
    if (ty1.type === "unknown") return ty2;
    if (ty2.type === "unknown") return ty1;
    if (ty1.type === "func" && ty2.type === "func") {
      if (ty1.params.length !== ty2.params.length) {
        throw `Failed to unify types. 型寄せに失敗致候`;
      }
      const params = ty1.params.map((x, i) => this.unify(x, ty2.params[i]));
      const res = this.unify(ty1.res, ty2.res);
      return { type: "func", res, params };
    }
    if (ty1.type === ty2.type) {
      return ty1;
    }
    throw `Failed to unify types. 型寄せに失敗致候`;
  }
}
