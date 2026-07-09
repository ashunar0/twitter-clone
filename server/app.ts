import { Hono } from "hono";
import follows from "../features/follows/server";
import likes from "../features/likes/server";
import notifications from "../features/notifications/server";
import tweets from "../features/tweets/server";
import users from "../features/users/server";

const app = new Hono();

export const routes = app
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

export type AppType = typeof routes;
export { app };
