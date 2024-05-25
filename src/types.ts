type PeelSingleV<T> = T extends [infer R] ? R : T;

type PushToTuple<T, U extends unknown[], P = U> = P extends []
  ? [T]
  : P extends [infer L, ...infer R]
  ? [T, ...U] | [L, ...PushToTuple<T, R>]
  : never;

type OmitBool1st<T> = [boolean] extends [T]
  ? PushToTuple<(arg: unknown) => arg is boolean, MakeUnorder<Exclude<T, boolean>>>
  : MakeUnorder<T>;

type MakeUnorder<U, T = U> = [T] extends [never]
  ? []
  : T extends T
  ? [((arg: unknown) => arg is T) | ObjectLikeV<T>, ...MakeUnorder<Exclude<U, T>>]
  : never;

type ObjectLikeV<T> = T extends object
  ? T extends Function
    ? "function"
    : T extends [unknown, ...unknown[]]
    ? { type: "tuple"; elem: { [K in keyof T]-?: ValidatorOf<T[K]> } }
    : T extends (infer E)[]
    ? { type: "array"; elem: ValidatorOf<E> }
    : { [K in keyof T]-?: ValidatorOf<T[K]> }
  : never;

type ValidatorOf<T> = PeelSingleV<OmitBool1st<T>>;

export { type ValidatorOf };
