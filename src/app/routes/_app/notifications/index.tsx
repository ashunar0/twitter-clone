import { createFileRoute } from "@tanstack/react-router";
import { NotificationsScreen } from "@/screens/notifications/NotificationsScreen";

// /notifications = すべて タブ。データ取得は親 layout (notifications.tsx) の loader が担う。
export const Route = createFileRoute("/_app/notifications/")({
  component: () => <NotificationsScreen filter="all" />,
});
