import { queryOptions, useQuery } from "@tanstack/react-query";
import type { TweetsData } from "../type";
import type { TweetsListResponseWire } from "../schema";
import { tweetsRpc } from "./rpc";

// queryKey factory — mutation 側の invalidation / setQueryData / router loader から参照する。
// 直書き ["tweets", ...] を禁止するのが規約 (typo 検知失敗を防ぐ)。
export const tweetsKeys = {
  all: ["tweets"] as const,
  lists: () => [...tweetsKeys.all, "list"] as const,
  list: () => [...tweetsKeys.lists()] as const,
  byAuthor: (authorId: string) =>
    [...tweetsKeys.lists(), "by-author", authorId] as const,
} as const;

// wire → cache 変換: likeState.mineIds を Set 化する (それ以外は pass-through)。
export function snapshotToCache(res: TweetsListResponseWire): TweetsData {
  return {
    tweets: res.tweets,
    authorSummaries: res.authorSummaries,
    likeState: {
      counts: res.likeState.counts,
      mineIds: new Set(res.likeState.mineIds),
    },
  };
}

// queryOptions: loader の queryClient.ensureQueryData と useQuery で共有する定義。
export function tweetsListOptions() {
  return queryOptions<TweetsData>({
    queryKey: tweetsKeys.list(),
    queryFn: async () => snapshotToCache(await tweetsRpc.list()),
  });
}

export function userTweetsOptions(authorId: string) {
  return queryOptions<TweetsData>({
    queryKey: tweetsKeys.byAuthor(authorId),
    queryFn: async () => snapshotToCache(await tweetsRpc.list({ authorId })),
  });
}

// public timeline を取得。
export function useTweetsQuery() {
  return useQuery(tweetsListOptions());
}

// 特定 author の tweets を取得 (profile 画面用)。
export function useUserTweetsQuery(authorId: string) {
  return useQuery(userTweetsOptions(authorId));
}
