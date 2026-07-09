import { sql } from "drizzle-orm";
import { primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { tweets } from "../../tweets/server/table";
import { users } from "../../users/server/table";

// 複合 PK (tweet_id, user_id) で 1 user 1 tweet 1 like を保証。
export const likes = sqliteTable(
  "likes",
  {
    tweetId: text("tweet_id")
      .notNull()
      .references(() => tweets.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.tweetId, t.userId] }),
  }),
);

export type LikeRow = typeof likes.$inferSelect;
