import { useNotificationsQuery } from "@features/notifications/client/queries";
import type { ActorSummary } from "@features/notifications/schema";
import { NotificationItem, type NotificationRow } from "./NotificationItem";
import { MOCK_NOTIFICATIONS } from "./mockNotifications";

// 通知一覧の list 本体。header / タブは NotificationsLayout 側が持ち、ここでは中身だけを返す。
// filter="mentions" のときは kind === "mention" のみを表示する (X の /notifications/mentions 相当)。
export function NotificationsScreen({
  filter = "all",
}: {
  filter?: "all" | "mentions";
} = {}) {
  const { data, isLoading, error } = useNotificationsQuery();

  if (isLoading) return <div className="p-6">Loading…</div>;
  if (error) return <div className="p-6 text-red-600">Failed to load</div>;
  if (!data) return null;

  // 実データが 0 件のときだけ仮 mock を出す。mentions タブでは mention だけに絞る。
  const items: NotificationRow[] =
    data.notifications.length === 0
      ? MOCK_NOTIFICATIONS
      : data.notifications.map((n) => ({
          notification: n,
          actors: n.actorIds
            .map((id) => data.actorSummaries[id])
            .filter((a): a is ActorSummary => !!a),
        }));
  const filtered =
    filter === "mentions"
      ? items.filter((i) => i.notification.kind === "mention")
      : items;

  return (
    <ul className="flex flex-col">
      {filtered.map((row) => (
        <NotificationItem key={row.notification.id} row={row} />
      ))}
    </ul>
  );
}
