import { Mail, MoreHorizontal } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { IconButton } from "@/shared/ui/icon-button";
import { FollowButton } from "@/widgets/follow-button/FollowButton";

// バナー直下 (avatar と同じ横 strip) の右寄せアクション行。
// - 自分: 「プロフィールを編集」ボタンのみ
// - 他人: 左から menu (…) / DM (メール icon) / Follow ボタン
// DM と menu は現状表示のみで動かない。
export function ProfileActionRow({
  isMe,
  isEditing,
  userId,
  onEdit,
}: {
  isMe: boolean;
  isEditing: boolean;
  userId: string;
  onEdit: () => void;
}) {
  return (
    <div className="flex justify-end gap-2 px-4 py-3">
      {isMe ? (
        !isEditing && (
          <Button
            variant="outline"
            className="rounded-full font-bold"
            onClick={onEdit}
          >
            プロフィールを編集
          </Button>
        )
      ) : (
        <>
          <IconButton
            type="button"
            variant="outline"
            size="lg"
            aria-label="メニュー"
            className="rounded-full"
          >
            <MoreHorizontal className="size-5" />
          </IconButton>
          <IconButton
            type="button"
            variant="outline"
            size="lg"
            aria-label="メッセージ"
            className="rounded-full"
          >
            <Mail className="size-5" />
          </IconButton>
          <FollowButton targetUserId={userId} />
        </>
      )}
    </div>
  );
}
