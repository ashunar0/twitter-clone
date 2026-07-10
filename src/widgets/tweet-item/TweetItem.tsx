import { useState, type FormEvent } from "react";
import { Heart, MessageCircle } from "lucide-react";
import type { Tweet } from "@features/tweets/type";
import type { AuthorSummary } from "@features/tweets/schema";
import { useToggleLikeMutation } from "@features/likes/client/mutations";
import { useCreateTweetMutation } from "@features/tweets/client/mutations";
import { useCurrentProfileQuery } from "@features/profiles/client/queries";
import { Button } from "@/shared/ui/button";

const MAX_LENGTH = 280;

// 1 tweet + author + like + reply を並べる item。timeline / profile 両画面で共有する widget。
// data-fetch を持たず props で受ける (widget 規約: 内部で mutation は起動可、query は上位で)。
// current user 取得だけは reply 発火に必須なので widget 内 query として許容。
export function TweetItem({
  tweet,
  author,
  likeCount,
  mine,
}: {
  tweet: Tweet;
  author: AuthorSummary | undefined;
  likeCount: number;
  mine: boolean;
}) {
  const toggleLike = useToggleLikeMutation();
  const [replying, setReplying] = useState(false);

  return (
    <li className="rounded-lg border border-neutral-200 p-4">
      <div className="mb-1 text-sm text-neutral-600">
        <span className="font-semibold text-neutral-900">
          {author?.name ?? "unknown"}
        </span>
        <span className="ml-2">@{author?.handle ?? "unknown"}</span>
      </div>
      <p className="whitespace-pre-wrap">{tweet.body}</p>
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
              toggleLike.mutate({ tweetId: tweet.id, nextMine: !mine })
            }
            aria-label={mine ? "Unlike" : "Like"}
            className={`flex items-center gap-1 text-sm ${
              mine ? "text-pink-600" : "text-neutral-500 hover:text-pink-600"
            }`}
          >
            <Heart size={16} fill={mine ? "currentColor" : "none"} />
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
