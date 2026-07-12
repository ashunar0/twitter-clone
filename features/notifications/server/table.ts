import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { users } from "../../users/server/table";

// 通知テーブル (write-time aggregate row)。
// - kind: "follow" / "like" / "retweet" / "reply" / "mention"
// - objectId: 対象 tweet id (follow は null)。集約 key の一部
// - actorIds: JSON array の string ("[\"userA\",\"userB\"]") で actor 群を保持
// - count: aggregate に merge された event 数 (=表示用 「他 N 人」の N+1)
// 集約 key = (recipientId, kind, objectId, isRead=false)。同 key の unread row があれば merge、なければ新規。
// 既読になった row には新 event を append しない (次の event は新 row として作る)。
export const notifications = sqliteTable("notifications", {
  id: text("id").primaryKey(),
  recipientId: text("recipient_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  kind: text("kind").notNull(),
  objectId: text("object_id"),
  actorIds: text("actor_ids").notNull(),
  count: integer("count").notNull().default(1),
  isRead: integer("is_read", { mode: "boolean" }).notNull().default(false),
  firstAt: text("first_at")
    .notNull()
    .default(sql`(current_timestamp)`),
  lastAt: text("last_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

export type NotificationRow = typeof notifications.$inferSelect;
export type NewNotificationRow = typeof notifications.$inferInsert;
