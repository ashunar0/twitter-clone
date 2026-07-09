import { Hono } from "hono";
import likes from "../features/likes/server";
import tweets from "../features/tweets/server";
import users from "../features/users/server";

const app = new Hono();

export const routes = app
  // GET /api/health — liveness チェック用の最小 endpoint。
  .get("/api/health", (c) => c.json({ ok: true }))
  // likes sub-app を /api/likes に mount。
  .route("/api/likes", likes)
  // tweets sub-app を /api/tweets に mount。
  .route("/api/tweets", tweets)
  // users sub-app を /api/users に mount。
  .route("/api/users", users);

export type AppType = typeof routes;
export { app };
