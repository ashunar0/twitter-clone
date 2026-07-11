import type { ReactNode } from "react";
import { Heart, MessageCircle, Repeat2, Share } from "lucide-react";
import { Avatar } from "@/shared/ui/avatar";

// timeline / thread に並べる 1 ツイート表示。仮 UI、実データ配線は後で差し込む。
export type TweetItemProps = {
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
};

export function TweetItem({
  author,
  body,
  createdAt,
  replyCount = 0,
  retweetCount = 0,
  likeCount = 0,
}: TweetItemProps) {
  return (
    <article className="flex gap-3 border-b border-border px-4 py-3">
      <Avatar.Root className="size-10 shrink-0">
        <Avatar.Image src={author.avatarUrl ?? undefined} alt={author.name} />
        <Avatar.Fallback name={author.name} />
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
          />
          <ActionButton
            icon={<Repeat2 className="size-4" />}
            count={retweetCount}
          />
          <ActionButton icon={<Heart className="size-4" />} count={likeCount} />
          <ActionButton icon={<Share className="size-4" />} />
        </footer>
      </div>
    </article>
  );
}

// action row の 1 個 (icon + optional count)。hover でうっすら色が変わる、count 0 は非表示。
function ActionButton({ icon, count }: { icon: ReactNode; count?: number }) {
  return (
    <button
      type="button"
      className="flex items-center gap-1 rounded-full px-2 py-1 text-xs hover:bg-hover hover:text-fg"
    >
      {icon}
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
