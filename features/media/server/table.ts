import { sql } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { tweets } from "../../tweets/server/table";
import { users } from "../../users/server/table";

// upload された media (image 等) の metadata。binary は R2 (Workers) / public/dev-uploads/ (Node dev) に置く。
// - uploaderId: 上げた user (attach 権限判定に使う。他人の media を別 user が tweet に付けられない)
// - tweetId: attach された tweet (null = orphan、pending 状態)。tweet 削除で cascade
// - r2Key: storage 上の object key (uploader + timestamp + ext で生成)
// - mimeType: image/jpeg 等、FE の <img> 表示判定に使う
export const media = sqliteTable("media", {
  id: text("id").primaryKey(),
  uploaderId: text("uploader_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tweetId: text("tweet_id").references(() => tweets.id, {
    onDelete: "cascade",
  }),
  r2Key: text("r2_key").notNull().unique(),
  mimeType: text("mime_type").notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

export type MediaRow = typeof media.$inferSelect;
export type NewMediaRow = typeof media.$inferInsert;
