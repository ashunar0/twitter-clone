import { Hono } from "hono";

const app = new Hono();

export const routes = app.get("/api/health", (c) => c.json({ ok: true }));

export type AppType = typeof routes;
export { app };
