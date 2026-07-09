import { useUserByHandleQuery } from "@features/users/client/queries";
import { useUserTweetsQuery } from "@features/tweets/client/queries";
import { TweetItem } from "@/widgets/tweet-item/ui/TweetItem";

// user profile 画面。loader で prefetch 済みの user + tweets を cache から読む。
export function UserProfileScreen({ handle }: { handle: string }) {
  const userQuery = useUserByHandleQuery(handle);
  const user = userQuery.data;
  // user が確定するまで tweets query は enable しない (authorId が要る)。
  const tweetsQuery = useUserTweetsQuery(user?.id ?? "");

  if (userQuery.isLoading) return <div className="p-6">Loading…</div>;
  if (userQuery.error || !user)
    return <div className="p-6 text-red-600">User not found</div>;

  const tweets = tweetsQuery.data;

  return (
    <main className="mx-auto max-w-xl p-6">
      <div className="mb-6 rounded-lg border border-neutral-200 p-4">
        <h1 className="text-2xl font-bold">{user.name}</h1>
        <div className="text-sm text-neutral-600">@{user.handle}</div>
      </div>
      <h2 className="mb-3 text-lg font-semibold">Tweets</h2>
      {tweetsQuery.isLoading || !tweets ? (
        <div>Loading tweets…</div>
      ) : (
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
      )}
    </main>
  );
}
