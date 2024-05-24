import { type ValidatorOf, like, assume, is } from "..";

// 適当な型を定義
type SomeTypeA = {
  keyA?: string;
  keyB: boolean;
  keyC: 200;
  keyD: {
    keyA?: string;
    keyB: [number, string];
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
  func: (a: number) => string;
};

// 型の入れ子に使う型
type SomeTypeB = {
  keyA: string;
};

// SomeTypeB のバリデータ
// 関数として書ける
const isSomeTypeB: ValidatorOf<SomeTypeB> = (
  arg: unknown
): arg is SomeTypeB => {
  const pass =
    typeof arg === "object" &&
    arg !== null &&
    "keyA" in arg &&
    is.string(arg.keyA);

  return pass;
};

// SomeTypeA のバリデータ
// 基本的なバリデータを組み合わせてオブジェクトとしても書ける
const isSomeTypeA: ValidatorOf<SomeTypeA> = {
  // union type の validator は unorderd tuple
  // ValidatorOf<string | undefined>
  // => [ValidatorOf<string>, ValidatorOf<undefined>]
  keyA: [is.string, is.undefined],
  // boolean は true | false の union として扱われる
  keyB: is.boolean,
  // as const みたいなのは is.constant 使うとよい
  keyC: is.constant(200),
  // オブジェクトの入れ子もできる
  keyD: {
    keyA: [is.string, is.undefined],
    // tuple の validator は { type: "tuple", elem: [ValidatorOf<Element1>, ValidatorOf<Element2>, ...] }
    keyB: {
      type: "tuple",
      elem: [is.number, is.string],
    },
    // array の validator は { type: "array", elem: ValidatorOf<Element> }
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
  // 他で定義したバリデータも置くことができる
  keyF: [isSomeTypeB, is.undefined],
  // メソッド
  func: "function",
};

// バリデーションする値
const possiblySomeTypeA: any = {
  keyB: true,
  keyC: 200,
  keyD: {
    keyA: "nested",
    keyB: [1, "nested"],
    keyC: [true, false, false],
    keyD: {
      keyA: "double nested",
    },
  },
  func: (a: number) => "string",
};

// バリデーションする
const result = like<SomeTypeA>(possiblySomeTypeA, isSomeTypeA);
console.log(result);

// T/F によって型のナローイングが効く
if (result) {
  possiblySomeTypeA; // SomeTypeA
} else {
  possiblySomeTypeA; // any
}

() => {
  // あとで catch する前提なら平坦にも書ける
  const obj = {} as any;
  const res = assume<SomeTypeA>(isSomeTypeA)(obj); // throws ValidationError

  res; // プログラム上では SomeTypeA
};

async () => {
  // fetch とかの Promise に挟みこんで使うと型が付く
  // 失敗するなら Promise#catch するとよい
  const res = await fetch("")
    .then((res) => res.json())
    .then(assume<SomeTypeA>(isSomeTypeA));

  res; // SomeTypeA
};
