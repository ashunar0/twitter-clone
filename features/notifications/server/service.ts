import type { ActorSummary, NotificationsListResponseWire } from "../schema";
import type { DB } from "../../../server/lib/db";
import { usersRepository, type StoredUser } from "../../users/server/repository";
import { notificationsRepository, type StoredNotification } from "./repository";

// DB row → wire 形。
function toWire(row: StoredNotification) {
  return {
    id: row.id,
    kind: row.kind,
    actorId: row.actorId,
    isRead: row.isRead,
    createdAt: row.createdAt,
  };
}

function toActorSummary(row: StoredUser): ActorSummary {
  return {
    handle: row.handle,
    name: row.name,
    avatarUrl: row.avatarUrl,
  };
}

export const notificationsService = {
  // usecase から呼ばれる。特定 recipient に対して actor が起こした kind の通知を記録する。
  async record(
    db: DB,
    input: { kind: string; recipientId: string; actorId: string },
  ): Promise<void> {
    await notificationsRepository.insert(db, {
      id: crypto.randomUUID(),
      recipientId: input.recipientId,
      kind: input.kind,
      actorId: input.actorId,
    });
  },
  // list: current user 宛の通知 + actor summary + unreadCount を返す (cross-domain read model)。
  async list(
    db: DB,
    currentUserId: string,
  ): Promise<NotificationsListResponseWire> {
    const rows = await notificationsRepository.findByRecipient(db, currentUserId);
    const actorIds = [...new Set(rows.map((r) => r.actorId))];
    const [actors, unreadCount] = await Promise.all([
      usersRepository.findByIds(db, actorIds),
      notificationsRepository.countUnread(db, currentUserId),
    ]);
    const actorMap = new Map(actors.map((a) => [a.id, a]));
    const actorSummaries: Record<string, ActorSummary> = {};
    for (const id of actorIds) {
      const row = actorMap.get(id);
      if (row) actorSummaries[id] = toActorSummary(row);
    }
    return {
      notifications: rows.map(toWire),
      actorSummaries,
      unreadCount,
    };
  },
  // 全通知を既読にする。
  async markAllRead(db: DB, currentUserId: string): Promise<void> {
    await notificationsRepository.markAllRead(db, currentUserId);
  },
};
