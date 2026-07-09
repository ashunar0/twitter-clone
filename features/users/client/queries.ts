import { queryOptions, useQuery } from "@tanstack/react-query";
import type { User } from "../type";
import { usersRpc } from "./rpc";

// queryKey factory — cross-domain invalidation / router loader からも参照する。
export const usersKeys = {
  all: ["users"] as const,
  me: () => [...usersKeys.all, "me"] as const,
  byHandle: (handle: string) =>
    [...usersKeys.all, "by-handle", handle] as const,
} as const;

// queryOptions: loader の queryClient.ensureQueryData と useQuery で共有する定義。
export function userByHandleOptions(handle: string) {
  return queryOptions<User>({
    queryKey: usersKeys.byHandle(handle),
    queryFn: () => usersRpc.byHandle(handle),
  });
}

// current user を取得。tweet 作成時の optimistic で author 情報として使う。
export function useCurrentUserQuery() {
  return useQuery<User>({
    queryKey: usersKeys.me(),
    queryFn: () => usersRpc.me(),
  });
}

// handle で 1 件取得。profile 画面で使う。
export function useUserByHandleQuery(handle: string) {
  return useQuery(userByHandleOptions(handle));
}
