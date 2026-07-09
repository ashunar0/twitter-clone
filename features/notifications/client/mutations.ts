import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { NotificationsData } from "../type";
import { notificationsRpc } from "./rpc";
import { notificationsKeys } from "./queries";

type MutationContext = { snapshot: NotificationsData | undefined };

// 全通知を既読化する。optimistic に全 isRead を true、unreadCount を 0 に。
export function useMarkAllReadMutation() {
  const queryClient = useQueryClient();
  const listKey = notificationsKeys.list();

  return useMutation<void, Error, void, MutationContext>({
    mutationFn: () => notificationsRpc.markAllRead(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: listKey });
      const snapshot = queryClient.getQueryData<NotificationsData>(listKey);
      queryClient.setQueryData<NotificationsData>(listKey, (prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          notifications: prev.notifications.map((n) => ({ ...n, isRead: true })),
          unreadCount: 0,
        };
      });
      return { snapshot };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.snapshot) queryClient.setQueryData(listKey, ctx.snapshot);
    },
  });
}
