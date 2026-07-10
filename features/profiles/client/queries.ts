import { queryOptions, useQuery } from "@tanstack/react-query";
import type { Profile } from "../type";
import { profilesRpc } from "./rpc";

// queryKey factory — cross-domain invalidation / router loader からも参照する。
export const profilesKeys = {
  all: ["profiles"] as const,
  me: () => [...profilesKeys.all, "me"] as const,
  byHandle: (handle: string) =>
    [...profilesKeys.all, "by-handle", handle] as const,
} as const;

// queryOptions: loader の queryClient.ensureQueryData と useQuery で共有する。
export function profileByHandleOptions(handle: string) {
  return queryOptions<Profile>({
    queryKey: profilesKeys.byHandle(handle),
    queryFn: () => profilesRpc.byHandle(handle),
  });
}

// current user の profile を取得。
export function useCurrentProfileQuery() {
  return useQuery<Profile>({
    queryKey: profilesKeys.me(),
    queryFn: () => profilesRpc.me(),
  });
}

// handle で 1 件取得。
export function useProfileByHandleQuery(handle: string) {
  return useQuery(profileByHandleOptions(handle));
}
