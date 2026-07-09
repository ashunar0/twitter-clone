import { useTweetsQuery } from "@features/tweets/client/queries";
import { TweetItem } from "@/widgets/tweet-item/ui/TweetItem";
import { TweetComposer } from "./TweetComposer";

// public timeline 画面。read model (tweets + authorSummaries + likeState) を表示する。
export function TimelineScreen() {
  const { data, isLoading, error } = useTweetsQuery();

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
          />
        ))}
      </ul>
    </main>
  );
}
