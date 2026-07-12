import { createFileRoute } from "@tanstack/react-router";
import { UserProfileScreen } from "@/screens/user-profile/UserProfileScreen";

// /u/$handle = ツイート タブ。データ取得は親 layout の loader が担う。
export const Route = createFileRoute("/_app/u/$handle/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { handle } = Route.useParams();
  return <UserProfileScreen handle={handle} filter="posts" />;
}
