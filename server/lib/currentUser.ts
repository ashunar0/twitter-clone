import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { usersRepository } from "../../features/users/server/repository";
import type { User } from "../../features/users/type";

// mock auth: 固定 seed user を "current user" とみなす。
// 本物 auth を入れる時は、この 1 ファイルの middleware を書き換えるだけで済むように隔離しておく。
export const SEED_USER_ID = "u1";

export type AuthVariables = {
  currentUser: User;
};

// mock auth middleware — SEED_USER_ID を DB から引いて c.set('currentUser', ...) する。
export const withCurrentUser = createMiddleware<{ Variables: AuthVariables }>(
  async (c, next) => {
    const row = await usersRepository.findById(SEED_USER_ID);
    if (!row) {
      throw new HTTPException(500, {
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
