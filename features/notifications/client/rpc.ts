import { rpcClient } from "@/lib/hono/client";
import type { NotificationsListResponseWire } from "../schema";

export const notificationsRpc = {
  // GET /api/notifications — 通知一覧 + actor summary + unreadCount。
  async list(): Promise<NotificationsListResponseWire> {
    const res = await rpcClient.api.notifications.$get();
    if (!res.ok) throw new Error("failed to fetch notifications");
    return (await res.json()) as NotificationsListResponseWire;
  },
  // POST /api/notifications/mark-all-read — 全通知を既読化。
  async markAllRead(): Promise<void> {
    const res = await rpcClient.api.notifications["mark-all-read"].$post();
    if (!res.ok) throw new Error("failed to mark all read");
  },
};
