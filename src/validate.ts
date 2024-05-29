import type { ValidatorOf } from "./types";
import { isArrayOfVs, isTupleOfV } from "./util";

// バリデーションエラー時に投げる例外
// data は失敗した値
/**
 * Error when running a validator ends in `false`.
 * Contains original `data` as an untyped value.
 */
class ValidationError extends Error {
  constructor(message: string, public data?: unknown) {
    super(message);
  }
}

function assume<T>(propName: string, arg: unknown, validator: ValidatorOf<T>): arg is T {
  // function validator: just write function
  // javascript cannot determine the argument types and return types of functions
  if (validator === "function") {
    if (typeof arg !== "function")
      throw new ValidationError(`${propName} is not a function.`);
    return true;
  }

  // union validator: unorderd [f1, f2, ...]
  if (Array.isArray(validator)) {
    let ok = false;
    let errors: string[] = [];
    // どれかひとつでも true で ok
    for (const f of validator) {
      try {
        ok ||= assume(propName, arg, f);
        if (ok) break;
      } catch (e) {
        if (e instanceof ValidationError) errors.push(e.message);
        else if (e instanceof Error) errors.push(e.message);
        else errors.push(`unknown error: (${e}).`);
      }
    }
    if (!ok) throw new ValidationError(`[ ${errors.map((s) => `"${s}"`).join(", ")} ]`);

    return true;
  }

  // tuple validator: { type: "array", elem: ... }
  if (isArrayOfVs(validator)) {
    if (!Array.isArray(arg)) throw new ValidationError(`${propName} is not an array.`);
    // rethrow
    return arg.every((v, i) => assume(`${propName}[${i}]`, v, validator.elem));
  }

  // array validator: { type: "tuple", elem: ... }
  if (isTupleOfV(validator)) {
    if (!Array.isArray(arg)) throw new ValidationError(`${propName} is not a tuple.`);
    if (arg.length !== validator.elem.length) {
      const length = validator.elem.length;
      throw new ValidationError(`${propName} is not a ${length}-element tuple.`);
    }
    // rethrow
    return arg.every((v, i) => assume(`${propName}[${i}]`, v, validator.elem[i]));
  }

  // arg: non-object (null 含む) の際は validator: 関数
  if (typeof arg !== "object" || arg === null) {
    if (typeof validator !== "function")
      throw new ValidationError(`Inappropriate validator function for ${propName}.`);
    if (!validator(arg))
      throw new ValidationError(
        `${propName} does not pass validator (\`${validator.name}').`
      );

    return true;
  }

  // arg: object でも validator: 関数のこともある
  if (typeof validator === "function") {
    if (!validator(arg))
      throw new ValidationError(
        `${propName} does not pass validator (\`${validator.name}').`
      );

    return true;
  }

  // arg: object, validator: object
  for (const key in validator) {
    const v = arg[key as keyof typeof arg] as unknown;
    const f = validator[key] as ValidatorOf<unknown>;

    // rethrow
    assume(`${propName}.${key}`, v, f);
  }

  return true;
}

// バリデーションに成功したらその値、失敗したら例外を投げる
// True / False を Either<T, Error> に変換するような役割
/**
 * Runs the validator and return the typed value.
 * Throws `ValidationError(msg, data)` error if fails.
 */
function validate<T>(validator: ValidatorOf<T>): (arg: unknown) => T {
  return (arg: unknown): T => {
    try {
      assume("<data>", arg, validator);
      return arg as T;
    } catch (e) {
      // rethrow
      if (e instanceof ValidationError) throw new ValidationError(e.message, arg);
      // unknown error
      throw e;
    }
  };
}

export { validate, ValidationError };
