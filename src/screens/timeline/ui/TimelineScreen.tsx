import { Heart } from "lucide-react";
import { useTweetsQuery } from "@features/tweets/client/queries";
import type { Tweet } from "@features/tweets/type";
import type { AuthorSummary } from "@features/tweets/schema";
import { useToggleLikeMutation } from "@features/likes/client/mutations";
import { TweetComposer } from "./TweetComposer";

// public timeline 画面。read model (tweets + authorSummaries + likeState) を表示する。
export function TimelineScreen() {
  const { data, isLoading, error } = useTweetsQuery();
  const toggleLike = useToggleLikeMutation();

  if (isLoading) return <div className="p-6">Loading…</div>;
  if (error) return <div className="p-6 text-red-600">Failed to load</div>;
  if (!data) return null;

  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="mb-4 text-2xl font-bold">Timeline</h1>
      <TweetComposer />
      <ul className="flex flex-col gap-3">
        {data.tweets.map((tweet) => (
          <TweetItem
            key={tweet.id}
            tweet={tweet}
            author={data.authorSummaries[tweet.authorId]}
            likeCount={data.likeState.counts[tweet.id] ?? 0}
            mine={data.likeState.mineIds.has(tweet.id)}
            onToggle={(nextMine) =>
              toggleLike.mutate({ tweetId: tweet.id, nextMine })
            }
          />
        ))}
      </ul>
    </main>
  );
}

// 1 tweet + author + like を並べる item。UI polish は後の slice で。
function TweetItem({
  tweet,
  author,
  likeCount,
  mine,
  onToggle,
}: {
  tweet: Tweet;
  author: AuthorSummary | undefined;
  likeCount: number;
  mine: boolean;
  onToggle: (nextMine: boolean) => void;
}) {
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
          onClick={() => onToggle(!mine)}
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
