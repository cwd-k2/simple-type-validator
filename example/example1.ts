import { type Validator, like, is } from "..";

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
const b: Validator<SomeTypeB> = {
  keyA: is.string,
};

const a: Validator<SomeTypeA> = {
  keyA: [is.string, is.undefined],
  keyB: is.bool,
  keyC: is.constant(200),
  keyD: {
    keyA: [is.string, is.undefined],
    keyB: is.number,
    keyC: {
      type: "array",
      elem: [...is.bool, is.string],
    },
    keyD: {
      keyA: is.string,
      keyB: [is.undefined, is.number],
    },
  },
  keyE: [is.undefined, { keyA: is.number }],
  keyF: [b, is.undefined],
};

const obj: any = {
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

async () => {
  // fetch とかの Promise に挟みこんで使うと型付くのでは
  function withValidator<T>(validator: Validator<T>): (p: any) => Promise<T> {
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
