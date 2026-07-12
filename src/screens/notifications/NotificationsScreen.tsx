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
import { TweetItem } from "@/widgets/tweet-item/TweetItem";
import { useNotificationsQuery } from "@features/notifications/client/queries";
import type { Notification } from "@features/notifications/type";
import type { ActorSummary } from "@features/notifications/schema";
import type { Tweet } from "@features/tweets/type";
import type { AuthorSummary } from "@features/tweets/schema";

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

// 通知 1 行の viewmodel。aggregate に対応: 複数 actor を並べたいので actor 単数から actors[] に変更。
// reply / mention の時は関連 tweet + その author を持って TweetItem を埋め込む。
type NotificationRow = {
  notification: Notification;
  actors: ActorSummary[];
  targetTweet?: Tweet;
  targetAuthor?: AuthorSummary;
};

// kind ごとの見た目メタ (icon / 色 / 文言)。suffix は actor 表示の直後に続く固定文言。
type KindMeta = {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  colorClass: string;
  suffix: string;
};

// FIXME: 見た目確認用の仮データ。動作確認終わったら消す。
// follow は aggregate (count=2 と count=12 の例)、reply / mention は個別 aggregate (count=1)。
const MOCK_NOTIFICATIONS: NotificationRow[] = [
  {
    notification: {
      id: "m1",
      kind: "follow",
      objectId: null,
      actorIds: ["a1", "a3"],
      count: 2,
      isRead: false,
      firstAt: "2026-07-12T00:00:00Z",
      lastAt: "2026-07-12T00:00:00Z",
    },
    actors: [
      { handle: "anthropic", name: "Anthropic", avatarUrl: null },
      { handle: "ashunar0", name: "あさひ", avatarUrl: null },
    ],
  },
  {
    notification: {
      id: "m2",
      kind: "like",
      objectId: "your-tweet",
      actorIds: ["a2"],
      count: 1,
      isRead: false,
      firstAt: "2026-07-12T00:00:00Z",
      lastAt: "2026-07-12T00:00:00Z",
    },
    actors: [{ handle: "zundamon", name: "ずんだもん", avatarUrl: null }],
  },
  {
    notification: {
      id: "m3",
      kind: "retweet",
      objectId: "your-tweet",
      actorIds: [
        "a3", "a2", "a1", "a4", "a5", "a6", "a7", "a8", "a9", "a10", "a11", "a12",
      ],
      count: 12,
      isRead: true,
      firstAt: "2026-07-11T00:00:00Z",
      lastAt: "2026-07-11T00:00:00Z",
    },
    actors: [
      { handle: "ashunar0", name: "あさひ", avatarUrl: null },
      { handle: "zundamon", name: "ずんだもん", avatarUrl: null },
      { handle: "anthropic", name: "Anthropic", avatarUrl: null },
      { handle: "cloudflare", name: "Cloudflare", avatarUrl: null },
      { handle: "tanstack", name: "TanStack", avatarUrl: null },
      { handle: "react", name: "React", avatarUrl: null },
      { handle: "drizzle", name: "Drizzle", avatarUrl: null },
      { handle: "hono", name: "Hono", avatarUrl: null },
      { handle: "vite", name: "Vite", avatarUrl: null },
      { handle: "typescript", name: "TypeScript", avatarUrl: null },
      { handle: "vercel", name: "Vercel", avatarUrl: null },
      { handle: "supabase", name: "Supabase", avatarUrl: null },
    ],
  },
  {
    notification: {
      id: "m4",
      kind: "reply",
      objectId: "mt4",
      actorIds: ["a2"],
      count: 1,
      isRead: true,
      firstAt: "2026-07-11T10:00:00Z",
      lastAt: "2026-07-11T10:00:00Z",
    },
    actors: [{ handle: "zundamon", name: "ずんだもん", avatarUrl: null }],
    targetTweet: {
      id: "mt4",
      authorId: "a2",
      parentId: "your-tweet",
      retweetOfId: null,
      body: "なるほどなのだ！これで疑問が解けたのだ〜",
      createdAt: "2026-07-11T10:00:00Z",
    },
    targetAuthor: { handle: "zundamon", name: "ずんだもん", avatarUrl: null },
  },
  {
    notification: {
      id: "m5",
      kind: "mention",
      objectId: "mt5",
      actorIds: ["a1"],
      count: 1,
      isRead: true,
      firstAt: "2026-07-10T15:00:00Z",
      lastAt: "2026-07-10T15:00:00Z",
    },
    actors: [{ handle: "anthropic", name: "Anthropic", avatarUrl: null }],
    targetTweet: {
      id: "mt5",
      authorId: "a1",
      parentId: null,
      retweetOfId: null,
      body: "@zundamon 新機能リリースしましたので、ぜひ試してみてください！",
      createdAt: "2026-07-10T15:00:00Z",
    },
    targetAuthor: { handle: "anthropic", name: "Anthropic", avatarUrl: null },
  },
];

const KIND_META: Record<string, KindMeta> = {
  follow: {
    icon: UserPlus,
    colorClass: "text-brand-blue",
    suffix: "にフォローされました",
  },
  like: {
    icon: Heart,
    colorClass: "text-pink-500",
    suffix: "があなたのツイートをいいねしました",
  },
  retweet: {
    icon: Repeat2,
    colorClass: "text-emerald-500",
    suffix: "があなたのツイートをリツイートしました",
  },
  reply: {
    icon: MessageCircle,
    colorClass: "text-brand-blue",
    suffix: "があなたのツイートに返信しました",
  },
  mention: {
    icon: AtSign,
    colorClass: "text-brand-blue",
    suffix: "があなたにメンションしました",
  },
};

// aggregate の表示用文言を組み立てる。
// - count=1: "{actor1}さん"
// - count=2: "{actor1}さんと{actor2}さん"
// - count>=3: "{actor1}さんと他 {count-1} 人"
// actors[] が count に足りない (server-side で先頭 N しか返さない構成の場合) も、count 側を信じて他 N 人表記に落ちる。
function renderActorPhrase(actors: ActorSummary[], count: number) {
  const first = actors[0]?.name ?? "unknown";
  if (count <= 1) {
    return (
      <>
        <strong className="font-bold">{first}</strong>さん
      </>
    );
  }
  if (count === 2) {
    const second = actors[1]?.name ?? "unknown";
    return (
      <>
        <strong className="font-bold">{first}</strong>さんと
        <strong className="font-bold">{second}</strong>さん
      </>
    );
  }
  return (
    <>
      <strong className="font-bold">{first}</strong>さんと他 {count - 1} 人
    </>
  );
}

// 1 通知の表示。
// - reply / mention: 完全に timeline の 1 tweet として TweetItem を出す (kind icon やヘッダ文言なし)
// - follow / like / retweet: 左に色付き kind icon、右に actor avatar 群 + 1 行本文
// 未読は brand-blue の薄い tint で背景を出す (X 準拠)。row 全体は border-b で仕切る。
function NotificationItem({ row }: { row: NotificationRow }) {
  const { notification, actors, targetTweet, targetAuthor } = row;
  const unreadClass = notification.isRead ? "" : "bg-brand-blue/5";

  // reply / mention は tweet 本体だけを見せる。TweetItem 自身が article + border-b を持つのでそのまま li にラップする。
  // reply の場合は「返信先: @xxx さん」を出したいので、mock では自分 (現ユーザ) の handle を仮に載せておく。
  if (targetTweet && targetAuthor) {
    const replyingTo =
      notification.kind === "reply" ? { handle: "zundamon" } : undefined;
    return (
      <li className={unreadClass}>
        <TweetItem
          tweet={targetTweet}
          author={targetAuthor}
          replyingTo={replyingTo}
        />
      </li>
    );
  }

  const meta = KIND_META[notification.kind];
  const Icon = meta?.icon ?? MessageCircle;
  const iconColor = meta?.colorClass ?? "text-fg-muted";
  const suffix = meta?.suffix ?? ` did ${notification.kind}.`;
  // 先頭 10 人までは avatar を並べて、それ以上は「+N」で潰す。
  const shownAvatars = actors.slice(0, 10);
  const overflowAvatarCount = Math.max(0, notification.count - shownAvatars.length);

  return (
    <li
      className={`flex cursor-pointer gap-3 border-b border-border px-2 py-3 hover:bg-fg/5 ${unreadClass}`}
    >
      {/* 左カラム: kind icon (中央より少し上寄せ)。avatar 列と幅を揃えて視覚リズムを作る。 */}
      <div className="flex w-10 shrink-0 justify-end pt-1">
        <Icon className={`size-7 ${iconColor}`} aria-hidden />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {/* aggregate は先頭 actor から順に avatar を並べる。1 人なら Link で profile へ、複数なら装飾に留める。 */}
        <div className="flex items-center gap-1">
          {shownAvatars.map((a, i) =>
            actors.length === 1 ? (
              <Link key={a.handle} to="/u/$handle" params={{ handle: a.handle }}>
                <SmallAvatar actor={a} />
              </Link>
            ) : (
              <SmallAvatar key={a.handle + i} actor={a} />
            ),
          )}
          {overflowAvatarCount > 0 ? (
            <span className="text-xs text-fg-muted">+{overflowAvatarCount}</span>
          ) : null}
        </div>
        <p className="text-sm text-fg">
          {renderActorPhrase(actors, notification.count)}
          {suffix}
        </p>
      </div>
    </li>
  );
}

// 通知 header 用の小さめ avatar (32px)。fallback は user icon。
function SmallAvatar({ actor }: { actor: ActorSummary }) {
  return (
    <Avatar.Root className="size-8">
      {actor.avatarUrl ? (
        <Avatar.Image src={actor.avatarUrl} alt={actor.name} />
      ) : null}
      <Avatar.Fallback>
        <User className="size-4 text-fg-subtle" aria-hidden />
      </Avatar.Fallback>
    </Avatar.Root>
  );
}
