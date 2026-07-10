import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { User } from "../type";
import type { UpdateProfileWire } from "../schema";
import { usersRpc } from "./rpc";
import { usersKeys } from "./queries";

// PUT /api/users/me を叩いて自分の profile (name / handle) を更新する。
// 成功時: me cache を差し替え、旧 handle と新 handle 両方の byHandle cache を invalidate。
// - handle が変わると /u/:handle のパスが変わるので、UI 側で redirect する
// - error は ApiError のまま throw、component 側で fields / code を見て form に反映
export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation<User, Error, UpdateProfileWire>({
    mutationFn: (input) => usersRpc.updateMe(input),
    onSuccess: (updated) => {
      const prev = queryClient.getQueryData<User>(usersKeys.me());
      queryClient.setQueryData<User>(usersKeys.me(), updated);
      // 旧 handle / 新 handle 両方の byHandle cache を古い扱いにする。
      if (prev && prev.handle !== updated.handle) {
        queryClient.invalidateQueries({
          queryKey: usersKeys.byHandle(prev.handle),
        });
      }
      queryClient.invalidateQueries({
        queryKey: usersKeys.byHandle(updated.handle),
      });
    },
  });
}
