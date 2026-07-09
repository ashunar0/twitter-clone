import { Heart } from "lucide-react";
import type { Tweet } from "@features/tweets/type";
import type { AuthorSummary } from "@features/tweets/schema";
import { useToggleLikeMutation } from "@features/likes/client/mutations";

// 1 tweet + author + like を並べる item。timeline / profile 両画面で共有する widget。
// data-fetch を持たず props で受ける (widget 規約: 内部で mutation は起動可、query は上位で)。
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
    </li>
  );
}
