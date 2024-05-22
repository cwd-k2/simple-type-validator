type primitive = string | number | boolean | bigint | symbol | undefined | null;

// tuple? 知りません...
type Validator<T> =
  | ((arg: unknown) => arg is T)
  | (T extends object
      ? T extends any[] | null
        ? never
        : {
            [P in keyof T]-?: Validator<T[P]>;
          }
      : never);

function like<T>(arg: unknown, validator: Validator<T>): arg is T {
  // arg: array, primitive (null 含む) の際は validator: 関数
  if (typeof arg !== "object" || arg === null || Array.isArray(arg))
    return typeof validator === "function" ? validator(arg) : false;

  // arg: object でも validator: 関数のこともある
  if (typeof validator === "function") return validator(arg);

  // arg: object, validator: object
  for (const key in validator) {
    const v = arg[key as keyof typeof arg];
    const f = validator[key];

    if (!like(v, f)) return false;
  }

  return true;
}

const is = {
  // primitives
  string: (arg: unknown): arg is string => typeof arg === "string",
  number: (arg: unknown): arg is number => typeof arg === "number",
  boolean: (arg: unknown): arg is boolean => typeof arg === "boolean",
  // constant (literal)
  constant:
    <const T extends primitive>(v: T) =>
    (arg: unknown): arg is T =>
      typeof arg === typeof v && arg === v,
  // check array
  arrayof:
    <T>(valid: (arg: unknown) => arg is T) =>
    (args: unknown): args is T[] =>
      Array.isArray(args) && args.every(valid),
  // possibly-undefined
  possibly:
    <T>(valid: Validator<T>) =>
    (arg: unknown): arg is T | undefined =>
      arg === undefined || like(arg, valid),
};

export { type Validator, like, is };
