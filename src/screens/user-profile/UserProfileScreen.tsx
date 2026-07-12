import { useState } from "react";
import { useProfileByHandleQuery } from "@features/profiles/client/queries";
import { useSession } from "@features/users/client/auth-client";
import { useUserTweetsQuery } from "@features/tweets/client/queries";
import { useFollowCountsQuery } from "@features/follows/client/queries";
import { TweetItem } from "@/widgets/tweet-item/TweetItem";
import { FollowButton } from "@/widgets/follow-button/FollowButton";
import { InfiniteScrollSentinel } from "@/shared/InfiniteScrollSentinel";
import { Button } from "@/shared/ui/button";
import { EditProfileForm } from "./EditProfileForm";

// user profile 画面。loader で prefetch 済みの profile / tweets / follow 情報を cache から読む。
export function UserProfileScreen({ handle }: { handle: string }) {
  const profileQuery = useProfileByHandleQuery(handle);
  const session = useSession();
  const profile = profileQuery.data;
  // profile が確定するまで下位 query は enable しない (userId が要る)。
  const tweetsQuery = useUserTweetsQuery(profile?.userId ?? "");
  const countsQuery = useFollowCountsQuery(profile?.userId ?? "");
  const [editing, setEditing] = useState(false);

  if (profileQuery.isLoading) return <div className="p-6">Loading…</div>;
  if (profileQuery.error || !profile)
    return <div className="p-6 text-red-600">User not found</div>;

  const tweets = tweetsQuery.data;
  const counts = countsQuery.data;
  const isMe = session.data?.user.id === profile.userId;

  return (
    <main className="min-h-svh w-full border-x border-border">
      <div className="mb-6 rounded-lg border border-neutral-200 p-4">
        <div className="mb-2 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{profile.name}</h1>
            <div className="text-sm text-neutral-600">@{profile.handle}</div>
          </div>
          {isMe ? (
            !editing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditing(true)}
              >
                Edit
              </Button>
            )
          ) : (
            <FollowButton targetUserId={profile.userId} />
          )}
        </div>
        <div className="flex gap-4 text-sm text-neutral-700">
          <span>
            <strong className="text-neutral-900">
              {counts?.followers ?? 0}
            </strong>{" "}
            Followers
          </span>
          <span>
            <strong className="text-neutral-900">
              {counts?.following ?? 0}
            </strong>{" "}
            Following
          </span>
        </div>
        {isMe && editing ? (
          <EditProfileForm profile={profile} onDone={() => setEditing(false)} />
        ) : null}
      </div>
      <h2 className="mb-3 text-lg font-semibold">Tweets</h2>
      {tweetsQuery.isLoading || !tweets ? (
        <div>Loading tweets…</div>
      ) : (
        <>
          <ul className="flex flex-col gap-3">
            {tweets.tweets.map((tweet) => {
              // retweet 行なら元 tweet を表示、行 author (retweeter) は TweetItem の retweet header 再対応時に戻す。
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
                <TweetItem
                  key={tweet.id}
                  tweet={displayTweet}
                  author={displayAuthor}
                  retweetedBy={retweetedBy}
                  likeCount={tweets.likeState.counts[displayTweet.id] ?? 0}
                  retweetCount={tweets.retweetState.counts[displayTweet.id] ?? 0}
                  mineLike={tweets.likeState.mineIds.has(displayTweet.id)}
                  mineRetweet={tweets.retweetState.mineIds.has(displayTweet.id)}
                />
              );
            })}
            {tweets.tweets.length === 0 && (
              <li className="text-neutral-500">まだ tweet がないのだ。</li>
            )}
          </ul>
          <InfiniteScrollSentinel
            onVisible={() => tweetsQuery.fetchNextPage()}
            disabled={
              !tweetsQuery.hasNextPage || tweetsQuery.isFetchingNextPage
            }
            label={
              tweetsQuery.isFetchingNextPage
                ? "Loading more…"
                : tweetsQuery.hasNextPage
                  ? ""
                  : ""
            }
          />
        </>
      )}
    </main>
  );
}
