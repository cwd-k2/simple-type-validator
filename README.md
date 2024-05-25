# simple-type-validator

## Install

```shell
# from github
$ npm install --save-dev cwd-k2/simple-type-validator
```

## Example

See [example/example1.ts](example/example1.ts).

## Current problem

- [x] `Validator<boolean>` is not interpreted as `(arg: unknown) => arg is boolean`, but `[(arg: unknown) => arg is true, (arg: unknown) => arg is false]` because `boolean` is treated as `true | false` union.
