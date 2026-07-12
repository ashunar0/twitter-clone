import { User } from "lucide-react";
import { Avatar } from "@/shared/ui/avatar";

// 横長のバナー画像 + 左下にかぶる大きめ avatar。schema にバナー画像がないので常に fg/10 の gray fallback。
// avatar は banner の下辺に半分ずつまたがるよう、banner 内で bottom を -64px (avatar 半径) にオフセット。
// banner の下にはみ出す 64px 分は、後続の ProfileActionRow (py-3 + size-lg = 64px) がちょうど埋める。
export function ProfileBanner({
  avatar,
  name,
}: {
  avatar: string | null;
  name: string;
}) {
  return (
    <div className="relative h-48 w-full bg-fg/10">
      <div className="absolute -bottom-16 left-4">
        <Avatar.Root className="size-32 rounded-full ring-4 ring-bg">
          {avatar ? <Avatar.Image src={avatar} alt={name} /> : null}
          <Avatar.Fallback className="bg-fg/10">
            <User className="size-14 text-fg-subtle" aria-hidden />
          </Avatar.Fallback>
        </Avatar.Root>
      </div>
    </div>
  );
}
