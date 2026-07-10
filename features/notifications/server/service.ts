import type { ActorSummary, NotificationsListResponseWire } from "../schema";
import type { DB } from "../../../server/lib/db";
import {
  profilesRepository,
  type StoredProfileWithUser,
} from "../../profiles/server/repository";
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

// profile+user JOIN 行 → ActorSummary (handle/name/avatarUrl)。
function toActorSummary(row: StoredProfileWithUser): ActorSummary {
  return {
    handle: row.profile.handle,
    name: row.user.name,
    avatarUrl: row.user.image ?? null,
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
    const [profileRows, unreadCount] = await Promise.all([
      profilesRepository.findByUserIds(db, actorIds),
      notificationsRepository.countUnread(db, currentUserId),
    ]);
    const actorSummaries: Record<string, ActorSummary> = {};
    for (const row of profileRows) {
      actorSummaries[row.profile.userId] = toActorSummary(row);
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
