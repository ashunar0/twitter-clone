import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import type { DB } from "./db";

// Node 実行 (dev / seed / drizzle-kit migrate) 用の drizzle factory。
// Cloudflare Workers bundle には含めない (@libsql/client が Node 依存のため)。
export function createNodeDb(
  url = process.env.DATABASE_URL ?? "file:./local.db",
): DB {
  return drizzle(createClient({ url }));
}
