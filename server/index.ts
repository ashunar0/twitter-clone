import { serve } from "@hono/node-server";
import { Hono } from "hono";

const app = new Hono();

const routes = app.get("/api/health", (c) => c.json({ ok: true }));

export type AppType = typeof routes;

const port = Number(process.env.PORT ?? 8787);
serve({ fetch: app.fetch, port }, ({ port }) => {
  console.log(`server listening on http://localhost:${port}`);
});
