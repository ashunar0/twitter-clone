import { useTweetsQuery } from "@features/tweets/client/queries";
import type { Tweet } from "@features/tweets/type";
import type { AuthorSummary } from "@features/tweets/schema";

// public timeline 画面。read model (tweets + authorSummaries) を表示する。
export function TimelineScreen() {
  const { data, isLoading, error } = useTweetsQuery();

  if (isLoading) return <div className="p-6">Loading…</div>;
  if (error) return <div className="p-6 text-red-600">Failed to load</div>;
  if (!data) return null;

  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="mb-4 text-2xl font-bold">Timeline</h1>
      <ul className="flex flex-col gap-3">
        {data.tweets.map((tweet) => (
          <TweetItem
            key={tweet.id}
            tweet={tweet}
            author={data.authorSummaries[tweet.authorId]}
          />
        ))}
      </ul>
    </main>
  );
}

// 1 tweet + author を並べる minimal item。UI polish は後の slice で。
function TweetItem({
  tweet,
  author,
}: {
  tweet: Tweet;
  author: AuthorSummary | undefined;
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
      <div className="mt-2 text-xs text-neutral-400">{tweet.createdAt}</div>
    </li>
  );
}
