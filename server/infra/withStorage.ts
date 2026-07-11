import type { Context, MiddlewareHandler } from "hono";
import type { Storage } from "./storage";

// route handler が c.get("storage") で storage instance を取り出せるようにする。
// resolver は entry file 側で作る (withDb と同じ pattern):
//   Node: 起動時に 1 個作った singleton を返すクロージャ
//   Workers: per-request に c.env.MEDIA_BUCKET / c.env.MEDIA_PUBLIC_URL から作るクロージャ
export type StorageVariables = { storage: Storage };

export function withStorage(
  resolver: (c: Context) => Storage,
): MiddlewareHandler<{ Variables: StorageVariables }> {
  return async (c, next) => {
    c.set("storage", resolver(c));
    await next();
  };
}
