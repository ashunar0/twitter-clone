import { buildRoutes } from "./app";
import { createWorkerDb } from "./lib/db-worker";
import { createWorkerStorage } from "./lib/storage-worker";
import { withDb } from "./lib/withDb";
import { withStorage } from "./lib/withStorage";

// Cloudflare Workers 用 entry。
// - env.DB (D1 binding) を per-request で drizzle instance に包む
// - env.MEDIA_BUCKET (R2 binding) + env.MEDIA_PUBLIC_URL (public URL base) を per-request で storage 抽象に包む
// - static assets (FE build) は wrangler.jsonc の assets binding が自動で hit させる (これより優先)
// - この Worker の fetch には API path (/api/*) しか降ってこない想定

type Env = { DB: D1Database; MEDIA_BUCKET: R2Bucket; MEDIA_PUBLIC_URL: string };

const app = buildRoutes(
  withDb((c) => createWorkerDb((c.env as Env).DB)),
  withStorage((c) => {
    const env = c.env as Env;
    return createWorkerStorage(env.MEDIA_BUCKET, env.MEDIA_PUBLIC_URL);
  }),
);

export default {
  fetch: app.fetch,
} satisfies ExportedHandler<Env>;
