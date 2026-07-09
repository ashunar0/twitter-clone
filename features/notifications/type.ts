import type {
  NotificationWire,
  NotificationsListResponseWire,
} from "./schema";

// wire == domain な現段階では alias で置く。
export type Notification = NotificationWire;
export type NotificationsData = NotificationsListResponseWire;
