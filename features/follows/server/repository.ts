import { and, eq, sql } from "drizzle-orm";
import { db } from "../../../server/lib/db";
import { follows } from "./table";

export const followsRepository = {
  // 1 件挿入。既存なら noop (冪等)。挿入が起きたか (新規かどうか) を返す。
  async insert(followerId: string, followeeId: string): Promise<boolean> {
    const result = await db
      .insert(follows)
      .values({ followerId, followeeId })
      .onConflictDoNothing()
      .returning({ followerId: follows.followerId });
    return result.length > 0;
  },
  // 1 件削除 (冪等)。
  async remove(followerId: string, followeeId: string): Promise<void> {
    await db
      .delete(follows)
      .where(
        and(
          eq(follows.followerId, followerId),
          eq(follows.followeeId, followeeId),
        ),
      );
  },
  // followerId が followeeId を follow しているか。
  async exists(followerId: string, followeeId: string): Promise<boolean> {
    const [row] = await db
      .select({ followerId: follows.followerId })
      .from(follows)
      .where(
        and(
          eq(follows.followerId, followerId),
          eq(follows.followeeId, followeeId),
        ),
      )
      .limit(1);
    return !!row;
  },
  // ある user が持つ followers / following 件数を返す。
  async counts(
    userId: string,
  ): Promise<{ followers: number; following: number }> {
    const [followersRow] = await db
      .select({ count: sql<number>`count(*)` })
      .from(follows)
      .where(eq(follows.followeeId, userId));
    const [followingRow] = await db
      .select({ count: sql<number>`count(*)` })
      .from(follows)
      .where(eq(follows.followerId, userId));
    return {
      followers: Number(followersRow?.count ?? 0),
      following: Number(followingRow?.count ?? 0),
    };
  },
};
