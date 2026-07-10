import { serve } from "@hono/node-server";
import { buildRoutes } from "./app";
import { createNodeDb } from "./lib/db-node";
import { withDb } from "./lib/withDb";

export type { AppType } from "./app";

// dev / Node 環境での起動 entry。
// - libSQL local file を module load 時に 1 個作って全 request で共有する (Node singleton パターン)
// - Workers 版は server/worker.ts、per-request で env.DB から作る
const nodeDb = createNodeDb();
const app = buildRoutes(withDb(() => nodeDb));

const port = Number(process.env.PORT ?? 8787);
serve({ fetch: app.fetch, port }, ({ port }) => {
  console.log(`server listening on http://localhost:${port}`);
});
