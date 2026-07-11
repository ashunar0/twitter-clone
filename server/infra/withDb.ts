import type { Context, MiddlewareHandler } from "hono";
import type { DB } from "./db";

// route handler / 下流 middleware が c.get("db") で drizzle instance を取り出せるようにする。
// resolver は entry file 側で作る:
//   Node: 起動時に 1 個作った singleton を返すクロージャ
//   Workers: per-request に c.env.DB から createWorkerDb を叩くクロージャ
export type DbVariables = { db: DB };

export function withDb(
  resolver: (c: Context) => DB,
): MiddlewareHandler<{ Variables: DbVariables }> {
  return async (c, next) => {
    c.set("db", resolver(c));
    await next();
  };
}
