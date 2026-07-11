import {
  createRootRouteWithContext,
  Outlet,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { QueryClient } from "@tanstack/react-query";
import { useSession } from "@features/users/client/auth-client";
import { Toaster } from "@/shared/ui/toast";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootLayout,
});

// session 未確立の状態で /signin と /signup 以外を叩いたら /signin に redirect する。
// route.beforeLoad で書くと SSR っぽくクリーンだが、今は SPA なので component 側で見張る。
function RootLayout() {
  const session = useSession();
  const location = useLocation();
  const navigate = useNavigate();
  // signup は wizard で複数 subpath (/signup/email, /signup/handle, ...) に広がるので prefix 一致で扱う。
  const publicPath =
    location.pathname === "/signin" || location.pathname.startsWith("/signup");

  useEffect(() => {
    if (session.isPending) return;
    if (!session.data && !publicPath) {
      navigate({ to: "/signin" });
    }
  }, [session.isPending, session.data, publicPath, navigate]);

  return (
    <>
      <Outlet />
      <Toaster />
      <TanStackRouterDevtools />
      <ReactQueryDevtools />
    </>
  );
}
