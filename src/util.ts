import type { ValidatorOf } from "./types";

function isArrayOfVs(v: unknown): v is {
  type: "array";
  elem: ValidatorOf<unknown>;
} {
  let pass =
    typeof v === "object" &&
    v !== null &&
    "type" in v &&
    v.type === "array" &&
    "elem" in v;

  return pass;
}

function isTupleOfV(v: unknown): v is {
  type: "tuple";
  elem: [ValidatorOf<unknown>, ...ValidatorOf<unknown>[]];
} {
  let pass =
    typeof v === "object" &&
    v !== null &&
    "type" in v &&
    v.type === "tuple" &&
    "elem" in v &&
    Array.isArray(v.elem);

  return pass;
}

export { isArrayOfVs, isTupleOfV };
