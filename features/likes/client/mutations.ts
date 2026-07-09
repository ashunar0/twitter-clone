import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { TweetsData } from "@features/tweets/type";
// 規約例外: cross-domain の cache 一貫性 (invalidation / setQueryData) 目的で
// 他 feature の queryKey factory を import することは許可 (fe-architecture 参照)。
import { tweetsKeys } from "@features/tweets/client/queries";
import { likesRpc } from "./rpc";

type ToggleVars = { tweetId: string; nextMine: boolean };
type ToggleContext = { snapshot: TweetsData | undefined };

// like を toggle する。次状態 (nextMine) を呼び出し側で決めて渡す形にする。
// - onMutate: tweets cache に反映 (mineIds Set と counts を optimistic に更新)
// - onError: snapshot に巻き戻し
// - onSuccess: server 応答は body なし、cache は onMutate の状態のまま採用
export function useToggleLikeMutation() {
  const queryClient = useQueryClient();
  const listKey = tweetsKeys.list();

  return useMutation<void, Error, ToggleVars, ToggleContext>({
    mutationFn: ({ tweetId, nextMine }) =>
      nextMine ? likesRpc.add({ tweetId }) : likesRpc.remove(tweetId),
    onMutate: async ({ tweetId, nextMine }) => {
      await queryClient.cancelQueries({ queryKey: listKey });
      const snapshot = queryClient.getQueryData<TweetsData>(listKey);
      queryClient.setQueryData<TweetsData>(listKey, (prev) => {
        if (!prev) return prev;
        const nextMineIds = new Set(prev.likeState.mineIds);
        const already = nextMineIds.has(tweetId);
        if (nextMine && !already) nextMineIds.add(tweetId);
        if (!nextMine && already) nextMineIds.delete(tweetId);
        const delta = nextMine ? 1 : -1;
        const currentCount = prev.likeState.counts[tweetId] ?? 0;
        return {
          ...prev,
          likeState: {
            counts: {
              ...prev.likeState.counts,
              [tweetId]: Math.max(0, currentCount + delta),
            },
            mineIds: nextMineIds,
          },
        };
      });
      return { snapshot };
    },
    onError: (_e, _vars, ctx) => {
      if (ctx?.snapshot) queryClient.setQueryData(listKey, ctx.snapshot);
    },
  });
}
