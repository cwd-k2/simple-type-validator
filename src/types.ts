type HeadOrTuple<T> = T extends [infer R] ? R : T;

type PushUnorder<T, U extends unknown[], P = U> = P extends []
  ? [T]
  : P extends [infer L, ...infer R]
    ? [T, ...U] | [L, ...PushUnorder<T, R>]
    : never;

type MakeUnorder<T> = [boolean] extends [T]
  ? PushUnorder<FunctionalV<boolean>, BaseUnorder<Exclude<T, boolean>>>
  : BaseUnorder<T>;

type BaseUnorder<U, T = U> = [T] extends [never]
  ? []
  : T extends T
    ? [FunctionalV<T> | ObjectLikeV<T>, ...BaseUnorder<Exclude<U, T>>]
    : never;

type FunctionalV<T> = (arg: unknown) => arg is T;

type ObjectLikeV<T> = T extends object
  ? T extends Function
    ? "function"
    : T extends [unknown, ...unknown[]]
      ? { type: "tuple"; elem: { [K in keyof T]-?: ValidatorOf<T[K]> } }
      : T extends (infer E)[]
        ? { type: "array"; elem: ValidatorOf<E> }
        : { [K in keyof T]-?: ValidatorOf<T[K]> }
  : never;

/**
 * Either a function or an structured object to describe the condition to be satisfied when an untyped value can be assumed as the type `T`.
 */
type ValidatorOf<T> = HeadOrTuple<MakeUnorder<T>>;

export type { ValidatorOf };
