# simple-type-validator

## Example

See [example/example1.ts](example/example1.ts).

## Current problem

- [x] The current problem is `Validator<string | number>` (which is `(arg: unknown) => arg is string | number`) also accepts `Validator<string>` (`(arg: unknown) => arg is string`).
  - This can cause inadequate validator definitions.
