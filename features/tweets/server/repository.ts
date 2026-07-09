import { desc } from "drizzle-orm";
import { db } from "../../../server/lib/db";
import { tweets, type NewTweetRow, type TweetRow } from "./table";

export type StoredTweet = TweetRow;

export const tweetsRepository = {
  // 直近の tweets を新しい順で取得。#4b 以降で cursor 対応。
  async findRecent(limit = 50): Promise<StoredTweet[]> {
    return db.select().from(tweets).orderBy(desc(tweets.createdAt)).limit(limit);
  },
  // 1 件挿入して、挿入後の row を返す。
  async insert(row: NewTweetRow): Promise<StoredTweet> {
    const [inserted] = await db.insert(tweets).values(row).returning();
    if (!inserted) throw new Error("insert tweet failed");
    return inserted;
  },
};
