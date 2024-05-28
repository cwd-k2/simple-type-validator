import type { ValidatorOf } from "./types";
import { isArrayOfVs, isTupleOfV } from "./util";

// 型ナローイングのために利用するバリデーション関数
/**
 * Runs the validator to provide type narrowings.
 */
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

// 基本的なバリデータをまとめたオブジェクト
/**
 * Basic `ValidatorOf<T>`s which can be used to compose custom validators.
 */
const is = {
  // primitives
  string: (arg: unknown): arg is string => typeof arg === "string",
  number: (arg: unknown): arg is number => typeof arg === "number",
  boolean: (arg: unknown): arg is boolean => typeof arg === "boolean",
  null: (arg: unknown): arg is null => arg === null,
  undefined: (arg: unknown): arg is undefined => arg === undefined,
  /** For constants (literals). */
  constant:
    <const T extends number | string | boolean>(v: T) =>
    (arg: unknown): arg is T =>
      arg === v,
  /** Success anyway. */
  anyway: <T>(_: unknown): _ is T => true,
  /** Fail anyway. */
  never: <T>(_: unknown): _ is T => false,
};

export type { ValidatorOf };
export { like, is };
export * from "./validate";
export * as unstable from "./unstable";
