import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Tweet } from "../type";
import type { AuthorSummary, CreateTweetWire } from "../schema";
import type { Profile } from "@features/profiles/type";
import { tweetsRpc } from "./rpc";
import { tweetsKeys, type TweetsPagesCache } from "./queries";

type ToggleRetweetVars = { originalId: string; nextMine: boolean };
type ToggleRetweetContext = { snapshot: TweetsPagesCache | undefined };

// retweet を toggle する。like と同じ optimistic 更新 + 巻き戻しパターン。
// - onMutate: retweetState.counts / mineIds を対象 page で書き換える (delta ±1)
// - server 応答は body 無し、成功時は cache 保持、失敗時は snapshot に巻き戻し
// - retweet 追加時の "RT 行の tweets への挿入" は optimistic では省略 (server refetch で反映)
export function useToggleRetweetMutation() {
  const queryClient = useQueryClient();
  const listKey = tweetsKeys.list();

  return useMutation<void, Error, ToggleRetweetVars, ToggleRetweetContext>({
    mutationFn: ({ originalId, nextMine }) =>
      nextMine ? tweetsRpc.retweet(originalId) : tweetsRpc.unretweet(originalId),
    onMutate: async ({ originalId, nextMine }) => {
      await queryClient.cancelQueries({ queryKey: listKey });
      const snapshot = queryClient.getQueryData<TweetsPagesCache>(listKey);
      queryClient.setQueryData<TweetsPagesCache>(listKey, (prev) => {
        if (!prev) return prev;
        const pages = prev.pages.map((page) => {
          const has = page.retweetState.counts[originalId] !== undefined;
          if (!has) return page;
          const already = page.retweetState.mineIds.includes(originalId);
          const mineIds = nextMine
            ? already
              ? page.retweetState.mineIds
              : [...page.retweetState.mineIds, originalId]
            : page.retweetState.mineIds.filter((id) => id !== originalId);
          const delta = nextMine ? (already ? 0 : 1) : already ? -1 : 0;
          const current = page.retweetState.counts[originalId] ?? 0;
          return {
            ...page,
            retweetState: {
              counts: {
                ...page.retweetState.counts,
                [originalId]: Math.max(0, current + delta),
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
    onSuccess: () => {
      // RT 行自体 (tweets 配列への挿入 / 削除) は refetch でサーバ側と揃える。
      queryClient.invalidateQueries({ queryKey: listKey });
    },
  });
}

type MutationContext = { snapshot: TweetsPagesCache | undefined };

// 新規 tweet を作成、optimistic に pages[0] の先頭へ挿入する (InfiniteData 対応)。
// 成功時に server 応答 (real id / createdAt) で差し替え、失敗時は snapshot に巻き戻す。
// 引数の currentProfile は optimistic の author summary (handle/name/avatarUrl) を作るために使う。
export function useCreateTweetMutation(currentProfile: Profile) {
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
        authorId: currentProfile.userId,
        parentId: null,
        retweetOfId: null,
        body: input.body,
        createdAt: new Date().toISOString(),
      };
      const authorSummary: AuthorSummary = {
        handle: currentProfile.handle,
        name: currentProfile.name,
        avatarUrl: currentProfile.avatarUrl,
      };

      // pages[0] (最新 page) の先頭に optimistic tweet を挿入する。
      // cache が空 (初回 fetch 前) の場合は 1 page 分の空 shell を作って挿す。
      const emptyRetweet = { counts: {}, mineIds: [] as string[] };
      const emptyOriginalTweets = {};
      const emptyMediaSummaries = {};
      queryClient.setQueryData<TweetsPagesCache>(listKey, (prev) => {
        if (!prev) {
          return {
            pages: [
              {
                tweets: [optimistic],
                authorSummaries: { [currentProfile.userId]: authorSummary },
                likeState: { counts: { [optimistic.id]: 0 }, mineIds: [] },
                retweetState: emptyRetweet,
                originalTweets: emptyOriginalTweets,
                mediaSummaries: emptyMediaSummaries,
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
                [currentProfile.userId]: authorSummary,
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
              authorSummaries: { [currentProfile.userId]: authorSummary },
              likeState: {
                counts: { [optimistic.id]: 0 },
                mineIds: [] as string[],
              },
              retweetState: emptyRetweet,
              originalTweets: emptyOriginalTweets,
              mediaSummaries: emptyMediaSummaries,
              nextCursor: null,
            };
        return { ...prev, pages: [nextFirst, ...restPages] };
      });
      return { snapshot };
    },
    onError: (_e, _input, ctx) => {
      if (ctx?.snapshot) queryClient.setQueryData(listKey, ctx.snapshot);
    },
    onSuccess: (created, input) => {
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
      // media 付き tweet は mediaSummaries が cache に無いので、server と揃えるため refetch する。
      // (retweet mutation と同じで「行 shape 自体は変わらないが cross-domain enrichment が新規に必要」パターン)
      if (input.mediaIds.length > 0) {
        queryClient.invalidateQueries({ queryKey: listKey });
      }
    },
  });
}
