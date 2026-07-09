import { sql } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { users } from "../../users/server/table";

export const tweets = sqliteTable("tweets", {
  id: text("id").primaryKey(),
  authorId: text("author_id")
    .notNull()
    .references(() => users.id),
  body: text("body").notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

export type TweetRow = typeof tweets.$inferSelect;
export type NewTweetRow = typeof tweets.$inferInsert;
