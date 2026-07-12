import type {
  ActorSummary,
  NotificationsListResponseWire,
  NotificationWire,
} from "../schema";
import type { DB } from "../../../server/infra/db";
import {
  profilesRepository,
  type StoredProfileWithUser,
} from "../../profiles/server/repository";
import { notificationsRepository, type StoredNotification } from "./repository";

// DB stored → wire 形。actorIds は既に array 化されている (repository で JSON parse 済み)。
function toWire(row: StoredNotification): NotificationWire {
  return {
    id: row.id,
    kind: row.kind,
    objectId: row.objectId,
    actorIds: row.actorIds,
    count: row.count,
    isRead: row.isRead,
    firstAt: row.firstAt,
    lastAt: row.lastAt,
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
  // usecase から呼ばれる。特定 recipient に対して actor が起こした kind の event を集約先に merge or 新規作成する。
  // objectId は集約 key の一部 (follow は null、like/retweet/reply/mention は対象 tweet id)。
  async record(
    db: DB,
    input: {
      kind: string;
      recipientId: string;
      actorId: string;
      objectId: string | null;
    },
  ): Promise<void> {
    await notificationsRepository.findOrCreateAggregate(db, input);
  },
  // list: current user 宛の aggregate 群 + 全 actorIds を union した actorSummaries + unreadCount を返す。
  async list(
    db: DB,
    currentUserId: string,
  ): Promise<NotificationsListResponseWire> {
    const rows = await notificationsRepository.findByRecipient(db, currentUserId);
    const actorIds = [...new Set(rows.flatMap((r) => r.actorIds))];
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
  // 全 aggregate を既読に。以降の event は新 aggregate として作られる。
  async markAllRead(db: DB, currentUserId: string): Promise<void> {
    await notificationsRepository.markAllRead(db, currentUserId);
  },
};
