import { type ValidatorOf } from "./types";

// バリデーションエラー時に投げる例外
// data は失敗した値
class ValidationError extends Error {
  constructor(message: string, public data: any) {
    super(message);
  }
}

function isArrayOfVs(v: unknown): v is {
  type: "array";
  elem: ValidatorOf<unknown>;
} {
  let pass =
    typeof v === "object" &&
    v !== null &&
    "type" in v &&
    v.type === "array" &&
    "elem" in v;

  return pass;
}

function isTupleOfV(v: unknown): v is {
  type: "tuple";
  elem: [ValidatorOf<unknown>, ...ValidatorOf<unknown>[]];
} {
  let pass =
    typeof v === "object" &&
    v !== null &&
    "type" in v &&
    v.type === "tuple" &&
    "elem" in v &&
    Array.isArray(v.elem);

  return pass;
}

// 型ナローイングのために利用するバリデーション関数
function like<T>(arg: unknown, validator: ValidatorOf<T>): arg is T {
  // function validator: just write function
  // javascript cannot determine the argument types and return types of functions
  if (validator === "function") return typeof arg === "function";

  // union validator: unorderd [f1, f2, ...]
  if (Array.isArray(validator)) return validator.some((f) => like(arg, f));

  // tuple validator: { type: "array", elem: ... }
  if (isArrayOfVs(validator))
    return Array.isArray(arg) && arg.every((v) => like(v, validator.elem));

  // array validator: { type: "tuple", elem: ... }
  if (isTupleOfV(validator))
    return (
      Array.isArray(arg) &&
      arg.length === validator.elem.length &&
      arg.every((v, i) => like(v, validator.elem[i]))
    );

  // arg: non-object (null 含む) の際は validator: 関数
  if (typeof arg !== "object" || arg === null)
    return typeof validator === "function" ? validator(arg) : false;

  // arg: object でも validator: 関数のこともある
  if (typeof validator === "function") return validator(arg);

  // arg: object, validator: object
  for (const key in validator) {
    const v = arg[key as keyof typeof arg] as unknown;
    const f = validator[key] as ValidatorOf<unknown>;

    if (!like(v, f)) return false;
  }

  return true;
}

// バリデーションに成功したらその値、失敗したら例外を投げる
// True / False を Either<T, Error> に変換するような役割
function assume<T>(validator: ValidatorOf<T>): (arg: unknown) => T {
  return (arg: unknown): T => {
    if (like(arg, validator)) return arg;

    throw new ValidationError("Validation failed", arg);
  };
}

// 基本的なバリデータをまとめたオブジェクト
const is = {
  // primitives
  string: (arg: unknown): arg is string => typeof arg === "string",
  number: (arg: unknown): arg is number => typeof arg === "number",
  undefined: (arg: unknown): arg is undefined => arg === undefined,
  boolean: (arg: unknown): arg is boolean => typeof arg === "boolean",
  null: (arg: unknown): arg is null => arg === null,
  // constant (literal)
  constant:
    <const T extends number | string | boolean>(v: T) =>
    (arg: unknown): arg is T =>
      typeof arg === typeof v && arg === v,
  // success anyway
  anyway: <T>(_: unknown): _ is T => true,
  // fail anyway
  never: <T>(_: unknown): _ is T => false,
};

export { type ValidatorOf, ValidationError, like, assume, is };
