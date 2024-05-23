import { type ValidatorOf } from "./types";

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

const is = {
  // primitives
  string: (arg: unknown): arg is string => typeof arg === "string",
  number: (arg: unknown): arg is number => typeof arg === "number",
  boolean: (arg: unknown): arg is boolean => typeof arg === "boolean",
  undefined: (arg: unknown): arg is undefined => arg === undefined,
  null: (arg: unknown): arg is null => arg === null,
  // constant (literal)
  constant:
    <const T extends number | string | boolean>(v: T) =>
    (arg: unknown): arg is T =>
      typeof arg === typeof v && arg === v,
  // is.bool
  bool: [
    (arg: unknown): arg is true => arg === true,
    (arg: unknown): arg is false => arg === false,
  ] as ValidatorOf<boolean>,
};

export { type ValidatorOf, like, is };
