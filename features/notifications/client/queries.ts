import { queryOptions, useQuery } from "@tanstack/react-query";
import type { NotificationsData } from "../type";
import { notificationsRpc } from "./rpc";

// queryKey factory。将来 kind 別 filter を足すなら `by-kind(kind)` を追加。
export const notificationsKeys = {
  all: ["notifications"] as const,
  list: () => [...notificationsKeys.all, "list"] as const,
} as const;

export function notificationsListOptions() {
  return queryOptions<NotificationsData>({
    queryKey: notificationsKeys.list(),
    queryFn: () => notificationsRpc.list(),
  });
}

// current user 宛の通知一覧を取得。
export function useNotificationsQuery() {
  return useQuery(notificationsListOptions());
}
