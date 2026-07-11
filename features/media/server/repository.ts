import { and, eq, inArray, isNull } from "drizzle-orm";
import type { DB } from "../../../server/infra/db";
import { media, type MediaRow, type NewMediaRow } from "./table";

export type StoredMedia = MediaRow;

export const mediaRepository = {
  // 1 件 upload record を挿入。挿入後の row を返す。
  async insert(db: DB, row: NewMediaRow): Promise<StoredMedia> {
    const [inserted] = await db.insert(media).values(row).returning();
    if (!inserted) throw new Error("insert media failed");
    return inserted;
  },
  // 単体取得 (attachToTweet で uploader 権限確認する時に使う)。
  async findById(db: DB, id: string): Promise<StoredMedia | null> {
    const [row] = await db.select().from(media).where(eq(media.id, id));
    return row ?? null;
  },
  // orphan (tweetId=null) の media を tweet に紐付ける。uploader 権限を同時に検証。
  // 帰り値: 成功した media rows。存在しない / 別 uploader / 既 attach 済みは無視 (返り値から漏れる)。
  async attachToTweet(
    db: DB,
    mediaIds: string[],
    tweetId: string,
    uploaderId: string,
  ): Promise<StoredMedia[]> {
    if (mediaIds.length === 0) return [];
    const rows = await db
      .update(media)
      .set({ tweetId })
      .where(
        and(
          inArray(media.id, mediaIds),
          eq(media.uploaderId, uploaderId),
          isNull(media.tweetId),
        ),
      )
      .returning();
    return rows;
  },
  // enrichMany: 複数 tweetId に紐づく media を 1 クエリで取得 (N+1 回避)。
  async findByTweetIds(
    db: DB,
    tweetIds: string[],
  ): Promise<StoredMedia[]> {
    if (tweetIds.length === 0) return [];
    return db
      .select()
      .from(media)
      .where(inArray(media.tweetId, tweetIds));
  },
};
