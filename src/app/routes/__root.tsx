import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { QueryClient } from "@tanstack/react-query";
import { AppHeader } from "@/widgets/app-header/ui/AppHeader";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootLayout,
});

function RootLayout() {
  return (
    <>
      <AppHeader />
      <Outlet />
      <TanStackRouterDevtools />
      <ReactQueryDevtools />
    </>
  );
}
