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

export class UnifyEnv {
  env: Type[] = [];
  paramCount = 0;
  getNewParamTy(): ParamType {
    return { type: "param", id: this.paramCount++ };
  }
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
  unify(
    ty1_: Type,
    ty2_: Type,
    errMessage: string = "Failed to unify types. 型寄せに失敗致候",
  ): Type {
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
        throw errMessage;
      }
      const params = ty1.params.map((x, i) =>
        this.unify(x, ty2.params[i], errMessage),
      );
      const res = this.unify(ty1.res, ty2.res, errMessage);
      return { type: "func", res, params };
    }
    if (ty1.type === ty2.type) {
      return ty1;
    }
    throw errMessage;
  }
  cloneParam(ty: Type, map = new Map<number, number>()): Type {
    if (ty.type === "func") {
      return {
        type: "func",
        params: ty.params.map((x) => this.cloneParam(x, map)),
        res: ty.res,
      };
    }
    if (ty.type === "param") {
      if (map.has(ty.id)) {
        return { type: "param", id: map.get(ty.id) as number };
      } else {
        const newParam = this.getNewParamTy();
        map.set(ty.id, newParam.id);
        return newParam;
      }
    }
    return ty;
  }
}
