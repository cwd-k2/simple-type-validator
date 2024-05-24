import { type ValidatorOf, like, is } from "..";

// 再帰的な型
type Recurse = {
  keyA: string;
  keyB: number;
  keyC: (string | boolean)[];
  keyD?: Recurse; // Recursion here
};

let isRecurse: ValidatorOf<Recurse> = {
  keyA: is.string,
  keyB: is.number,
  keyC: {
    type: "array",
    elem: [is.string, is.boolean],
  },
  // まあ適当に true にするのが最善？
  keyD: [is.anyway<Recurse>, is.undefined],
};

if (like<Recurse>({}, isRecurse)) {
  // Recurse
} else {
  // unknown
}
