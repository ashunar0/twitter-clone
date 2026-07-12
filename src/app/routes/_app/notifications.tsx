import { createFileRoute } from "@tanstack/react-router";
import { loadNotifications } from "@/screens/notifications/loader";
import { NotificationsLayout } from "@/screens/notifications/NotificationsLayout";

// /notifications 配下 (すべて / @ツイート) の共通 layout route。loader もここで一度だけ走らせる。
export const Route = createFileRoute("/_app/notifications")({
  loader: ({ context: { queryClient } }) => loadNotifications(queryClient),
  component: NotificationsLayout,
});
