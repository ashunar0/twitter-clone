import type { QueryClient } from "@tanstack/react-query";
import { profileByHandleOptions } from "@features/profiles/client/queries";
import { userTweetsOptions } from "@features/tweets/client/queries";
import {
  followCountsOptions,
  followMineOptions,
} from "@features/follows/client/queries";

// /u/:handle 遷移時に profile / tweets / follow-counts / follow-mine を並列 prefetch する。
// 直後の hook 群は cache から即読み。
export async function loadUserProfile(queryClient: QueryClient, handle: string) {
  const profile = await queryClient.ensureQueryData(profileByHandleOptions(handle));
  await Promise.all([
    // tweets は infinite query。初期 page 1 枚だけ prefetch する。
    queryClient.ensureInfiniteQueryData(userTweetsOptions(profile.userId)),
    queryClient.ensureQueryData(followCountsOptions(profile.userId)),
    queryClient.ensureQueryData(followMineOptions(profile.userId)),
  ]);
  return { profile };
}

export type UserProfileLoaderData = Awaited<ReturnType<typeof loadUserProfile>>;
