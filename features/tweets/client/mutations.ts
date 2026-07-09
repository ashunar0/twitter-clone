import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Tweet, TweetsData } from "../type";
import type { AuthorSummary, CreateTweetWire } from "../schema";
import type { User } from "@features/users/type";
import { tweetsRpc } from "./rpc";
import { tweetsKeys } from "./queries";

type MutationContext = { snapshot: TweetsData | undefined };

// 新規 tweet を作成、optimistic に cache 先頭へ挿入する。
// 成功時に server 応答 (real id / createdAt) で差し替え、失敗時は snapshot に巻き戻す。
export function useCreateTweetMutation(currentUser: User) {
  const queryClient = useQueryClient();
  const listKey = tweetsKeys.list();

  return useMutation<Tweet, Error, CreateTweetWire, MutationContext>({
    mutationFn: (input) => tweetsRpc.create(input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: listKey });
      const snapshot = queryClient.getQueryData<TweetsData>(listKey);

      const optimistic: Tweet = {
        id: `optimistic-${Date.now()}`,
        authorId: currentUser.id,
        body: input.body,
        createdAt: new Date().toISOString(),
      };
      const authorSummary: AuthorSummary = {
        handle: currentUser.handle,
        name: currentUser.name,
        avatarUrl: currentUser.avatarUrl,
      };

      queryClient.setQueryData<TweetsData>(listKey, (prev) => {
        const base: TweetsData = prev ?? {
          tweets: [],
          authorSummaries: {},
          likeState: { counts: {}, mineIds: [] },
        };
        return {
          ...base,
          tweets: [optimistic, ...base.tweets],
          authorSummaries: {
            ...base.authorSummaries,
            [currentUser.id]: authorSummary,
          },
          likeState: {
            counts: { ...base.likeState.counts, [optimistic.id]: 0 },
            mineIds: base.likeState.mineIds,
          },
        };
      });
      return { snapshot };
    },
    onError: (_e, _input, ctx) => {
      if (ctx?.snapshot) queryClient.setQueryData(listKey, ctx.snapshot);
    },
    onSuccess: (created) => {
      queryClient.setQueryData<TweetsData>(listKey, (prev) => {
        if (!prev) return prev;
        // 先頭 (直前の optimistic) を server 応答で差し替える。
        const [first, ...rest] = prev.tweets;
        if (first?.id.startsWith("optimistic-")) {
          return { ...prev, tweets: [created, ...rest] };
        }
        // 想定外だが安全側: 全 refetch へフォールバック。
        return prev;
      });
      // author summary は onMutate で既に載せているので追加操作なし。
    },
  });
}
