import { useTweetsQuery } from "@features/tweets/client/queries";
import { TweetItem } from "@/widgets/tweet-item/TweetItem";
import { InfiniteScrollSentinel } from "@/shared/InfiniteScrollSentinel";
import { TweetComposer } from "./TweetComposer";

// public timeline 画面。read model (tweets + authorSummaries + likeState) を表示する。
// 末尾 sentinel が可視域に入ったら fetchNextPage で次 page を追加ロードする。
export function TimelineScreen() {
  const query = useTweetsQuery();
  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } = query;

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
      <InfiniteScrollSentinel
        onVisible={() => fetchNextPage()}
        disabled={!hasNextPage || isFetchingNextPage}
        label={
          isFetchingNextPage
            ? "Loading more…"
            : hasNextPage
              ? ""
              : "No more tweets."
        }
      />
    </main>
  );
}
