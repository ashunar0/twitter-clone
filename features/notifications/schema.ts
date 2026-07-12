import { z } from "zod";

// 通知 aggregate の wire 形。write-time aggregation に対応。
// - kind: "follow" / "like" / "retweet" / "reply" / "mention"
// - objectId: 対象 tweet id (follow は null)
// - actorIds: この aggregate に merge された actor id 群 (新しい順が望ましいが順序保証はしない)
// - count: aggregate に merge された event 数 (actorIds.length と一致するのが正常系)
// - firstAt / lastAt: 集約開始 / 最終更新時刻
export const notificationWireSchema = z.object({
  id: z.string(),
  kind: z.string(),
  objectId: z.string().nullable(),
  actorIds: z.array(z.string()),
  count: z.number(),
  isRead: z.boolean(),
  firstAt: z.string(),
  lastAt: z.string(),
});
export type NotificationWire = z.infer<typeof notificationWireSchema>;

export const actorSummarySchema = z.object({
  handle: z.string(),
  name: z.string(),
  avatarUrl: z.string().nullable(),
});
export type ActorSummary = z.infer<typeof actorSummarySchema>;

// GET /api/notifications の response。actorSummaries は全 aggregate の actorIds を union した集合。
export const notificationsListResponseSchema = z.object({
  notifications: z.array(notificationWireSchema),
  actorSummaries: z.record(z.string(), actorSummarySchema),
  unreadCount: z.number(),
});
export type NotificationsListResponseWire = z.infer<
  typeof notificationsListResponseSchema
>;
