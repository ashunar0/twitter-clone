import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Tweet } from "../type";
import type { AuthorSummary, CreateTweetWire } from "../schema";
import type { User } from "@features/users/type";
import { tweetsRpc } from "./rpc";
import { tweetsKeys, type TweetsPagesCache } from "./queries";

type MutationContext = { snapshot: TweetsPagesCache | undefined };

// 新規 tweet を作成、optimistic に pages[0] の先頭へ挿入する (InfiniteData 対応)。
// 成功時に server 応答 (real id / createdAt) で差し替え、失敗時は snapshot に巻き戻す。
export function useCreateTweetMutation(currentUser: User) {
  const queryClient = useQueryClient();
  const listKey = tweetsKeys.list();

  return useMutation<Tweet, Error, CreateTweetWire, MutationContext>({
    mutationFn: (input) => tweetsRpc.create(input),
    onMutate: async (input) => {
      // reply は timeline に混ざらないので optimistic 更新をスキップ。thread view 実装時に別 key で対応する。
      if (input.parentId) return { snapshot: undefined };

      await queryClient.cancelQueries({ queryKey: listKey });
      const snapshot = queryClient.getQueryData<TweetsPagesCache>(listKey);

      const optimistic: Tweet = {
        id: `optimistic-${Date.now()}`,
        authorId: currentUser.id,
        parentId: null,
        body: input.body,
        createdAt: new Date().toISOString(),
      };
      const authorSummary: AuthorSummary = {
        handle: currentUser.handle,
        name: currentUser.name,
        avatarUrl: currentUser.avatarUrl,
      };

      // pages[0] (最新 page) の先頭に optimistic tweet を挿入する。
      // cache が空 (初回 fetch 前) の場合は 1 page 分の空 shell を作って挿す。
      queryClient.setQueryData<TweetsPagesCache>(listKey, (prev) => {
        if (!prev) {
          return {
            pages: [
              {
                tweets: [optimistic],
                authorSummaries: { [currentUser.id]: authorSummary },
                likeState: { counts: { [optimistic.id]: 0 }, mineIds: [] },
                nextCursor: null,
              },
            ],
            pageParams: [null],
          };
        }
        const [firstPage, ...restPages] = prev.pages;
        const nextFirst = firstPage
          ? {
              ...firstPage,
              tweets: [optimistic, ...firstPage.tweets],
              authorSummaries: {
                ...firstPage.authorSummaries,
                [currentUser.id]: authorSummary,
              },
              likeState: {
                counts: {
                  ...firstPage.likeState.counts,
                  [optimistic.id]: 0,
                },
                mineIds: firstPage.likeState.mineIds,
              },
            }
          : {
              tweets: [optimistic],
              authorSummaries: { [currentUser.id]: authorSummary },
              likeState: {
                counts: { [optimistic.id]: 0 },
                mineIds: [] as string[],
              },
              nextCursor: null,
            };
        return { ...prev, pages: [nextFirst, ...restPages] };
      });
      return { snapshot };
    },
    onError: (_e, _input, ctx) => {
      if (ctx?.snapshot) queryClient.setQueryData(listKey, ctx.snapshot);
    },
    onSuccess: (created) => {
      // reply は timeline を触っていない (optimistic 挿入なし)、差し替え不要。
      if (created.parentId) return;
      queryClient.setQueryData<TweetsPagesCache>(listKey, (prev) => {
        if (!prev) return prev;
        const [firstPage, ...restPages] = prev.pages;
        if (!firstPage) return prev;
        // pages[0] 先頭の optimistic を server 応答で差し替える。
        const [first, ...rest] = firstPage.tweets;
        if (first?.id.startsWith("optimistic-")) {
          return {
            ...prev,
            pages: [
              { ...firstPage, tweets: [created, ...rest] },
              ...restPages,
            ],
          };
        }
        // 想定外だが安全側: そのまま (次 refetch で整合)。
        return prev;
      });
    },
  });
}
