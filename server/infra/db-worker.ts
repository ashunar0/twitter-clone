import { drizzle } from "drizzle-orm/d1";
import type { DB } from "./db";

// Cloudflare Workers 用の drizzle factory。env.DB binding を受けて per-request で呼ぶ。
export function createWorkerDb(binding: D1Database): DB {
  return drizzle(binding);
}
