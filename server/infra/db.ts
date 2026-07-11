import type { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";

// libSQL (Node dev) と D1 (Cloudflare Workers prod) を同じ型で扱うための共通 base。
// drizzle-orm の SQLite 系実装は全て BaseSQLiteDatabase を継承しているため、
// repository / service はこの型を通じて driver 非依存な query API を叩ける。
// TResultKind='async' は両者共通、TResult (row 型) と TSchema は any で汎用化する。
export type DB = BaseSQLiteDatabase<"async", unknown>;
