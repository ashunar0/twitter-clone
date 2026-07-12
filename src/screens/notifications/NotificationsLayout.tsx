import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { Settings } from "lucide-react";

// /notifications 配下の共通レイアウト。上部 header (title + Settings) + タブ (すべて / @ツイート)。
// タブは path で active 判定して brand-blue underline を出す (X 準拠)。
export function NotificationsLayout() {
  return (
    <main className="min-h-svh w-full border-x border-border">
      <div className="flex items-center justify-between px-4 py-3">
        <h1 className="text-xl font-bold">Notifications</h1>
        <Settings className="size-5 text-fg" aria-hidden />
      </div>
      <nav className="flex border-b border-border">
        <TabLink to="/notifications" label="すべて" />
        <TabLink to="/notifications/mentions" label="@ツイート" />
      </nav>
      <Outlet />
    </main>
  );
}

// タブ 1 個。active は pathname 完全一致で判定し、下に brand-blue の太バーを重ねる。
function TabLink({ to, label }: { to: "/notifications" | "/notifications/mentions"; label: string }) {
  const location = useLocation();
  const active = location.pathname === to;
  return (
    <Link
      to={to}
      className="relative flex flex-1 items-center justify-center py-4 text-sm text-fg-muted hover:bg-fg/5"
    >
      <span className={active ? "font-bold text-fg" : ""}>{label}</span>
      {active ? (
        <span className="absolute bottom-0 h-1 w-14 rounded-full bg-brand-blue" />
      ) : null}
    </Link>
  );
}
