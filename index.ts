import { type ValidatorOf } from "./types";

// バリデーションエラー時に投げる例外
// data は失敗した値
class ValidationError extends Error {
  constructor(message: string, public data: any) {
    super(message);
  }
}

function isArrayOfVs<T>(v: unknown): v is {
  type: "array";
  elem: ValidatorOf<T>;
} {
  let pass =
    typeof v === "object" &&
    v !== null &&
    "type" in v &&
    v.type === "array" &&
    "elem" in v;

  return pass;
}

// 型ナローイングのために利用するバリデーション関数
function like<T>(arg: unknown, validator: ValidatorOf<T>): arg is T {
  // validator: array
  if (Array.isArray(validator))
    return validator.some((f) => like(arg, f as ValidatorOf<unknown>));

  // validator: { type: "array", elem: ... }
  if (isArrayOfVs(validator))
    return Array.isArray(arg) && arg.every((v) => like(v, validator.elem));

  if (typeof arg !== "object" || arg === null)
    // arg: primitive (null 含む) の際は validator: 関数
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
  null: (arg: unknown): arg is null => arg === null,
  // constant (literal)
  constant:
    <const T extends number | string | boolean>(v: T) =>
    (arg: unknown): arg is T =>
      typeof arg === typeof v && arg === v,
  // boolean is treated as an union type in this case
  boolean: [
    (arg: unknown): arg is true => arg === true,
    (arg: unknown): arg is false => arg === false,
  ] as ValidatorOf<boolean>,
  // success anyway
  anyway: <T>(arg: unknown): arg is T => true,
  // fail anyway
  never: <T>(arg: unknown): arg is T => false,
};

export { type ValidatorOf, ValidationError, like, assume, is };
