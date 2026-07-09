import { useQuery } from "@tanstack/react-query";
import type { TweetsData } from "../type";
import { tweetsRpc } from "./rpc";

// queryKey factory — mutation 側の invalidation で参照するため export 必須。
// 直書き ["tweets", ...] を禁止するのが規約 (typo 検知失敗を防ぐ)。
export const tweetsKeys = {
  all: ["tweets"] as const,
  lists: () => [...tweetsKeys.all, "list"] as const,
  list: () => [...tweetsKeys.lists()] as const,
} as const;

// public timeline (直近 tweets + author summary) を取得。
export function useTweetsQuery() {
  return useQuery<TweetsData>({
    queryKey: tweetsKeys.list(),
    queryFn: () => tweetsRpc.list(),
  });
}
