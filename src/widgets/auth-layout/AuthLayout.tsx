import type { ReactNode } from "react";

// 認証系画面 (/signin, /signup) の共通レイアウト。child form を viewport 縦横中央に配置する。
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      {children}
    </div>
  );
}
