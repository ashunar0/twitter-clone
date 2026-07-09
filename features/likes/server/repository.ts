import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "../../../server/lib/db";
import { likes } from "./table";

export const likesRepository = {
  // 1 件 like を挿入。既存なら noop (idempotent)。
  async insert(tweetId: string, userId: string): Promise<void> {
    await db
      .insert(likes)
      .values({ tweetId, userId })
      .onConflictDoNothing();
  },
  // 1 件 like を削除。存在しなくても noop。
  async remove(tweetId: string, userId: string): Promise<void> {
    await db
      .delete(likes)
      .where(and(eq(likes.tweetId, tweetId), eq(likes.userId, userId)));
  },
  // 指定 tweetIds について、user が like しているものだけを返す (cross-feature enrichment 用)。
  async findMineIds(tweetIds: string[], userId: string): Promise<string[]> {
    if (tweetIds.length === 0) return [];
    const rows = await db
      .select({ tweetId: likes.tweetId })
      .from(likes)
      .where(and(inArray(likes.tweetId, tweetIds), eq(likes.userId, userId)));
    return rows.map((r) => r.tweetId);
  },
  // 指定 tweetIds ごとの like 件数を Map で返す (N+1 回避)。
  async countByTweetIds(tweetIds: string[]): Promise<Map<string, number>> {
    if (tweetIds.length === 0) return new Map();
    const rows = await db
      .select({ tweetId: likes.tweetId, count: sql<number>`count(*)` })
      .from(likes)
      .where(inArray(likes.tweetId, tweetIds))
      .groupBy(likes.tweetId);
    return new Map(rows.map((r) => [r.tweetId, Number(r.count)]));
  },
};
