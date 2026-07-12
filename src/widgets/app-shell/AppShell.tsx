import type { ReactNode } from "react";
import { LeftSidebar } from "@/widgets/left-sidebar/LeftSidebar";

// signin 後の共通 shell。3-column layout (left nav / center feed / right rail)。
// 中央カラムは screen 側で <main> を持つのでここでは gutter だけ確保する。
// 右カラムは後で RightSidebar widget を差し込む、現状は空プレースホルダ。
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-svh w-full max-w-6xl gap-0">
      <LeftSidebar />
      <div className="flex min-w-0 flex-1 justify-center">{children}</div>
      <aside className="sticky top-0 hidden h-svh w-80 shrink-0 lg:block" />
    </div>
  );
}
