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
        {data.tweets.map((tweet) => {
          // retweet 行なら元 tweet を display、行の author は "retweeter" として header に。
          const isRt = tweet.retweetOfId != null;
          const original = isRt ? data.originalTweets[tweet.retweetOfId!] : null;
          const displayTweet = original?.tweet ?? tweet;
          const displayAuthor = original?.author ?? data.authorSummaries[tweet.authorId];
          const retweetedBy = isRt ? data.authorSummaries[tweet.authorId] : undefined;
          const displayId = displayTweet.id;
          return (
            <TweetItem
              key={tweet.id}
              tweet={displayTweet}
              author={displayAuthor}
              retweetedBy={retweetedBy}
              likeCount={data.likeState.counts[displayId] ?? 0}
              mineLike={data.likeState.mineIds.has(displayId)}
              retweetCount={data.retweetState.counts[displayId] ?? 0}
              mineRetweet={data.retweetState.mineIds.has(displayId)}
              media={data.mediaSummaries[displayId]}
            />
          );
        })}
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
