import { Hono } from "hono";
import { withCurrentUser, type AuthVariables } from "../../../server/lib/currentUser";
import { notificationsService } from "./service";

const notifications = new Hono<{ Variables: AuthVariables }>()
  .use("*", withCurrentUser)
  // GET /api/notifications — current user 宛の通知 + actor summary + unreadCount。
  .get("/", async (c) => {
    const currentUser = c.get("currentUser");
    const data = await notificationsService.list(currentUser.id);
    return c.json(data);
  })
  // POST /api/notifications/mark-all-read — 全通知を既読化 (unreadCount → 0)。
  .post("/mark-all-read", async (c) => {
    const currentUser = c.get("currentUser");
    await notificationsService.markAllRead(currentUser.id);
    return c.body(null, 204);
  });

export default notifications;
