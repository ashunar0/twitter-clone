import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { ArrowLeft, Search } from "lucide-react";
import { useProfileByHandleQuery } from "@features/profiles/client/queries";
import { useSession } from "@features/users/client/auth-client";
import { useUserTweetsQuery } from "@features/tweets/client/queries";
import { useFollowCountsQuery } from "@features/follows/client/queries";
import { TweetItem } from "@/widgets/tweet-item/TweetItem";
import { FollowButton } from "@/widgets/follow-button/FollowButton";
import { InfiniteScrollSentinel } from "@/shared/InfiniteScrollSentinel";
import { Button } from "@/shared/ui/button";
import { IconButton } from "@/shared/ui/icon-button";
import { EditProfileForm } from "./EditProfileForm";

// プロフィール上部の sticky header。左に戻る矢印、右に name (bold) + N posts (subtle)。
// X 準拠で backdrop-blur + 半透明 bg を敷き、tweet list をスクロールしても見えるようにする。
function ProfileHeader({ name, postCount }: { name: string; postCount: number }) {
  const router = useRouter();
  return (
    <div className="sticky top-0 z-10 flex items-center gap-6 bg-bg/70 px-4 py-2 backdrop-blur-md">
      <IconButton
        type="button"
        variant="ghost"
        size="lg"
        aria-label="戻る"
        className="rounded-full"
        onClick={() => router.history.back()}
      >
        <ArrowLeft className="size-5" />
      </IconButton>
      <div className="flex min-w-0 flex-1 flex-col leading-tight">
        <span className="truncate text-lg font-bold text-fg">{name}</span>
        <span className="text-xs text-fg-muted">{postCount} posts</span>
      </div>
      {/* 右端の検索 icon。X 準拠、現状は見た目のみで動かない。 */}
      <IconButton
        type="button"
        variant="ghost"
        size="lg"
        aria-label="検索"
        className="rounded-full"
      >
        <Search className="size-5" />
      </IconButton>
    </div>
  );
}

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
      <ProfileHeader name={profile.name} postCount={tweets?.tweets.length ?? 0} />
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
