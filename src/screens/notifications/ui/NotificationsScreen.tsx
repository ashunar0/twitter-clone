import { Link } from "@tanstack/react-router";
import { Button } from "@/shared/ui/button";
import { useNotificationsQuery } from "@features/notifications/client/queries";
import { useMarkAllReadMutation } from "@features/notifications/client/mutations";
import type { Notification } from "@features/notifications/type";
import type { ActorSummary } from "@features/notifications/schema";

// 通知一覧画面。unreadCount と Mark all read ボタンを上部に。
export function NotificationsScreen() {
  const { data, isLoading, error } = useNotificationsQuery();
  const markAllRead = useMarkAllReadMutation();

  if (isLoading) return <div className="p-6">Loading…</div>;
  if (error) return <div className="p-6 text-red-600">Failed to load</div>;
  if (!data) return null;

  return (
    <main className="mx-auto max-w-xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <Button
          variant="outline"
          disabled={data.unreadCount === 0 || markAllRead.isPending}
          onClick={() => markAllRead.mutate()}
        >
          Mark all read
        </Button>
      </div>
      <div className="mb-3 text-sm text-neutral-600">
        Unread: <strong className="text-neutral-900">{data.unreadCount}</strong>
      </div>
      {data.notifications.length === 0 ? (
        <p className="text-neutral-500">まだ通知はないのだ。</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {data.notifications.map((n) => (
            <NotificationItem
              key={n.id}
              notification={n}
              actor={data.actorSummaries[n.actorId]}
            />
          ))}
        </ul>
      )}
    </main>
  );
}

// 1 通知の表示。今は kind="follow" のみ対応、将来 like/reply/mention を追加。
function NotificationItem({
  notification,
  actor,
}: {
  notification: Notification;
  actor: ActorSummary | undefined;
}) {
  return (
    <li
      className={`rounded-lg border p-3 ${
        notification.isRead
          ? "border-neutral-200 bg-white"
          : "border-pink-200 bg-pink-50"
      }`}
    >
      <div className="text-sm">
        {actor ? (
          <Link to="/u/$handle" params={{ handle: actor.handle }} className="font-semibold hover:underline">
            {actor.name}
          </Link>
        ) : (
          <span>unknown</span>
        )}{" "}
        {describe(notification.kind)}
      </div>
      <div className="mt-1 text-xs text-neutral-400">
        {notification.createdAt}
      </div>
    </li>
  );
}

function describe(kind: string): string {
  if (kind === "follow") return "started following you.";
  return `did ${kind}.`;
}
