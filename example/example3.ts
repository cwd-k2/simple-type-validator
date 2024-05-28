import type { ValidatorOf } from "..";
import { is, validate } from "..";

function isFormattedDateString(arg: unknown): arg is string {
  if (typeof arg !== "string") return false;

  const regex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
  return regex.test(arg);
}

type PostPayload = {
  id: number;
  contents: string;
  likes: number;
  reply?: PostPayload[];
};

type UserPayload = {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  posts: PostPayload[];
};

const isPostPayload: ValidatorOf<PostPayload> = {
  id: is.number,
  contents: is.string,
  likes: is.number,
  reply: [is.anyway, is.undefined],
};

const isUserPayload: ValidatorOf<UserPayload> = {
  id: is.number,
  name: is.string,
  created_at: isFormattedDateString,
  updated_at: isFormattedDateString,
  posts: { type: "array", elem: isPostPayload },
};

const badUserPayload = {
  id: 1,
  name: "a user",
  created_at: "2000-01-01 00:00:00",
  updated_at: "fugafuga",
  posts: [{}],
};

try {
  const never = validate<UserPayload>(isUserPayload)(badUserPayload);
  console.log(never);
} catch (e) {
  console.error(e);
}
