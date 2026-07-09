import type { QueryClient } from "@tanstack/react-query";
import { userByHandleOptions } from "@features/users/client/queries";
import { userTweetsOptions } from "@features/tweets/client/queries";

// /u/:handle 遷移時に user と tweets を prefetch する route loader。
// 直後の useUserByHandleQuery / useUserTweetsQuery は cache から即読み。
export async function loadUserProfile(queryClient: QueryClient, handle: string) {
  const user = await queryClient.ensureQueryData(userByHandleOptions(handle));
  await queryClient.ensureQueryData(userTweetsOptions(user.id));
  return { user };
}

export type UserProfileLoaderData = Awaited<ReturnType<typeof loadUserProfile>>;
