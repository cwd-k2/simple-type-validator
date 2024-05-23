type PermV1<T, K = T> = [K] extends [never]
  ? []
  : K extends K
  ? [PermV2<K>, ...PermV1<Exclude<T, K>>]
  : never;

type PermV2<T, U = T> = T extends (infer E)[]
  ? { type: "array"; elem: PermV4<E> }
  : ((arg: unknown) => arg is T) | PermV3<U>;

type PermV3<T, P = T> = T extends object
  ? T extends null
    ? never
    : { [K in keyof P]-?: PermV4<P[K]> }
  : never;

type PermV4<T, U = PermV1<T>> = U extends [infer R] ? R : U;

type Validator<T> = PermV4<T>;

export { type Validator };
