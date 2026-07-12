import { useProfileByHandleQuery } from "@features/profiles/client/queries";
import { useUserTweetsQuery } from "@features/tweets/client/queries";
import { TweetItem } from "@/widgets/tweet-item/TweetItem";
import { InfiniteScrollSentinel } from "@/shared/InfiniteScrollSentinel";

// user profile のタブ配下 (ツイート / 返信 / メディア) の list 本体。
// header / banner / タブは UserProfileLayout 側が持ち、ここでは中身だけを返す。
// filter で client 側絞り込み: replies=parentId あり、media=mediaSummaries に紐付きあり、posts=それ以外。
export function UserProfileScreen({
  handle,
  filter = "posts",
}: {
  handle: string;
  filter?: "posts" | "replies" | "media";
}) {
  const profileQuery = useProfileByHandleQuery(handle);
  const profile = profileQuery.data;
  const tweetsQuery = useUserTweetsQuery(profile?.userId ?? "");

  const tweets = tweetsQuery.data;
  if (tweetsQuery.isLoading || !tweets)
    return <div className="p-6 text-sm text-fg-muted">Loading tweets…</div>;

  const filtered = tweets.tweets.filter((t) => {
    if (filter === "replies") return t.parentId != null;
    if (filter === "media")
      return (tweets.mediaSummaries[t.id]?.length ?? 0) > 0;
    // posts: reply でも media 単体でもない (RT は含む、X 準拠)。
    return t.parentId == null;
  });

  if (filtered.length === 0) {
    return (
      <p className="p-6 text-center text-sm text-fg-muted">
        {filter === "replies"
          ? "返信はありません。"
          : filter === "media"
            ? "メディアはありません。"
            : "ツイートはありません。"}
      </p>
    );
  }

  return (
    <>
      <ul className="flex flex-col">
        {filtered.map((tweet) => {
          // retweet 行なら元 tweet を表示、行 author (retweeter) は上に「◯◯ さんがリツイート」を出す。
          const isRt = tweet.retweetOfId != null;
          const original = isRt
            ? tweets.originalTweets[tweet.retweetOfId!]
            : null;
          const displayTweet = original?.tweet ?? tweet;
          const displayAuthor =
            original?.author ?? tweets.authorSummaries[tweet.authorId];
          const retweetedBy = isRt
            ? tweets.authorSummaries[tweet.authorId]
            : undefined;
          return (
            <li key={tweet.id}>
              <TweetItem
                tweet={displayTweet}
                author={displayAuthor}
                retweetedBy={retweetedBy}
                likeCount={tweets.likeState.counts[displayTweet.id] ?? 0}
                retweetCount={tweets.retweetState.counts[displayTweet.id] ?? 0}
                mineLike={tweets.likeState.mineIds.has(displayTweet.id)}
                mineRetweet={tweets.retweetState.mineIds.has(displayTweet.id)}
              />
            </li>
          );
        })}
      </ul>
      <InfiniteScrollSentinel
        onVisible={() => tweetsQuery.fetchNextPage()}
        disabled={!tweetsQuery.hasNextPage || tweetsQuery.isFetchingNextPage}
        label={
          tweetsQuery.isFetchingNextPage
            ? "Loading more…"
            : tweetsQuery.hasNextPage
              ? ""
              : ""
        }
      />
    </>
  );
}
