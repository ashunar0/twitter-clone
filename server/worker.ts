import { buildRoutes } from "./app";
import { createWorkerDb } from "./lib/db-worker";
import { withDb } from "./lib/withDb";

// Cloudflare Workers 用 entry。
// - env.DB (D1 binding) を per-request で drizzle instance に包む
// - static assets (FE build) は wrangler.jsonc の assets binding が自動で hit させる (これより優先)
// - この Worker の fetch には API path (/api/*) しか降ってこない想定

type Env = { DB: D1Database };

const app = buildRoutes(
  withDb((c) => createWorkerDb((c.env as Env).DB)),
);

export default {
  fetch: app.fetch,
} satisfies ExportedHandler<Env>;
