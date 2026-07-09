import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

const url = process.env.DATABASE_URL ?? "file:./local.db";

export const dbClient = createClient({ url });
export const db = drizzle(dbClient);
export type DB = typeof db;
