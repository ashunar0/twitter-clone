import { useQuery } from "@tanstack/react-query";
import type { User } from "../type";
import { usersRpc } from "./rpc";

// queryKey factory — cross-domain invalidation でも参照する。
export const usersKeys = {
  all: ["users"] as const,
  me: () => [...usersKeys.all, "me"] as const,
} as const;

// current user を取得。tweet 作成時の optimistic で author 情報として使う。
export function useCurrentUserQuery() {
  return useQuery<User>({
    queryKey: usersKeys.me(),
    queryFn: () => usersRpc.me(),
  });
}
