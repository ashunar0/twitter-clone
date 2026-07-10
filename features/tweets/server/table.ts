import { sql } from "drizzle-orm";
import { type AnySQLiteColumn, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { users } from "../../users/server/table";

// parentId は self-ref (reply の親 tweet)、通常 tweet は null。
// 循環参照回避のため AnySQLiteColumn で型を明示する (Drizzle self-ref パターン)。
// parent 削除は onDelete: "cascade" で reply も一緒に消す。
export const tweets = sqliteTable("tweets", {
  id: text("id").primaryKey(),
  authorId: text("author_id")
    .notNull()
    .references(() => users.id),
  parentId: text("parent_id").references((): AnySQLiteColumn => tweets.id, {
    onDelete: "cascade",
  }),
  body: text("body").notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

export type TweetRow = typeof tweets.$inferSelect;
export type NewTweetRow = typeof tweets.$inferInsert;
