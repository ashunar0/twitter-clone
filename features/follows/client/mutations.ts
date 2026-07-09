import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { FollowCounts, FollowMine } from "../schema";
import { followsRpc } from "./rpc";
import { followsKeys } from "./queries";

type ToggleVars = { targetUserId: string; nextFollowing: boolean };
type ToggleContext = {
  minePrev: FollowMine | undefined;
  countsPrev: FollowCounts | undefined;
};

// follow を toggle する。呼び出し側で次状態 (nextFollowing) を渡す形。
// - onMutate: mine と counts (対象 user の followers) を optimistic に更新
// - onError: 両方巻き戻し
// - onSuccess: 何もしない (counts は誤差を許容、必要なら invalidate に差し替え)
export function useToggleFollowMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, ToggleVars, ToggleContext>({
    mutationFn: ({ targetUserId, nextFollowing }) =>
      nextFollowing
        ? followsRpc.add({ followeeId: targetUserId })
        : followsRpc.remove(targetUserId),
    onMutate: async ({ targetUserId, nextFollowing }) => {
      const mineKey = followsKeys.mine(targetUserId);
      const countsKey = followsKeys.counts(targetUserId);
      await Promise.all([
        queryClient.cancelQueries({ queryKey: mineKey }),
        queryClient.cancelQueries({ queryKey: countsKey }),
      ]);
      const minePrev = queryClient.getQueryData<FollowMine>(mineKey);
      const countsPrev = queryClient.getQueryData<FollowCounts>(countsKey);
      queryClient.setQueryData<FollowMine>(mineKey, { isFollowing: nextFollowing });
      queryClient.setQueryData<FollowCounts>(countsKey, (prev) => {
        if (!prev) return prev;
        const delta = nextFollowing ? 1 : -1;
        return { ...prev, followers: Math.max(0, prev.followers + delta) };
      });
      return { minePrev, countsPrev };
    },
    onError: (_e, { targetUserId }, ctx) => {
      if (ctx?.minePrev !== undefined)
        queryClient.setQueryData(followsKeys.mine(targetUserId), ctx.minePrev);
      if (ctx?.countsPrev !== undefined)
        queryClient.setQueryData(followsKeys.counts(targetUserId), ctx.countsPrev);
    },
  });
}
