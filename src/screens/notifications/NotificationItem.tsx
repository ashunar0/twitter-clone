import { Link } from "@tanstack/react-router";
import { MessageCircle, User } from "lucide-react";
import { Avatar } from "@/shared/ui/avatar";
import { TweetItem } from "@/widgets/tweet-item/TweetItem";
import type { Notification } from "@features/notifications/type";
import type { ActorSummary } from "@features/notifications/schema";
import type { Tweet } from "@features/tweets/type";
import type { AuthorSummary } from "@features/tweets/schema";
import { KIND_META } from "./notificationKindMeta";

// 通知 1 行の viewmodel。aggregate に対応: 複数 actor を並べたいので actor 単数から actors[] に変更。
// reply / mention の時は関連 tweet + その author を持って TweetItem を埋め込む。
export type NotificationRow = {
  notification: Notification;
  actors: ActorSummary[];
  targetTweet?: Tweet;
  targetAuthor?: AuthorSummary;
};

// 1 通知の表示。
// - reply / mention: 完全に timeline の 1 tweet として TweetItem を出す (kind icon やヘッダ文言なし)
// - follow / like / retweet: 左に色付き kind icon、右に actor avatar 群 + 1 行本文
// 未読は brand-blue の薄い tint で背景を出す (X 準拠)。row 全体は border-b で仕切る。
export function NotificationItem({ row }: { row: NotificationRow }) {
  const { notification, actors, targetTweet, targetAuthor } = row;
  const unreadClass = notification.isRead ? "" : "bg-brand-blue/5";

  // reply / mention は tweet 本体だけを見せる (TweetItem をそのまま出す)。
  // like / retweet は同じ targetTweet を持っているが、そちらは下段 preview として使うので分岐条件は kind で絞る。
  // reply の場合は「返信先: @xxx さん」を出したいので、mock では自分 (現ユーザ) の handle を仮に載せておく。
  const isEmbeddedTweet =
    (notification.kind === "reply" || notification.kind === "mention") &&
    targetTweet &&
    targetAuthor;
  if (isEmbeddedTweet) {
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
  const overflowAvatarCount = Math.max(
    0,
    notification.count - shownAvatars.length,
  );

  return (
    <li
      className={`flex cursor-pointer gap-3 border-b border-border px-2 py-3 hover:bg-fg/5 ${unreadClass}`}
    >
      {/* 左カラム: kind icon。avatar 行 (size-8 = 32px) と同高さの box に中央寄せして、
          隣の avatar と縦中心が揃うようにする。 */}
      <div className="flex size-8 w-10 shrink-0 items-center justify-end">
        <Icon className={`size-7 ${iconColor}`} aria-hidden />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        {/* aggregate は先頭 actor から順に avatar を並べる。1 人なら Link で profile へ、複数なら装飾に留める。 */}
        <div className="flex items-center gap-1">
          {shownAvatars.map((a, i) =>
            actors.length === 1 ? (
              // Link は <a> なので inline / 行内配置になり size-8 avatar の外側に line-height 分の余白が付く。
              // 明示的に flex 化して avatar と同高さで整える。
              <Link
                key={a.handle}
                to="/u/$handle"
                params={{ handle: a.handle }}
                className="flex"
              >
                <SmallAvatar actor={a} />
              </Link>
            ) : (
              <SmallAvatar key={a.handle + i} actor={a} />
            ),
          )}
          {overflowAvatarCount > 0 ? (
            <span className="text-xs text-fg-muted">
              +{overflowAvatarCount}
            </span>
          ) : null}
        </div>
        <p className="text-sm text-fg">
          {renderActorPhrase(actors, notification.count)}
          {suffix}
        </p>
        {/* like / retweet は対象 tweet の本文を薄色で下に載せる (X 準拠、内容確認できる)。 */}
        {targetTweet &&
        (notification.kind === "like" || notification.kind === "retweet") ? (
          <p className="whitespace-pre-wrap wrap-break-word text-sm text-fg-muted">
            {targetTweet.body}
          </p>
        ) : null}
      </div>
    </li>
  );
}

// aggregate の表示用文言。
// - count=1: "{actor1}さん"
// - count=2: "{actor1}さんと{actor2}さん"
// - count>=3: "{actor1}さんと他 {count-1} 人"
// actors[] が count に足りない場合も count 側を信じて「他 N 人」表記に落ちる。
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
