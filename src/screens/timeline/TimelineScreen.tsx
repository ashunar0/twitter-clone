import { useTweetsQuery } from "@features/tweets/client/queries";
import { TweetItem } from "@/widgets/tweet-item/TweetItem";
import { InfiniteScrollSentinel } from "@/shared/InfiniteScrollSentinel";
import { TweetComposer } from "./TweetComposer";

// public timeline 画面。read model (tweets + authorSummaries + like/retweet state) を表示。
// retweet header / media 表示は TweetItem 再拡張で戻す予定、今は body / counts の最小配線。
export function TimelineScreen() {
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useTweetsQuery();

  return (
    <main className="mx-auto min-h-svh w-full max-w-xl border-x border-border">
      <TweetComposer />
      {isLoading ? (
        <div className="p-6 text-sm text-fg-muted">Loading…</div>
      ) : error ? (
        <div className="p-6 text-sm text-red-600">Failed to load</div>
      ) : data ? (
        <>
          <ul className="flex flex-col">
            {data.tweets.map((tweet) => {
              // retweet 行なら元 tweet を表示、行 author (retweeter) は header 表示に使う。
              const isRt = tweet.retweetOfId != null;
              const original = isRt
                ? data.originalTweets[tweet.retweetOfId!]
                : null;
              const displayTweet = original?.tweet ?? tweet;
              const displayAuthor =
                original?.author ?? data.authorSummaries[tweet.authorId];
              const retweetedBy = isRt
                ? data.authorSummaries[tweet.authorId]
                : undefined;
              const id = displayTweet.id;
              return (
                <li key={tweet.id}>
                  <TweetItem
                    tweet={displayTweet}
                    author={displayAuthor}
                    retweetedBy={retweetedBy}
                    likeCount={data.likeState.counts[id] ?? 0}
                    retweetCount={data.retweetState.counts[id] ?? 0}
                    mineLike={data.likeState.mineIds.has(id)}
                    mineRetweet={data.retweetState.mineIds.has(id)}
                  />
                </li>
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
                  : "これ以上ツイートはありません"
            }
          />
        </>
      ) : null}
    </main>
  );
}
