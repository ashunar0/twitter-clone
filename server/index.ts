import { serve } from "@hono/node-server";
import { buildRoutes } from "./app";
import { createNodeDb } from "./infra/db-node";
import { createNodeStorage } from "./infra/storage-node";
import { withDb } from "./infra/withDb";
import { withStorage } from "./infra/withStorage";

export type { AppType } from "./app";

// dev / Node 環境での起動 entry。
// - libSQL local file を module load 時に 1 個作って全 request で共有する (Node singleton パターン)
// - storage は public/dev-uploads/ に書く local FS impl (Vite が dev 時に serve)
// - Workers 版は server/worker.ts、per-request で env.DB / env.MEDIA_BUCKET から作る
const nodeDb = createNodeDb();
const nodeStorage = createNodeStorage();
const app = buildRoutes(withDb(() => nodeDb), withStorage(() => nodeStorage));

const port = Number(process.env.PORT ?? 8787);
serve({ fetch: app.fetch, port }, ({ port }) => {
  console.log(`server listening on http://localhost:${port}`);
});
