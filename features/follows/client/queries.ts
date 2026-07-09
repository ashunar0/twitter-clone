import { queryOptions, useQuery } from "@tanstack/react-query";
import type { FollowCounts, FollowMine } from "../schema";
import { followsRpc } from "./rpc";

// queryKey factory。counts と mine は独立 kind、userId を末尾に取る。
export const followsKeys = {
  all: ["follows"] as const,
  counts: (userId: string) => [...followsKeys.all, "counts", userId] as const,
  mine: (userId: string) => [...followsKeys.all, "mine", userId] as const,
} as const;

export function followCountsOptions(userId: string) {
  return queryOptions<FollowCounts>({
    queryKey: followsKeys.counts(userId),
    queryFn: () => followsRpc.counts(userId),
  });
}

export function followMineOptions(userId: string) {
  return queryOptions<FollowMine>({
    queryKey: followsKeys.mine(userId),
    queryFn: () => followsRpc.mineOf(userId),
  });
}

// 対象 user の followers / following 数を取得。
export function useFollowCountsQuery(userId: string) {
  return useQuery(followCountsOptions(userId));
}

// current user が対象 user を follow しているか取得。
export function useFollowMineQuery(userId: string) {
  return useQuery(followMineOptions(userId));
}
