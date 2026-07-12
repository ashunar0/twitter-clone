import { Button } from "@/shared/ui/button";
import { useSession } from "@features/users/client/auth-client";
import { useFollowMineQuery } from "@features/follows/client/queries";
import { useToggleFollowMutation } from "@features/follows/client/mutations";

// 対象 user に対する Follow / Following ボタン。
// - self (current user == target) の場合は何も描画しない
// - session が resolve するまでは何も描画しない (先に signup/signin を促す UI は上位)
export function FollowButton({ targetUserId }: { targetUserId: string }) {
  const session = useSession();
  const mineQuery = useFollowMineQuery(targetUserId);
  const toggle = useToggleFollowMutation();

  const currentUserId = session.data?.user.id;
  if (!currentUserId || currentUserId === targetUserId) return null;

  const isFollowing = mineQuery.data?.isFollowing ?? false;
  const disabled = mineQuery.isLoading || toggle.isPending;

  return (
    <Button
      variant={isFollowing ? "outline" : "solid"}
      disabled={disabled}
      className={
        isFollowing
          ? "rounded-full font-bold"
          : "rounded-full bg-brand-blue font-bold text-white hover:bg-brand-blue-dark"
      }
      onClick={() =>
        toggle.mutate({ targetUserId, nextFollowing: !isFollowing })
      }
    >
      {isFollowing ? "フォロー中" : "フォローする"}
    </Button>
  );
}
