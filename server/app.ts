import { Hono, type MiddlewareHandler } from "hono";
import follows from "../features/follows/server";
import likes from "../features/likes/server";
import notifications from "../features/notifications/server";
import tweets from "../features/tweets/server";
import users from "../features/users/server";
import { apiErrorHandler } from "./lib/errors";

// routes 構築ビルダー。entry file (Node / Workers) が withDb middleware を作って渡す。
// - Node dev: withDb(() => nodeSingleton)
// - Cloudflare Workers: withDb((c) => createWorkerDb(c.env.DB))
// AppType は ReturnType<typeof buildRoutes> で FE 側 RPC から参照する。
export function buildRoutes(dbMiddleware: MiddlewareHandler) {
  const app = new Hono();
  // throw された ApiError / HTTPException / 未処理 Error を全て統一 shape に reshape する。
  app.onError(apiErrorHandler);
  return app
    // db を c.set("db", ...) する middleware を全 route の前に挟む。
    .use("*", dbMiddleware)
    // GET /api/health — liveness チェック用の最小 endpoint。
    .get("/api/health", (c) => c.json({ ok: true }))
    // follows sub-app を /api/follows に mount。
    .route("/api/follows", follows)
    // likes sub-app を /api/likes に mount。
    .route("/api/likes", likes)
    // notifications sub-app を /api/notifications に mount。
    .route("/api/notifications", notifications)
    // tweets sub-app を /api/tweets に mount。
    .route("/api/tweets", tweets)
    // users sub-app を /api/users に mount。
    .route("/api/users", users);
}

export type AppType = ReturnType<typeof buildRoutes>;
