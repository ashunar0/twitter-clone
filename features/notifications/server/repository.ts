import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "../../../server/lib/db";
import { notifications, type NewNotificationRow, type NotificationRow } from "./table";

export type StoredNotification = NotificationRow;

export const notificationsRepository = {
  // 1 件挿入して row を返す。
  async insert(row: NewNotificationRow): Promise<StoredNotification> {
    const [inserted] = await db.insert(notifications).values(row).returning();
    if (!inserted) throw new Error("insert notification failed");
    return inserted;
  },
  // 特定 recipient の通知を新しい順で取得。
  async findByRecipient(
    recipientId: string,
    limit = 50,
  ): Promise<StoredNotification[]> {
    return db
      .select()
      .from(notifications)
      .where(eq(notifications.recipientId, recipientId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit);
  },
  // 未読件数。
  async countUnread(recipientId: string): Promise<number> {
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
  // 全通知を既読に。
  async markAllRead(recipientId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.recipientId, recipientId));
  },
};
