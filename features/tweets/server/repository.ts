import { desc } from "drizzle-orm";
import { db } from "../../../server/lib/db";
import { tweets, type TweetRow } from "./table";

export type StoredTweet = TweetRow;

export const tweetsRepository = {
  // 直近の tweets を新しい順で取得。#4b 以降で cursor 対応。
  async findRecent(limit = 50): Promise<StoredTweet[]> {
    return db.select().from(tweets).orderBy(desc(tweets.createdAt)).limit(limit);
  },
};
