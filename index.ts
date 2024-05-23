type primitive = string | number | boolean | bigint | symbol | undefined | null;

// U -> _ -> U
type Unit<U> = U extends never ? never : (_: void) => U;

// U -> U -> _
type Lift<U> = U extends never ? never : (_: U) => void;

// M(M(a)) + M(M(b)) + M(M(c)) -> M(M(a) * M(b) * M(c))
// Join<Lift<{ t1: A } | { t2: B }>> = { t1: A } & { t2: B }
type Join<U> = [U] extends [(_: infer I) => void] ? I : never;

// union -> tuple に変換
type Tuplify<T> = Join<Lift<Unit<T>>> extends (_: void) => infer W
  ? [...Tuplify<Exclude<T, W>>, W]
  : [];

type IsUnion<T1, T2 = T1> = T1 extends T2
  ? [T2] extends [T1]
    ? false
    : true
  : never;

type InnerV<T, Tuplified = Tuplify<T>> = IsUnion<T> extends true
  ? { [P in keyof Tuplified]: InnerV<Tuplified[P]> }
  : T extends (infer E)[]
  ? { type: "array"; elem: InnerV<E> }
  :
      | ((arg: unknown) => arg is T)
      | (T extends object
          ? T extends null
            ? never
            : { [P in keyof T]-?: InnerV<T[P]> }
          : never);

type Validator<T> = InnerV<T>;

function isArrayV<T>(v: unknown): v is { type: "array"; elem: Validator<T> } {
  return (
    typeof v === "object" &&
    v !== null &&
    "type" in v &&
    v.type === "array" &&
    "elem" in v
  );
}

function like<T>(arg: unknown, validator: Validator<T>): arg is T {
  // validator: array
  if (Array.isArray(validator))
    return validator.some((f) => like(arg, f as Validator<any>));

  // validator: { type: "array", elem: ... }
  if (isArrayV(validator))
    return Array.isArray(arg) && arg.every((v) => like(v, validator.elem));

  if (typeof arg !== "object" || arg === null)
    // arg: primitive (null 含む) の際は validator: 関数
    return typeof validator === "function" ? validator(arg) : false;

  // arg: object でも validator: 関数のこともある
  if (typeof validator === "function") return validator(arg);

  // arg: object, validator: object
  for (const key in validator) {
    const v = arg[key as keyof typeof arg] as unknown;
    const f = validator[key] as Validator<any>;

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
    <const T extends primitive>(v: T) =>
    (arg: unknown): arg is T =>
      typeof arg === typeof v && arg === v,
};

export { type Validator, like, is };
