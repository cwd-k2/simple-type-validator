import { type ValidatorOf, like, is } from "..";

type SomeTypeA = {
  keyA?: string;
  keyB: boolean;
  keyC: 200;
  keyD: {
    keyA?: string;
    keyB: number;
    keyC: (string | boolean)[];
    keyD: {
      keyA: string;
      keyB?: number;
    };
  };
  keyE?: {
    keyA: number;
  };
  keyF?: SomeTypeB;
};

type SomeTypeB = {
  keyA: string;
};

// モックにもなって良い感じ？
const b: ValidatorOf<SomeTypeB> = {
  keyA: is.string,
};

const a: ValidatorOf<SomeTypeA> = {
  keyA: [is.string, is.undefined],
  keyB: is.boolean,
  keyC: is.constant(200),
  keyD: {
    keyA: [is.string, is.undefined],
    keyB: is.number,
    keyC: {
      type: "array",
      elem: [is.string, ...is.boolean],
    },
    keyD: {
      keyA: is.string,
      keyB: [is.undefined, is.number],
    },
  },
  keyE: [is.undefined, { keyA: is.number }],
  keyF: [b, is.undefined],
};

const obj = {
  keyB: true,
  keyC: 200,
  keyD: {
    keyA: "nested",
    keyB: 2,
    keyC: [true, false, false],
    keyD: {
      keyA: "double nested",
    },
  },
};

const result = like<SomeTypeA>(obj, a);

if (result) {
  obj; // SomeTypeA
} else {
  obj; // any
}

console.log(result);

type Recurse = {
  keyA: string;
  keyB: number;
  keyC: (string | boolean)[];
  keyD?: Recurse; // Recursive Type
};

let c: ValidatorOf<Recurse> = {
  keyA: is.string,
  keyB: is.number,
  keyC: {
    type: "array",
    elem: [is.string, ...is.boolean],
  },
  // まあ適当に true にするのもできる
  keyD: [is.anyway<Recurse>, is.undefined],
};

// 関数を書いても下のように代入できる
function d(arg: unknown): arg is Recurse {
  // 良い感じに処理
  return true;
}

let e: ValidatorOf<Recurse> = d;

async () => {
  // fetch とかの Promise に挟みこんで使うと型付くのでは
  function withValidator<T>(validator: ValidatorOf<T>): (p: any) => Promise<T> {
    return async (p: any) => {
      if (like(p, validator)) {
        return p;
      } else {
        throw new Error(`Data validation failed:\n${p}`);
      }
    };
  }

  const res = await fetch("")
    .then((res) => res.json())
    .then(withValidator<SomeTypeA>(a));

  res; // SomeTypeA
};
