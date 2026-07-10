import { createMiddleware } from "hono/factory";
import { usersRepository } from "../../features/users/server/repository";
import type { User } from "../../features/users/type";
import { ApiError } from "./errors";
import type { DbVariables } from "./withDb";

// mock auth: 固定 seed user を "current user" とみなす。
// 本物 auth を入れる時は、この 1 ファイルの middleware を書き換えるだけで済むように隔離しておく。
export const SEED_USER_ID = "u1";

export type AuthVariables = DbVariables & {
  currentUser: User;
};

// mock auth middleware — c.get("db") 経由で SEED_USER_ID を引き、c.set("currentUser") する。
// withDb の後ろに繋ぐこと (chain: use("*", withDb(...), withCurrentUser))。
export const withCurrentUser = createMiddleware<{ Variables: AuthVariables }>(
  async (c, next) => {
    const db = c.get("db");
    const row = await usersRepository.findById(db, SEED_USER_ID);
    if (!row) {
      throw new ApiError({
        code: "internal",
        message: "seed user missing. run `pnpm db:seed`.",
      });
    }
    c.set("currentUser", {
      id: row.id,
      handle: row.handle,
      name: row.name,
      avatarUrl: row.avatarUrl,
      createdAt: row.createdAt,
    });
    await next();
  },
);
