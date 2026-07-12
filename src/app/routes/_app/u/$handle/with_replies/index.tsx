import { createFileRoute } from "@tanstack/react-router";
import { UserProfileScreen } from "@/screens/user-profile/UserProfileScreen";

// /u/$handle/with_replies = 返信 タブ (parentId 有りの tweet のみ)。
export const Route = createFileRoute("/_app/u/$handle/with_replies/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { handle } = Route.useParams();
  return <UserProfileScreen handle={handle} filter="replies" />;
}
