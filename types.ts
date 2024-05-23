type UnorderedVs<T, K = T> = [K] extends [never]
  ? []
  : K extends K
  ? [ArrOrBasicV<K>, ...UnorderedVs<Exclude<T, K>>]
  : never;

type ArrOrBasicV<T> = T extends (infer E)[]
  ? { type: "array"; elem: PeelSingleV<E> }
  : ((arg: unknown) => arg is T) | RecurseObjV<T>;

type RecurseObjV<T> = T extends object
  ? T extends null
    ? never
    : { [K in keyof T]-?: PeelSingleV<T[K]> }
  : never;

type PeelSingleV<T, U = UnorderedVs<T>> = U extends [infer R] ? R : U;

type ValidatorOf<T> = PeelSingleV<T>;

export { type ValidatorOf };
