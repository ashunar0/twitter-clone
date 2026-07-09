import { hc } from "hono/client";
import type { AppType } from "@server/app";

// dev は Vite proxy 経由 (/api → :8787)、本番は同一 origin。
// どちらも相対 URL で問題ないので base は "/" 固定。
export const rpcClient = hc<AppType>("/");
