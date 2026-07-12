import { createFileRoute } from "@tanstack/react-router";
import { UserProfileScreen } from "@/screens/user-profile/UserProfileScreen";

// /u/$handle/media = メディア タブ (mediaSummaries に紐付きあり)。
export const Route = createFileRoute("/_app/u/$handle/media/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { handle } = Route.useParams();
  return <UserProfileScreen handle={handle} filter="media" />;
}
