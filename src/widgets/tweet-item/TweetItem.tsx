import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { Heart, MessageCircle, Repeat2 } from "lucide-react";
import type { Tweet } from "@features/tweets/type";
import type { AuthorSummary } from "@features/tweets/schema";
import { useToggleLikeMutation } from "@features/likes/client/mutations";
import {
  useCreateTweetMutation,
  useToggleRetweetMutation,
} from "@features/tweets/client/mutations";
import { useCurrentProfileQuery } from "@features/profiles/client/queries";
import { Button } from "@/shared/ui/button";

// body 内の @handle を profile link に装飾する。handle は 3〜15 文字 [a-zA-Z0-9_]。
// BE 側の抽出 regex (features/tweets/server/usecases/createTweet.ts) と揃える。
const MENTION_RE = /(?<![a-zA-Z0-9_])@([a-zA-Z0-9_]{3,15})(?![a-zA-Z0-9_])/g;
function renderTweetBody(body: string) {
  const parts: (string | { handle: string; key: number })[] = [];
  let last = 0;
  let key = 0;
  for (const m of body.matchAll(MENTION_RE)) {
    const idx = m.index ?? 0;
    if (idx > last) parts.push(body.slice(last, idx));
    parts.push({ handle: m[1] ?? "", key: key++ });
    last = idx + m[0].length;
  }
  if (last < body.length) parts.push(body.slice(last));
  return parts.map((p) =>
    typeof p === "string" ? (
      p
    ) : (
      <Link
        key={`m${p.key}`}
        to="/u/$handle"
        params={{ handle: p.handle }}
        className="text-sky-600 hover:underline"
      >
        @{p.handle}
      </Link>
    ),
  );
}

const MAX_LENGTH = 280;

// 1 tweet + author + like/retweet/reply を並べる item。timeline / profile 両画面で共有する widget。
// retweet 表示は「retweetedBy がヘッダー、tweet/author は元 tweet 側」で受ける (screen 側で解決済み)。
// like / retweet の count / mine は元 tweet id に対する値を受ける (=display 対象の集計)。
export function TweetItem({
  tweet,
  author,
  retweetedBy,
  likeCount,
  mineLike,
  retweetCount,
  mineRetweet,
}: {
  tweet: Tweet;
  author: AuthorSummary | undefined;
  retweetedBy?: AuthorSummary;
  likeCount: number;
  mineLike: boolean;
  retweetCount: number;
  mineRetweet: boolean;
}) {
  const toggleLike = useToggleLikeMutation();
  const toggleRetweet = useToggleRetweetMutation();
  const [replying, setReplying] = useState(false);

  return (
    <li className="rounded-lg border border-neutral-200 p-4">
      {retweetedBy ? (
        <div className="mb-2 flex items-center gap-1 text-xs text-neutral-500">
          <Repeat2 size={14} />
          <span>{retweetedBy.name} が retweet</span>
        </div>
      ) : null}
      <div className="mb-1 text-sm text-neutral-600">
        <span className="font-semibold text-neutral-900">
          {author?.name ?? "unknown"}
        </span>
        <span className="ml-2">@{author?.handle ?? "unknown"}</span>
      </div>
      <p className="whitespace-pre-wrap">{renderTweetBody(tweet.body)}</p>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-neutral-400">{tweet.createdAt}</span>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setReplying((v) => !v)}
            aria-label={replying ? "Cancel reply" : "Reply"}
            className={`flex items-center gap-1 text-sm ${
              replying ? "text-sky-600" : "text-neutral-500 hover:text-sky-600"
            }`}
          >
            <MessageCircle size={16} />
          </button>
          <button
            type="button"
            onClick={() =>
              toggleRetweet.mutate({
                originalId: tweet.id,
                nextMine: !mineRetweet,
              })
            }
            aria-label={mineRetweet ? "Unretweet" : "Retweet"}
            className={`flex items-center gap-1 text-sm ${
              mineRetweet
                ? "text-emerald-600"
                : "text-neutral-500 hover:text-emerald-600"
            }`}
          >
            <Repeat2 size={16} />
            <span>{retweetCount}</span>
          </button>
          <button
            type="button"
            onClick={() =>
              toggleLike.mutate({ tweetId: tweet.id, nextMine: !mineLike })
            }
            aria-label={mineLike ? "Unlike" : "Like"}
            className={`flex items-center gap-1 text-sm ${
              mineLike ? "text-pink-600" : "text-neutral-500 hover:text-pink-600"
            }`}
          >
            <Heart size={16} fill={mineLike ? "currentColor" : "none"} />
            <span>{likeCount}</span>
          </button>
        </div>
      </div>
      {replying ? (
        <ReplyForm parentId={tweet.id} onDone={() => setReplying(false)} />
      ) : null}
    </li>
  );
}

// TweetItem 内の折り畳み reply 入力欄。parentId 付きで POST /api/tweets を叩く。
function ReplyForm({
  parentId,
  onDone,
}: {
  parentId: string;
  onDone: () => void;
}) {
  const currentProfileQuery = useCurrentProfileQuery();
  const currentProfile = currentProfileQuery.data;
  const createTweet = useCreateTweetMutation(currentProfile!);
  const [body, setBody] = useState("");
  const disabled =
    !currentProfile || body.trim().length === 0 || createTweet.isPending;

  // reply を発火、成功で入力欄を閉じる。
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (disabled || !currentProfile) return;
    createTweet.mutate(
      { body: body.trim(), parentId },
      {
        onSuccess: () => {
          setBody("");
          onDone();
        },
      },
    );
  };

  return (
    <form onSubmit={onSubmit} className="mt-3 flex flex-col gap-2">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Write a reply…"
        maxLength={MAX_LENGTH}
        rows={2}
        disabled={!currentProfile}
        className="w-full rounded-lg border border-neutral-300 p-2 text-sm focus:border-neutral-500 focus:outline-none"
      />
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onDone}
          className="text-sm text-neutral-500 hover:text-neutral-700"
        >
          Cancel
        </button>
        <Button
          type="submit"
          disabled={disabled}
          loading={createTweet.isPending}
        >
          Reply
        </Button>
      </div>
      {createTweet.isError ? (
        <div className="text-sm text-red-600">reply に失敗した。もう一度。</div>
      ) : null}
    </form>
  );
}
