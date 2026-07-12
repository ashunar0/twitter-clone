import { createFileRoute } from "@tanstack/react-router";
import { loadUserProfile } from "@/screens/user-profile/loader";
import { UserProfileLayout } from "@/screens/user-profile/UserProfileLayout";

// /u/$handle 配下 (ツイート / 返信 / メディア) の共通 layout route。
// loader はここで一度だけ profile / tweets を prefetch し、以降タブ切替では cache 再利用。
export const Route = createFileRoute("/_app/u/$handle")({
  loader: ({ context: { queryClient }, params: { handle } }) =>
    loadUserProfile(queryClient, handle),
  component: RouteComponent,
  errorComponent: ErrorComponent,
});

// loader / query の throw を受け取って 404 相当の UI を返す。
function ErrorComponent() {
  return (
    <main className="p-6">
      <h1 className="mb-2 text-2xl font-bold">User not found</h1>
      <p className="text-neutral-600">その handle のユーザーは存在しません。</p>
    </main>
  );
}

function RouteComponent() {
  const { handle } = Route.useParams();
  return <UserProfileLayout handle={handle} />;
}
