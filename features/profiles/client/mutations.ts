import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Profile } from "../type";
import type { UpdateProfileWire } from "../schema";
import { profilesRpc } from "./rpc";
import { profilesKeys } from "./queries";

// PUT /api/profiles/me を叩いて自分の profile (handle + name) を更新する。
// 成功時: me cache を差し替え、旧 handle と新 handle 両方の byHandle cache を invalidate。
export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();
  return useMutation<Profile, Error, UpdateProfileWire>({
    mutationFn: (input) => profilesRpc.updateMe(input),
    onSuccess: (updated) => {
      const prev = queryClient.getQueryData<Profile>(profilesKeys.me());
      queryClient.setQueryData<Profile>(profilesKeys.me(), updated);
      if (prev && prev.handle !== updated.handle) {
        queryClient.invalidateQueries({
          queryKey: profilesKeys.byHandle(prev.handle),
        });
      }
      queryClient.invalidateQueries({
        queryKey: profilesKeys.byHandle(updated.handle),
      });
    },
  });
}
