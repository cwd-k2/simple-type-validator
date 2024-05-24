type UnorderedVs<T, K = T> = [K] extends [never]
  ? []
  : K extends K
  ? [ArrOrBasicV<K>, ...UnorderedVs<Exclude<T, K>>]
  : never;

type ArrOrBasicV<T> = T extends (infer E)[]
  ? { type: "array"; elem: ValidatorOf<E> }
  : ((arg: unknown) => arg is T) | RecurseObjV<T>;

type RecurseObjV<T> = T extends object
  ? T extends null
    ? never
    : { [K in keyof T]-?: ValidatorOf<T[K]> }
  : never;

type PeelSingleV<T> = T extends [infer R] ? R : T;

type ValidatorOf<T> = PeelSingleV<UnorderedVs<T>>;

export { type ValidatorOf };
