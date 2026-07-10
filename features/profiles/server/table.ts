import { sql } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { users } from "../../users/server/table";

// public 表示用の identity。1 user に必ず 1 profile (signup 時に auto-create)。
// - userId: users.id への FK かつ PK (1:1 保証)
// - handle: URL / mention に使う一意識別子
// name / avatar は better-auth 管理の users 側 (name, image) を使う (source of truth を割る)。
export const profiles = sqliteTable("profiles", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  handle: text("handle").notNull().unique(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

export type ProfileRow = typeof profiles.$inferSelect;
export type NewProfileRow = typeof profiles.$inferInsert;
