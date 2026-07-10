import { sql } from "drizzle-orm";
import {
  type AnySQLiteColumn,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { users } from "../../users/server/table";

// parentId は self-ref (reply の親 tweet)、retweetOfId は self-ref (RT 元 tweet)。通常 tweet は両方 null。
// 循環参照回避のため AnySQLiteColumn で型を明示する (Drizzle self-ref パターン)。
// parent / retweetOf 削除は onDelete: "cascade" で reply / retweet も一緒に消す (初期 CREATE 時のみ効く制限)。
// retweet は 1 user あたり同一 tweet 1 回まで → partial unique index で保証。
export const tweets = sqliteTable(
  "tweets",
  {
    id: text("id").primaryKey(),
    authorId: text("author_id")
      .notNull()
      .references(() => users.id),
    parentId: text("parent_id").references((): AnySQLiteColumn => tweets.id, {
      onDelete: "cascade",
    }),
    retweetOfId: text("retweet_of_id").references(
      (): AnySQLiteColumn => tweets.id,
      { onDelete: "cascade" },
    ),
    body: text("body").notNull(),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (t) => ({
    retweetUniq: uniqueIndex("tweets_retweet_of_id_author_id_uniq")
      .on(t.retweetOfId, t.authorId)
      .where(sql`${t.retweetOfId} IS NOT NULL`),
  }),
);

export type TweetRow = typeof tweets.$inferSelect;
export type NewTweetRow = typeof tweets.$inferInsert;

// mention は tweet の attribute (Twitter 定義でも tweet の一部) なので tweets feature に併置。
// PK は (tweetId, mentionedUserId) の複合、tweet 削除で cascade。同一 tweet 内の重複 handle は 1 行に寄せる。
export const mentions = sqliteTable(
  "mentions",
  {
    tweetId: text("tweet_id")
      .notNull()
      .references((): AnySQLiteColumn => tweets.id, { onDelete: "cascade" }),
    mentionedUserId: text("mentioned_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.tweetId, t.mentionedUserId] }),
  }),
);

export type MentionRow = typeof mentions.$inferSelect;
export type NewMentionRow = typeof mentions.$inferInsert;
