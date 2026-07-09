import { Hono } from "hono";
import users from "../features/users/server";

const app = new Hono();

export const routes = app
  // GET /api/health — liveness チェック用の最小 endpoint。
  .get("/api/health", (c) => c.json({ ok: true }))
  // users sub-app を /api/users に mount。
  .route("/api/users", users);

export type AppType = typeof routes;
export { app };
