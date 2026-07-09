import { createFileRoute } from "@tanstack/react-router";
import { loadUserProfile } from "@/screens/user-profile/loader";
import { UserProfileScreen } from "@/screens/user-profile/ui/UserProfileScreen";

export const Route = createFileRoute("/u/$handle/")({
  loader: ({ context: { queryClient }, params: { handle } }) =>
    loadUserProfile(queryClient, handle),
  component: RouteComponent,
  errorComponent: ErrorComponent,
});

// loader / query の throw を受け取って 404 相当の UI を返す。
function ErrorComponent() {
  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="mb-2 text-2xl font-bold">User not found</h1>
      <p className="text-neutral-600">その handle のユーザーはいないのだ。</p>
    </main>
  );
}

function RouteComponent() {
  const { handle } = Route.useParams();
  return <UserProfileScreen handle={handle} />;
}
