import { useMutation, useQueryClient } from "@tanstack/react-query";
// 規約例外: cross-domain の cache 一貫性 (invalidation / setQueryData) 目的で
// 他 feature の queryKey factory / cache 型を import することは許可 (fe-architecture 参照)。
import {
  tweetsKeys,
  type TweetsPagesCache,
} from "@features/tweets/client/queries";
import { likesRpc } from "./rpc";

type ToggleVars = { tweetId: string; nextMine: boolean };
type ToggleContext = { snapshot: TweetsPagesCache | undefined };

// like を toggle する。次状態 (nextMine) を呼び出し側で決めて渡す形にする。
// - onMutate: tweets InfiniteData の該当 page に mineIds / counts を反映
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
      const snapshot = queryClient.getQueryData<TweetsPagesCache>(listKey);
      queryClient.setQueryData<TweetsPagesCache>(listKey, (prev) => {
        if (!prev) return prev;
        // 対象 tweet を含む page のみ書き換える (他 page は同一参照を維持し select の cost を下げる)。
        const pages = prev.pages.map((page) => {
          const inPage = page.tweets.some((t) => t.id === tweetId);
          if (!inPage) return page;
          const already = page.likeState.mineIds.includes(tweetId);
          const mineIds = nextMine
            ? already
              ? page.likeState.mineIds
              : [...page.likeState.mineIds, tweetId]
            : page.likeState.mineIds.filter((id) => id !== tweetId);
          const delta = nextMine ? 1 : -1;
          const current = page.likeState.counts[tweetId] ?? 0;
          return {
            ...page,
            likeState: {
              counts: {
                ...page.likeState.counts,
                [tweetId]: Math.max(0, current + delta),
              },
              mineIds,
            },
          };
        });
        return { ...prev, pages };
      });
      return { snapshot };
    },
    onError: (_e, _vars, ctx) => {
      if (ctx?.snapshot) queryClient.setQueryData(listKey, ctx.snapshot);
    },
  });
}
