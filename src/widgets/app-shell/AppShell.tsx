import type { ReactNode } from "react";
import { LeftSidebar } from "@/widgets/left-sidebar/LeftSidebar";
import { RightSidebar } from "@/widgets/right-sidebar/RightSidebar";

// signin 後の共通 shell。3-column layout (left nav / center feed / right rail)。
// 3 カラム密着 + mx-auto で viewport 中央 (Twitter/X 準拠)。
// 中央カラムの幅は shell 側 (w-[600px]) で確定させる — screen 側で max-w を積んでも
// 親幅が未定義だと効かず縮んでしまうため。
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-svh w-fit">
      <LeftSidebar />
      <div className="w-150 shrink-0">{children}</div>
      <RightSidebar />
    </div>
  );
}
