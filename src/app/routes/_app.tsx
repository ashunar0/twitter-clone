import { Outlet, createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/widgets/app-shell/AppShell";

// signin 後の全画面 (/, /notifications, /u/$handle) の pathless layout route。
// shell (3-column) を差し込むだけで URL は変えない。
export const Route = createFileRoute("/_app")({
  component: AppRoute,
});

// route 宣言と shell 呼び出しの繋ぎ。
function AppRoute() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
