import { z } from "zod";

// 通知の wire 形。actor は cross-domain read model の inline shape。
export const notificationWireSchema = z.object({
  id: z.string(),
  kind: z.string(), // "follow" 等、将来拡張
  actorId: z.string(),
  isRead: z.boolean(),
  createdAt: z.string(),
});
export type NotificationWire = z.infer<typeof notificationWireSchema>;

export const actorSummarySchema = z.object({
  handle: z.string(),
  name: z.string(),
  avatarUrl: z.string().nullable(),
});
export type ActorSummary = z.infer<typeof actorSummarySchema>;

// GET /api/notifications の response。
export const notificationsListResponseSchema = z.object({
  notifications: z.array(notificationWireSchema),
  actorSummaries: z.record(z.string(), actorSummarySchema),
  unreadCount: z.number(),
});
export type NotificationsListResponseWire = z.infer<
  typeof notificationsListResponseSchema
>;
