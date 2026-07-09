import type { QueryClient } from "@tanstack/react-query";
import { userByHandleOptions } from "@features/users/client/queries";
import { userTweetsOptions } from "@features/tweets/client/queries";
import {
  followCountsOptions,
  followMineOptions,
} from "@features/follows/client/queries";

// /u/:handle 遷移時に user / tweets / follow-counts / follow-mine を並列 prefetch する。
// 直後の hook 群は cache から即読み。
export async function loadUserProfile(queryClient: QueryClient, handle: string) {
  const user = await queryClient.ensureQueryData(userByHandleOptions(handle));
  await Promise.all([
    queryClient.ensureQueryData(userTweetsOptions(user.id)),
    queryClient.ensureQueryData(followCountsOptions(user.id)),
    queryClient.ensureQueryData(followMineOptions(user.id)),
  ]);
  return { user };
}

export type UserProfileLoaderData = Awaited<ReturnType<typeof loadUserProfile>>;
