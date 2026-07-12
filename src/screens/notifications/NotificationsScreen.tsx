import { Link } from "@tanstack/react-router";
import {
  AtSign,
  Heart,
  MessageCircle,
  Repeat2,
  User,
  UserPlus,
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import { Avatar } from "@/shared/ui/avatar";
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
    <main className="w-full p-6">
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
        // FIXME: 通知が実データ 0 件のときの見た目確認用の仮 mock。動作確認終わったら消す。
        <ul className="flex flex-col">
          {MOCK_NOTIFICATIONS.map((n) => (
            <NotificationItem
              key={n.notification.id}
              notification={n.notification}
              actor={n.actor}
            />
          ))}
        </ul>
      ) : (
        <ul className="flex flex-col">
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

// kind ごとの見た目メタ (icon / 色 / 文言)。schema.kind は string なので未対応は default にフォールバック。
type KindMeta = {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  colorClass: string;
  describe: (name: string) => string;
};

// FIXME: 見た目確認用の仮データ。動作確認終わったら消す。
const MOCK_NOTIFICATIONS: {
  notification: Notification;
  actor: ActorSummary;
}[] = [
  {
    notification: {
      id: "m1",
      kind: "follow",
      actorId: "a1",
      isRead: false,
      createdAt: "2026-07-12",
    },
    actor: { handle: "anthropic", name: "Anthropic", avatarUrl: null },
  },
  {
    notification: {
      id: "m2",
      kind: "like",
      actorId: "a2",
      isRead: false,
      createdAt: "2026-07-12",
    },
    actor: { handle: "zundamon", name: "ずんだもん", avatarUrl: null },
  },
  {
    notification: {
      id: "m3",
      kind: "retweet",
      actorId: "a3",
      isRead: true,
      createdAt: "2026-07-11",
    },
    actor: { handle: "ashunar0", name: "あさひ", avatarUrl: null },
  },
  {
    notification: {
      id: "m4",
      kind: "reply",
      actorId: "a2",
      isRead: true,
      createdAt: "2026-07-11",
    },
    actor: { handle: "zundamon", name: "ずんだもん", avatarUrl: null },
  },
  {
    notification: {
      id: "m5",
      kind: "mention",
      actorId: "a1",
      isRead: true,
      createdAt: "2026-07-10",
    },
    actor: { handle: "anthropic", name: "Anthropic", avatarUrl: null },
  },
];

const KIND_META: Record<string, KindMeta> = {
  follow: {
    icon: UserPlus,
    colorClass: "text-brand-blue",
    describe: (name) => `${name} さんにフォローされました`,
  },
  like: {
    icon: Heart,
    colorClass: "text-pink-500",
    describe: (name) => `${name} さんがあなたのツイートをいいねしました`,
  },
  retweet: {
    icon: Repeat2,
    colorClass: "text-emerald-500",
    describe: (name) => `${name} さんがあなたのツイートをリツイートしました`,
  },
  reply: {
    icon: MessageCircle,
    colorClass: "text-brand-blue",
    describe: (name) => `${name} さんがあなたのツイートに返信しました`,
  },
  mention: {
    icon: AtSign,
    colorClass: "text-brand-blue",
    describe: (name) => `${name} さんがあなたにメンションしました`,
  },
};

// 1 通知の表示。左に色付き kind icon、右に actor avatar + 1 行本文。
// 未読は brand-blue の薄い tint で背景を出す (X 準拠)。row 全体は border-b で仕切る。
function NotificationItem({
  notification,
  actor,
}: {
  notification: Notification;
  actor: ActorSummary | undefined;
}) {
  const meta = KIND_META[notification.kind];
  const Icon = meta?.icon ?? MessageCircle;
  const iconColor = meta?.colorClass ?? "text-fg-muted";
  const actorName = actor?.name ?? "unknown";
  const text = meta
    ? meta.describe(actorName)
    : `${actorName} did ${notification.kind}.`;

  return (
    <li
      className={`flex cursor-pointer gap-3 border-b border-border px-2 py-3 hover:bg-fg/5 ${
        notification.isRead ? "" : "bg-brand-blue/5"
      }`}
    >
      {/* 左カラム: kind icon (中央より少し上寄せ)。avatar 列と幅を揃えて視覚リズムを作る。 */}
      <div className="flex w-10 shrink-0 justify-end pt-1">
        <Icon className={`size-7 ${iconColor}`} aria-hidden />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {actor ? (
          <Link to="/u/$handle" params={{ handle: actor.handle }}>
            <Avatar.Root className="size-8">
              {actor.avatarUrl ? (
                <Avatar.Image src={actor.avatarUrl} alt={actor.name} />
              ) : null}
              <Avatar.Fallback>
                <User className="size-4 text-fg-subtle" aria-hidden />
              </Avatar.Fallback>
            </Avatar.Root>
          </Link>
        ) : (
          <Avatar.Root className="size-8">
            <Avatar.Fallback>
              <User className="size-4 text-fg-subtle" aria-hidden />
            </Avatar.Fallback>
          </Avatar.Root>
        )}
        <p className="text-sm text-fg">{text}</p>
      </div>
    </li>
  );
}
