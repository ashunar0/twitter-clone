import { useRouter } from "@tanstack/react-router";
import { ArrowLeft, Search } from "lucide-react";
import { IconButton } from "@/shared/ui/icon-button";

// プロフィール上部の sticky header。左に戻る矢印、中央に name (bold) + @handle (subtle)、右に検索。
// X 準拠で backdrop-blur + 半透明 bg を敷き、tweet list をスクロールしても見えるようにする。
export function ProfileHeader({
  name,
  handle,
}: {
  name: string;
  handle: string;
}) {
  const router = useRouter();
  return (
    <div className="sticky top-0 z-10 flex items-center gap-6 bg-bg/70 px-4 py-2 backdrop-blur-md">
      <IconButton
        type="button"
        variant="ghost"
        size="lg"
        aria-label="戻る"
        className="rounded-full"
        onClick={() => router.history.back()}
      >
        <ArrowLeft className="size-5" />
      </IconButton>
      <div className="flex min-w-0 flex-1 flex-col leading-tight">
        <span className="truncate text-lg font-bold text-fg">{name}</span>
        <span className="truncate text-xs text-fg-muted">@{handle}</span>
      </div>
      {/* 右端の検索 icon。X 準拠、現状は見た目のみで動かない。 */}
      <IconButton
        type="button"
        variant="ghost"
        size="lg"
        aria-label="検索"
        className="rounded-full"
      >
        <Search className="size-5" />
      </IconButton>
    </div>
  );
}
