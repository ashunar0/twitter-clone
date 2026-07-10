import { useState } from "react";
import {
  useCurrentUserQuery,
  useUserByHandleQuery,
} from "@features/users/client/queries";
import { useUserTweetsQuery } from "@features/tweets/client/queries";
import { useFollowCountsQuery } from "@features/follows/client/queries";
import { TweetItem } from "@/widgets/tweet-item/TweetItem";
import { FollowButton } from "@/widgets/follow-button/FollowButton";
import { InfiniteScrollSentinel } from "@/shared/InfiniteScrollSentinel";
import { Button } from "@/shared/ui/button";
import { EditProfileForm } from "./EditProfileForm";

// user profile 画面。loader で prefetch 済みの user / tweets / follow 情報を cache から読む。
export function UserProfileScreen({ handle }: { handle: string }) {
  const userQuery = useUserByHandleQuery(handle);
  const currentUserQuery = useCurrentUserQuery();
  const user = userQuery.data;
  const currentUser = currentUserQuery.data;
  // user が確定するまで下位 query は enable しない (id が要る)。
  const tweetsQuery = useUserTweetsQuery(user?.id ?? "");
  const countsQuery = useFollowCountsQuery(user?.id ?? "");
  const [editing, setEditing] = useState(false);

  if (userQuery.isLoading) return <div className="p-6">Loading…</div>;
  if (userQuery.error || !user)
    return <div className="p-6 text-red-600">User not found</div>;

  const tweets = tweetsQuery.data;
  const counts = countsQuery.data;
  const isMe = currentUser?.id === user.id;

  return (
    <main className="mx-auto max-w-xl p-6">
      <div className="mb-6 rounded-lg border border-neutral-200 p-4">
        <div className="mb-2 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <div className="text-sm text-neutral-600">@{user.handle}</div>
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
            <FollowButton targetUserId={user.id} />
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
          <EditProfileForm user={user} onDone={() => setEditing(false)} />
        ) : null}
      </div>
      <h2 className="mb-3 text-lg font-semibold">Tweets</h2>
      {tweetsQuery.isLoading || !tweets ? (
        <div>Loading tweets…</div>
      ) : (
        <>
          <ul className="flex flex-col gap-3">
            {tweets.tweets.map((tweet) => (
              <TweetItem
                key={tweet.id}
                tweet={tweet}
                author={tweets.authorSummaries[tweet.authorId]}
                likeCount={tweets.likeState.counts[tweet.id] ?? 0}
                mine={tweets.likeState.mineIds.has(tweet.id)}
              />
            ))}
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
