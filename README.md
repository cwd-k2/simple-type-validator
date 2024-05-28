# simple-type-validator

A simple toolset to create type validators.

## Install

```shell
# from github
$ npm install --save-dev cwd-k2/simple-type-validator
```

## Motivation

There are so many cases where we have to treat `any` variables.

```ts
const res = await fetch(url).then(res => res.json());
res // any!!!
```

In those cases, the simplest (but unsafe-est) way is *Type Assertion*.

```ts
const typedRes = res as unknown as T; // T but...
```

But, there is a more-cultured way in TypeScript: You can use *Type Narrowings*. It will be better, you can also check the variable is sane in the runtime.

```ts
// provide type 
function isT(arg: unknown): arg is T {
  // ...
  return true;
}

if (isT(res)) {
  res; // res is now T here!
} else {
  res; // still any
}
```

And, you can throw `any` away to somewhere errors are handled.

```ts
if (!isT(res)) throw "Hopefully someone in somewhere handle this."
res; // is T below
```

But... it is painful to write precise type-narrowing & validating functions with your hand.

So I decided to make a simple library to create that kind of stuff, and provide basic validation functionalities.

## Function

### `like<T>(arg: unknown, validator: ValidatorOf<T>): arg is T`

Simple type check function which provides type narrowings.

```ts
let v: ValidatorOf<T>;
let o: any;

if (like<T>(o, v)) {
  o; // T
} else {
  o; // any
}
```

### `validate<T>(validator: ValidatorOf<T>): (arg: unknown) => T throws ValidationError`

Simple validation function making.

`validate(v)` makes a function which returns a typed value or throws `ValidationError` when validation failed.

```ts
let v: ValidatorOf<T>;
let o: any;

let check = validate<T>(v); // (arg: unknown) => T
let typed = check(o); // T or throws ValidationError
```

If you use this with `Promise`:

```ts
let v: ValidatorOf<T>;

let res = await fetch(url).then(res => res.json()).then(validate<T>(v)); // res is T!
```

## Type

### `ValidatorOf<T>`

Basically, it is `(arg: unknown) => arg is T`.

```ts
// type `(arg: unknown) => arg is T`
let v: ValidatorOf<string>;

v = (arg: unknown): arg is string => typeof arg === 'string';
```

#### For unions

For union types like `T | S`, `ValidatorOf<T | S>` will be **Unorderd Tuple** of `[ValidatorOf<T>, ValidatorOf<S>] | [ValidatorOf<S>, ValidatorOf<T>]`.

```ts
// type `[ValidatorOf<string>, ValidatorOf<number>, ValidatorOf<boolean>] | ...`
// Which means you can assign those values to v:
//   - [ValidatorOf<string>, ValidatorOf<number>, ValidatorOf<boolean>]
//   - [ValidatorOf<string>, ValidatorOf<boolean>, ValidatorOf<number>]
//   - [ValidatorOf<number>, ValidatorOf<boolean>, ValidatorOf<string>]
//   - [ValidatorOf<number>, ValidatorOf<string>, ValidatorOf<boolean>]
//   - ... (permutation of tuples)
let v: ValidatorOf<string | number | boolean>;

v = [is.string, is.number, is.boolean];
```

#### For objects

You can also define `ValidatorOf<T>` in object style. The calculated type will be `{ [K in keyof T]: ValidatorOf<T[K]> }`.

NOTE: Optional properties like `age?: number` will be treated as `age: number | undefined`.

```ts
type Person = {
  name: string;
  age?: number;
}

// type `(arg: unknown) => arg is Person`
// OR type `{ name: ValidatorOf<string>; age: ValidatorOf<number | undefined> }`
let v: ValidatorOf<Person>;

v = {
  name: is.string,
  age: [is.number, is.undefined],
};
```

#### For arrays

For `T[]`, `ValidatorOf<T[]>` can be resolved as `{ type: "array" as const, elem: ValidatorOf<T> }`.

```ts
// type `(arg: unknown) => arg is Person[]`
// OR type `{ type: "array", elem: ValidatorOf<Person> }`
let v: ValidatorOf<Person[]>;

v = {
  type: "array",
  elem: isPerson,
}
```

#### For tuples

For tuples like `[S, T, U]`, `ValidatorOf<[T, S, U]>` will be calculated as `{ type: "tuple", elem: [ValidatorOf<S>, ValidatorOf<T>, ValidatorOf<U>] }`

```ts
// type `(arg: unknown) => arg is [string, number]`
// OR type `{ type: "tuple", elem: [ValidatorOf<string>, ValidatorOf<number>] }`
let v: ValidatorOf<[string, number]>;

v = {
  type: "tuple",
  elem: [is.string, is.number],
};
```

#### For functions

NOTE: *partial support*

For function, you can only write `"function"` as const.

```ts
// type `(arg: unknown) => arg is (a: string) => number`
// OR type `"function"` as const
let v: ValidatorOf<(a: string) => number>;

v = "function";
```

### `ValidationError(message: string, data?: unknown)`

An `Error` returned when validation failed. Contains untyped `data` which has been passed.

```
ValidationError: <data>.updated_at fails to pass validator (`isFormattedDateString').
    at (...) {
    id: 1,
    name: 'a user',
    created_at: '2000-01-01 00:00:00',
    updated_at: 'bad type',
    posts: [ {} ]
  }
}
```

### Utility

An utility object `is` contains basic validators for the use.

```ts
is.string;   // ValidatorOf<string>
is.number;   // ValidatorOf<number>
is.boolean:  // ValidatorOf<boolean>
is.null      // ValidatorOf<null>
is.undefined // ValidatorOf<undefined>
is.constant  // e.g. `is.constant(42)` makes ValidatorOf<42>
is.anyway<T> // Always true (success)
is.never<T>  // Always false (fail)
```

## Example

See [example/example1.ts](example/example1.ts).

