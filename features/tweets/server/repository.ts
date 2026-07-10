import { desc, eq, isNull } from "drizzle-orm";
import { db } from "../../../server/lib/db";
import { tweets, type NewTweetRow, type TweetRow } from "./table";

export type StoredTweet = TweetRow;

export const tweetsRepository = {
  // 直近の top-level tweets を新しい順で取得 (reply は timeline から除外)。#4b 以降で cursor 対応。
  async findRecent(limit = 50): Promise<StoredTweet[]> {
    return db
      .select()
      .from(tweets)
      .where(isNull(tweets.parentId))
      .orderBy(desc(tweets.createdAt))
      .limit(limit);
  },
  // 特定 author の tweets を新しい順で取得 (profile 画面用、reply も含める)。
  async findByAuthorId(authorId: string, limit = 50): Promise<StoredTweet[]> {
    return db
      .select()
      .from(tweets)
      .where(eq(tweets.authorId, authorId))
      .orderBy(desc(tweets.createdAt))
      .limit(limit);
  },
  // 単体取得。reply usecase で親 tweet の存在確認に使う。
  async findById(id: string): Promise<StoredTweet | null> {
    const [row] = await db.select().from(tweets).where(eq(tweets.id, id));
    return row ?? null;
  },
  // 1 件挿入して、挿入後の row を返す。
  async insert(row: NewTweetRow): Promise<StoredTweet> {
    const [inserted] = await db.insert(tweets).values(row).returning();
    if (!inserted) throw new Error("insert tweet failed");
    return inserted;
  },
};
