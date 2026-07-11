import { Outlet, createFileRoute } from "@tanstack/react-router";
import { AuthLayout } from "@/widgets/auth-layout/AuthLayout";

// 認証系画面 (/signin, /signup) の pathless layout route。見た目は AuthLayout widget に委譲。
export const Route = createFileRoute("/_auth")({
  component: AuthRoute,
});

// route 宣言と widget 呼び出しの繋ぎだけを担う。
function AuthRoute() {
  return (
    <AuthLayout>
      <Outlet />
    </AuthLayout>
  );
}
