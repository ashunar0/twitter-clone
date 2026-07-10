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
import { AppHeader } from "@/widgets/app-header/AppHeader";
import { useSession } from "@features/users/client/auth-client";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootLayout,
});

// session 未確立の状態で /signin と /signup 以外を叩いたら /signin に redirect する。
// route.beforeLoad で書くと SSR っぽくクリーンだが、今は SPA なので component 側で見張る。
function RootLayout() {
  const session = useSession();
  const location = useLocation();
  const navigate = useNavigate();
  const publicPath =
    location.pathname === "/signin" || location.pathname === "/signup";

  useEffect(() => {
    if (session.isPending) return;
    if (!session.data && !publicPath) {
      navigate({ to: "/signin" });
    }
  }, [session.isPending, session.data, publicPath, navigate]);

  return (
    <>
      <AppHeader />
      <Outlet />
      <TanStackRouterDevtools />
      <ReactQueryDevtools />
    </>
  );
}
