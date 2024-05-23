type PermV1<T, K = T> = [K] extends [never]
  ? []
  : K extends K
  ? [PermV2<K>, ...PermV1<Exclude<T, K>>]
  : never;

type PermV2<T> = T extends (infer E)[]
  ? { type: "array"; elem: PermV4<E> }
  : ((arg: unknown) => arg is T) | PermV3<T>;

type PermV3<T> = T extends object
  ? T extends null
    ? never
    : { [K in keyof T]-?: PermV4<T[K]> }
  : never;

type PermV4<T, U = PermV1<T>> = U extends [infer R] ? R : U;

type Validator<T> = PermV4<T>;

export { type Validator };
