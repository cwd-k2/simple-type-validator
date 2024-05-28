import type { ValidatorOf } from "..";
import { is, validate } from "..";

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
  posts?: PostPayload[];
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
  created_at: is.string,
  updated_at: is.string,
  posts: [{ type: "array", elem: isPostPayload }, is.undefined],
};

const badUserPayload = {
  id: "not a number",
  name: "a user",
};

try {
  validate<UserPayload>(isUserPayload)(badUserPayload);
} catch (e) {
  console.error(e);
}
