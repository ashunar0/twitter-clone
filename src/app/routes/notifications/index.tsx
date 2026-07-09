import { createFileRoute } from "@tanstack/react-router";
import { loadNotifications } from "@/screens/notifications/loader";
import { NotificationsScreen } from "@/screens/notifications/ui/NotificationsScreen";

export const Route = createFileRoute("/notifications/")({
  loader: ({ context: { queryClient } }) => loadNotifications(queryClient),
  component: NotificationsScreen,
});
