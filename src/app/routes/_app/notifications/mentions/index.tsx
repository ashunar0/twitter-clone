import { createFileRoute } from "@tanstack/react-router";
import { NotificationsScreen } from "@/screens/notifications/NotificationsScreen";

// /notifications/mentions = @ツイート タブ (kind === "mention" のみ)。
// データ取得は親 layout の loader、絞り込みは client 側で行う (schema にまだ filter がない)。
export const Route = createFileRoute("/_app/notifications/mentions/")({
  component: () => <NotificationsScreen filter="mentions" />,
});
