type PeelSingleV<T> = T extends [infer R] ? R : T;

type UnorderedVs<T, K = T> = [K] extends [never]
  ? []
  : K extends K
  ? [
      ((arg: unknown) => arg is K) | ObjectLikeV<K>,
      ...UnorderedVs<Exclude<T, K>>
    ]
  : never;

type ObjectLikeV<T> = T extends object
  ? T extends null
    ? never
    : T extends [unknown, ...unknown[]]
    ? { type: "tuple"; elem: { [K in keyof T]-?: ValidatorOf<T[K]> } }
    : T extends (infer E)[]
    ? { type: "array"; elem: ValidatorOf<E> }
    : { [K in keyof T]-?: ValidatorOf<T[K]> }
  : never;

type ValidatorOf<T> = PeelSingleV<UnorderedVs<T>>;

export { type ValidatorOf };
