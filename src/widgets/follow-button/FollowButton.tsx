import { Button } from "@/shared/ui/button";
import { useCurrentUserQuery } from "@features/users/client/queries";
import { useFollowMineQuery } from "@features/follows/client/queries";
import { useToggleFollowMutation } from "@features/follows/client/mutations";

// 対象 user に対する Follow / Following ボタン。
// - self (current user == target) の場合は何も描画しない
// - mine / current user が resolve するまでは disabled 描画
export function FollowButton({ targetUserId }: { targetUserId: string }) {
  const currentUserQuery = useCurrentUserQuery();
  const mineQuery = useFollowMineQuery(targetUserId);
  const toggle = useToggleFollowMutation();

  if (currentUserQuery.data?.id === targetUserId) return null;

  const isFollowing = mineQuery.data?.isFollowing ?? false;
  const disabled = mineQuery.isLoading || toggle.isPending;

  return (
    <Button
      variant={isFollowing ? "outline" : "solid"}
      disabled={disabled}
      onClick={() =>
        toggle.mutate({ targetUserId, nextFollowing: !isFollowing })
      }
    >
      {isFollowing ? "Following" : "Follow"}
    </Button>
  );
}
