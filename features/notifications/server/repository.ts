import { and, desc, eq, isNull, sql } from "drizzle-orm";
import type { DB } from "../../../server/infra/db";
import { notifications, type NotificationRow } from "./table";

// storage → domain 変換で actorIds を JSON parse する分岐用の型。
export type StoredNotification = Omit<NotificationRow, "actorIds"> & {
  actorIds: string[];
};

// row.actorIds は TEXT (JSON array) で持つ。読み出し時にここで array 化して以降のレイヤで扱いやすくする。
function toStored(row: NotificationRow): StoredNotification {
  return { ...row, actorIds: parseActorIds(row.actorIds) };
}

// JSON parse は broken row 保険で try/catch。破損時は空 array に落として続行 (通知は non-critical)。
function parseActorIds(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : [];
  } catch {
    return [];
  }
}

export const notificationsRepository = {
  // write-time aggregation の中核。
  // (recipient, kind, objectId, isRead=false) の unread aggregate を探し、
  // 見つかれば actorIds に append + count++ + lastAt = now で update、
  // 見つからなければ actorIds=[actorId], count=1 で新規 INSERT。
  // 既読になった aggregate には積み増さず、次の event が新 aggregate を作る挙動になる (X 準拠)。
  async findOrCreateAggregate(
    db: DB,
    input: {
      recipientId: string;
      kind: string;
      objectId: string | null;
      actorId: string;
    },
  ): Promise<StoredNotification> {
    const objectIdCond =
      input.objectId === null
        ? isNull(notifications.objectId)
        : eq(notifications.objectId, input.objectId);
    const [existing] = await db
      .select()
      .from(notifications)
      .where(
        and(
          eq(notifications.recipientId, input.recipientId),
          eq(notifications.kind, input.kind),
          objectIdCond,
          eq(notifications.isRead, false),
        ),
      )
      .limit(1);

    if (existing) {
      // 同 actor による重複 event (idempotent) の場合、actorIds は変えず lastAt だけ bump したい所だが、
      // 現状 like/retweet の toggle 側で二重発火はガードしている想定。ここでは append + count++ を素直に行う。
      const merged = [...parseActorIds(existing.actorIds), input.actorId];
      const [updated] = await db
        .update(notifications)
        .set({
          actorIds: JSON.stringify(merged),
          count: existing.count + 1,
          lastAt: sql`current_timestamp`,
        })
        .where(eq(notifications.id, existing.id))
        .returning();
      if (!updated) throw new Error("update notification aggregate failed");
      return toStored(updated);
    }

    const [inserted] = await db
      .insert(notifications)
      .values({
        id: crypto.randomUUID(),
        recipientId: input.recipientId,
        kind: input.kind,
        objectId: input.objectId,
        actorIds: JSON.stringify([input.actorId]),
        count: 1,
      })
      .returning();
    if (!inserted) throw new Error("insert notification aggregate failed");
    return toStored(inserted);
  },
  // 特定 recipient の aggregate を新しい順で取得。
  async findByRecipient(
    db: DB,
    recipientId: string,
    limit = 50,
  ): Promise<StoredNotification[]> {
    const rows = await db
      .select()
      .from(notifications)
      .where(eq(notifications.recipientId, recipientId))
      .orderBy(desc(notifications.lastAt))
      .limit(limit);
    return rows.map(toStored);
  },
  // 未読 aggregate の件数 (通知ベルの数字用)。event 数ではなく group 数を返す。
  async countUnread(db: DB, recipientId: string): Promise<number> {
    const [row] = await db
      .select({ count: sql<number>`count(*)` })
      .from(notifications)
      .where(
        and(
          eq(notifications.recipientId, recipientId),
          eq(notifications.isRead, false),
        ),
      );
    return Number(row?.count ?? 0);
  },
  // 全 aggregate を既読に。以降の event は新 aggregate を作る。
  async markAllRead(db: DB, recipientId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.recipientId, recipientId));
  },
};
