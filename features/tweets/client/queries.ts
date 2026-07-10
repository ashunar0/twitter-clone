import {
  infiniteQueryOptions,
  useInfiniteQuery,
  type InfiniteData,
} from "@tanstack/react-query";
import type { AuthorSummary, TweetsListResponseWire } from "../schema";
import type { Tweet, TweetsData } from "../type";
import { tweetsRpc } from "./rpc";

// queryKey factory — mutation 側の invalidation / setQueryData / router loader から参照する。
// 直書き ["tweets", ...] を禁止するのが規約 (typo 検知失敗を防ぐ)。
// cursor 値は queryKey に含めない — useInfiniteQuery が pageParam として管理する。
export const tweetsKeys = {
  all: ["tweets"] as const,
  lists: () => [...tweetsKeys.all, "list"] as const,
  list: () => [...tweetsKeys.lists()] as const,
  byAuthor: (authorId: string) =>
    [...tweetsKeys.lists(), "by-author", authorId] as const,
} as const;

// cache 型: 各 page は wire そのまま (mineIds は array のまま置く)。
// UI に渡す時に selectFlattened で全 page を結合し、mineIds を Set 化する。
export type TweetsPagesCache = InfiniteData<TweetsListResponseWire, string | null>;

// pages を flatten して 1 個の TweetsData に集約する (select で毎回走る、page 数は少数想定)。
function selectFlattened(data: TweetsPagesCache): TweetsData {
  const tweets: Tweet[] = [];
  const authorSummaries: Record<string, AuthorSummary> = {};
  const likeCounts: Record<string, number> = {};
  const likeMineIds = new Set<string>();
  const retweetCounts: Record<string, number> = {};
  const retweetMineIds = new Set<string>();
  const originalTweets: TweetsData["originalTweets"] = {};
  for (const page of data.pages) {
    tweets.push(...page.tweets);
    Object.assign(authorSummaries, page.authorSummaries);
    Object.assign(likeCounts, page.likeState.counts);
    for (const id of page.likeState.mineIds) likeMineIds.add(id);
    Object.assign(retweetCounts, page.retweetState.counts);
    for (const id of page.retweetState.mineIds) retweetMineIds.add(id);
    Object.assign(originalTweets, page.originalTweets);
  }
  return {
    tweets,
    authorSummaries,
    likeState: { counts: likeCounts, mineIds: likeMineIds },
    retweetState: { counts: retweetCounts, mineIds: retweetMineIds },
    originalTweets,
  };
}

// infiniteQueryOptions: loader の ensureInfiniteQueryData / useInfiniteQuery で共有。
export function tweetsListOptions() {
  return infiniteQueryOptions<
    TweetsListResponseWire,
    Error,
    TweetsPagesCache,
    ReturnType<typeof tweetsKeys.list>,
    string | null
  >({
    queryKey: tweetsKeys.list(),
    queryFn: ({ pageParam }) =>
      tweetsRpc.list({ cursor: pageParam ?? undefined }),
    initialPageParam: null,
    getNextPageParam: (last) => last.nextCursor,
  });
}

export function userTweetsOptions(authorId: string) {
  return infiniteQueryOptions<
    TweetsListResponseWire,
    Error,
    TweetsPagesCache,
    ReturnType<typeof tweetsKeys.byAuthor>,
    string | null
  >({
    queryKey: tweetsKeys.byAuthor(authorId),
    queryFn: ({ pageParam }) =>
      tweetsRpc.list({ authorId, cursor: pageParam ?? undefined }),
    initialPageParam: null,
    getNextPageParam: (last) => last.nextCursor,
  });
}

// public timeline を取得 (infinite)。data は全 page 結合済みの TweetsData。
export function useTweetsQuery() {
  return useInfiniteQuery({ ...tweetsListOptions(), select: selectFlattened });
}

// 特定 author の tweets を取得 (profile 画面用、infinite)。
export function useUserTweetsQuery(authorId: string) {
  return useInfiniteQuery({
    ...userTweetsOptions(authorId),
    select: selectFlattened,
  });
}
