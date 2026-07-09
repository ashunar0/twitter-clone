import { serve } from "@hono/node-server";
import { app } from "./app";

export type { AppType } from "./app";

// dev / Node 環境での起動 entry。Cloudflare Workers に載せる時は別 entry を用意する。
const port = Number(process.env.PORT ?? 8787);
serve({ fetch: app.fetch, port }, ({ port }) => {
  console.log(`server listening on http://localhost:${port}`);
});
