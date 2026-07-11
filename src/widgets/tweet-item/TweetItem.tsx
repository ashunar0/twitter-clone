import type { ReactNode } from "react";
import { Heart, MessageCircle, Repeat2, Share, User } from "lucide-react";
import { Avatar } from "@/shared/ui/avatar";
import { useToggleLikeMutation } from "@features/likes/client/mutations";
import { useToggleRetweetMutation } from "@features/tweets/client/mutations";

// timeline / thread に並べる 1 ツイート表示。
// like / retweet は id + mine 状態を受け取って自前で mutation を発火する。
export type TweetItemProps = {
  // target tweet の id (retweet 行の場合は元 tweet の id)。like / retweet が指す先。
  id: string;
  author: {
    name: string;
    handle: string;
    avatarUrl?: string | null;
  };
  body: string;
  // ISO 文字列。表示は相対時刻に整形する。
  createdAt: string;
  replyCount?: number;
  retweetCount?: number;
  likeCount?: number;
  mineLike?: boolean;
  mineRetweet?: boolean;
};

export function TweetItem({
  id,
  author,
  body,
  createdAt,
  replyCount = 0,
  retweetCount = 0,
  likeCount = 0,
  mineLike = false,
  mineRetweet = false,
}: TweetItemProps) {
  const toggleLike = useToggleLikeMutation();
  const toggleRetweet = useToggleRetweetMutation();

  const onLike = () => toggleLike.mutate({ tweetId: id, nextMine: !mineLike });
  const onRetweet = () =>
    toggleRetweet.mutate({ originalId: id, nextMine: !mineRetweet });

  return (
    <article className="flex gap-3 border-b border-border px-4 py-3">
      <Avatar.Root className="size-10 shrink-0">
        {/* src が無い時に <img> を描くと alt が視覚露出するので、URL がある時だけ Image を出す */}
        {author.avatarUrl ? (
          <Avatar.Image src={author.avatarUrl} alt={author.name} />
        ) : null}
        <Avatar.Fallback>
          <User className="size-5 text-fg-subtle" aria-hidden />
        </Avatar.Fallback>
      </Avatar.Root>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <header className="flex items-center gap-1 text-sm">
          <span className="truncate font-bold text-fg">{author.name}</span>
          <span className="truncate text-fg-muted">@{author.handle}</span>
          <span className="text-fg-muted">·</span>
          <time className="text-fg-muted" dateTime={createdAt}>
            {formatRelativeTime(createdAt)}
          </time>
        </header>
        <p className="whitespace-pre-wrap wrap-break-word text-sm text-fg">
          {body}
        </p>
        <footer className="mt-2 flex max-w-md items-center justify-between text-fg-muted">
          <ActionButton
            icon={<MessageCircle className="size-4" />}
            count={replyCount}
            hoverColor="hover:text-brand-blue"
            hoverBg="group-hover:bg-brand-blue/10"
          />
          <ActionButton
            icon={
              <Repeat2
                className={`size-4 ${mineRetweet ? "text-green-600" : ""}`}
              />
            }
            count={retweetCount}
            active={mineRetweet}
            activeColor="text-green-600"
            hoverColor="hover:text-green-600"
            hoverBg="group-hover:bg-green-600/10"
            onClick={onRetweet}
            disabled={toggleRetweet.isPending}
            ariaLabel={mineRetweet ? "リツイート解除" : "リツイート"}
          />
          <ActionButton
            icon={
              <Heart
                className={`size-4 ${mineLike ? "fill-pink-600 text-pink-600" : ""}`}
              />
            }
            count={likeCount}
            active={mineLike}
            activeColor="text-pink-600"
            hoverColor="hover:text-pink-600"
            hoverBg="group-hover:bg-pink-600/10"
            onClick={onLike}
            disabled={toggleLike.isPending}
            ariaLabel={mineLike ? "いいね解除" : "いいね"}
          />
          <ActionButton
            icon={<Share className="size-4" />}
            hoverColor="hover:text-brand-blue"
            hoverBg="group-hover:bg-brand-blue/10"
          />
        </footer>
      </div>
    </article>
  );
}

// action row の 1 個 (icon + optional count)。hover でうっすら色が変わる、count 0 は非表示。
// active 状態は色を上塗り、click は親から差し込み。
function ActionButton({
  icon,
  count,
  active = false,
  activeColor,
  hoverColor,
  hoverBg,
  onClick,
  disabled,
  ariaLabel,
}: {
  icon: ReactNode;
  count?: number;
  active?: boolean;
  activeColor?: string;
  hoverColor?: string;
  hoverBg?: string;
  onClick?: () => void;
  disabled?: boolean;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-pressed={active}
      className={`group flex min-w-14 items-center gap-1 text-xs tabular-nums transition-colors disabled:opacity-50 ${active && activeColor ? activeColor : ""} ${hoverColor ?? "hover:text-fg"}`}
    >
      {/* hover bg は icon の背後だけに丸く出す (Twitter 準拠)。button 全体には出さない。 */}
      <span
        className={`flex size-8 items-center justify-center rounded-full transition-colors ${hoverBg ?? "group-hover:bg-hover"}`}
      >
        {icon}
      </span>
      {/* count > 0 の時だけ数字を出すが、非表示時も同じ幅を占有するため min-w を button 側に確保する。 */}
      {count && count > 0 ? <span>{count}</span> : null}
    </button>
  );
}

// 相対時刻整形 (仮実装): 分/時/日、それ以上は月日で。i18n / library はまだ入れない。
function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diffMs / 60_000);
  if (min < 1) return "now";
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d`;
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}
