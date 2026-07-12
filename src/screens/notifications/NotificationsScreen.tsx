import { Link } from "@tanstack/react-router";
import {
  AtSign,
  Heart,
  MessageCircle,
  Repeat2,
  Settings,
  User,
  UserPlus,
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import { Avatar } from "@/shared/ui/avatar";
import { useNotificationsQuery } from "@features/notifications/client/queries";
import type { Notification } from "@features/notifications/type";
import type { ActorSummary } from "@features/notifications/schema";

// 通知一覧画面。上部に header (タイトル + 設定 icon)、下に通知 list を並べる。
export function NotificationsScreen() {
  const { data, isLoading, error } = useNotificationsQuery();

  if (isLoading) return <div className="p-6">Loading…</div>;
  if (error) return <div className="p-6 text-red-600">Failed to load</div>;
  if (!data) return null;

  return (
    <main className="min-h-svh w-full border-x border-border">
      <div className="my-4 px-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Notifications</h1>
        <Settings size={20} />
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
// suffix は actor 名の直後に続く固定文言 — 名前だけ bold 表示するため文字列を name / suffix に分けて持つ。
type KindMeta = {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  colorClass: string;
  suffix: string;
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
    suffix: " さんにフォローされました",
  },
  like: {
    icon: Heart,
    colorClass: "text-pink-500",
    suffix: " さんがあなたのツイートをいいねしました",
  },
  retweet: {
    icon: Repeat2,
    colorClass: "text-emerald-500",
    suffix: " さんがあなたのツイートをリツイートしました",
  },
  reply: {
    icon: MessageCircle,
    colorClass: "text-brand-blue",
    suffix: " さんがあなたのツイートに返信しました",
  },
  mention: {
    icon: AtSign,
    colorClass: "text-brand-blue",
    suffix: " さんがあなたにメンションしました",
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
  const suffix = meta?.suffix ?? ` did ${notification.kind}.`;

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
        <p className="text-sm text-fg">
          <strong className="font-bold">{actorName}</strong>
          {suffix}
        </p>
      </div>
    </li>
  );
}
