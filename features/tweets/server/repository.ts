import { and, desc, eq, inArray, isNull, lt, or } from "drizzle-orm";
import type { DB } from "../../../server/lib/db";
import {
  mentions,
  tweets,
  type MentionRow,
  type NewMentionRow,
  type NewTweetRow,
  type TweetRow,
} from "./table";

export type StoredTweet = TweetRow;
export type StoredMention = MentionRow;
export type TweetCursor = { createdAt: string; id: string };

// 1 page 20 件で固定。client 指定は受けない (server hardcode 規約)。
export const TWEETS_PAGE_SIZE = 20;

// seek predicate: (createdAt, id) < (cursor.createdAt, cursor.id)。
// SQLite 上は tuple 比較を or/and に展開する (Drizzle の row-value 未対応対策)。
function seekBefore(cursor: TweetCursor) {
  return or(
    lt(tweets.createdAt, cursor.createdAt),
    and(
      eq(tweets.createdAt, cursor.createdAt),
      lt(tweets.id, cursor.id),
    ),
  );
}

export const tweetsRepository = {
  // 直近の top-level tweets を新しい順で 1 page 取得 (reply は timeline から除外、cursor で seek)。
  async findRecent(db: DB, cursor?: TweetCursor): Promise<StoredTweet[]> {
    const where = cursor
      ? and(isNull(tweets.parentId), seekBefore(cursor))
      : isNull(tweets.parentId);
    return db
      .select()
      .from(tweets)
      .where(where)
      .orderBy(desc(tweets.createdAt), desc(tweets.id))
      .limit(TWEETS_PAGE_SIZE);
  },
  // 特定 author の tweets を新しい順で 1 page 取得 (profile 画面用、reply も含める)。
  async findByAuthorId(
    db: DB,
    authorId: string,
    cursor?: TweetCursor,
  ): Promise<StoredTweet[]> {
    const where = cursor
      ? and(eq(tweets.authorId, authorId), seekBefore(cursor))
      : eq(tweets.authorId, authorId);
    return db
      .select()
      .from(tweets)
      .where(where)
      .orderBy(desc(tweets.createdAt), desc(tweets.id))
      .limit(TWEETS_PAGE_SIZE);
  },
  // 単体取得。reply usecase で親 tweet の存在確認に使う。
  async findById(db: DB, id: string): Promise<StoredTweet | null> {
    const [row] = await db.select().from(tweets).where(eq(tweets.id, id));
    return row ?? null;
  },
  // 1 件挿入して、挿入後の row を返す。
  async insert(db: DB, row: NewTweetRow): Promise<StoredTweet> {
    const [inserted] = await db.insert(tweets).values(row).returning();
    if (!inserted) throw new Error("insert tweet failed");
    return inserted;
  },
};

// mentions は tweet の associated table。owning feature = tweets なので同居させる。
export const mentionsRepository = {
  // 複数 mention を 1 クエリで挿入。同一 (tweetId, mentionedUserId) は onConflictDoNothing で冪等。
  async insertMany(db: DB, rows: NewMentionRow[]): Promise<void> {
    if (rows.length === 0) return;
    await db.insert(mentions).values(rows).onConflictDoNothing();
  },
  // 複数 tweetId をまとめて取得 (enrichMany N+1 回避用)。
  async findByTweetIds(db: DB, tweetIds: string[]): Promise<StoredMention[]> {
    if (tweetIds.length === 0) return [];
    return db.select().from(mentions).where(inArray(mentions.tweetId, tweetIds));
  },
};
