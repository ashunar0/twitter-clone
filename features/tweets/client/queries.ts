import { useQuery } from "@tanstack/react-query";
import type { TweetsData } from "../type";
import type { TweetsListResponseWire } from "../schema";
import { tweetsRpc } from "./rpc";

// queryKey factory — mutation 側の invalidation / setQueryData で参照する為 export 必須。
// 直書き ["tweets", ...] を禁止するのが規約 (typo 検知失敗を防ぐ)。
export const tweetsKeys = {
  all: ["tweets"] as const,
  lists: () => [...tweetsKeys.all, "list"] as const,
  list: () => [...tweetsKeys.lists()] as const,
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

// public timeline を取得。fetch 時に wire→cache 変換を挟む。
export function useTweetsQuery() {
  return useQuery<TweetsData>({
    queryKey: tweetsKeys.list(),
    queryFn: async () => snapshotToCache(await tweetsRpc.list()),
  });
}
