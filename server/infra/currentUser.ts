import { createMiddleware } from "hono/factory";
import { getAuth } from "../../features/users/server/auth";
import type { User } from "../../features/users/type";
import { ApiError } from "../lib/errors";
import type { DbVariables } from "./withDb";

// better-auth の session (cookie 経由) を検証して current user を context に入れる middleware。
// - session 無効 / 期限切れ → ApiError.forbidden (401 相当は forbidden で寄せる、規約 5 種類)
// - session 有効 → c.set("currentUser", user)
// mock 時代は SEED_USER_ID で固定していた。本物 auth に差し替わったが、他 feature の
// c.get("currentUser") 側のインタフェースは変わらない (mock 隔離の意義)。
export type AuthVariables = DbVariables & {
  currentUser: User;
};

export const withCurrentUser = createMiddleware<{ Variables: AuthVariables }>(
  async (c, next) => {
    const db = c.get("db");
    const env = c.env as { BETTER_AUTH_SECRET?: string } | undefined;
    const auth = getAuth(db, { secret: env?.BETTER_AUTH_SECRET });
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session) {
      throw ApiError.forbidden("認証が必要なのだ");
    }
    c.set("currentUser", {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      image: session.user.image ?? null,
    });
    await next();
  },
);
