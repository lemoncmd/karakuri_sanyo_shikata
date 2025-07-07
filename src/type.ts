export type Type =
  | VoidType
  | NumberType
  | StringType
  | BoolType
  | FuncType
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
