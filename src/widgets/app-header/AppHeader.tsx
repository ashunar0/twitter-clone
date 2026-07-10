import { Link, useNavigate } from "@tanstack/react-router";
import { useCurrentProfileQuery } from "@features/profiles/client/queries";
import { useSession, signOut } from "@features/users/client/auth-client";
import { useNotificationsQuery } from "@features/notifications/client/queries";

// アプリ全体の nav bar。Home / Notifications / My profile / Sign out。
// notifications の unreadCount を badge 表示する。
// session 無しなら auth 系リンクだけ描画 (Signup / Signin)。
export function AppHeader() {
  const session = useSession();
  const profile = useCurrentProfileQuery();
  const unread = useNotificationsQuery().data?.unreadCount ?? 0;
  const navigate = useNavigate();

  const signedIn = !!session.data;

  return (
    <header className="border-b border-neutral-200 bg-white">
      <nav className="mx-auto flex max-w-xl items-center justify-between px-6 py-3">
        <Link to="/" className="text-lg font-bold hover:underline">
          Twitter Clone
        </Link>
        <div className="flex items-center gap-4 text-sm">
          {signedIn ? (
            <>
              <Link to="/" className="hover:underline">
                Home
              </Link>
              <Link to="/notifications" className="relative hover:underline">
                Notifications
                {unread > 0 && (
                  <span className="absolute -right-4 -top-2 rounded-full bg-pink-600 px-1.5 py-0.5 text-xs text-white">
                    {unread}
                  </span>
                )}
              </Link>
              {profile.data && (
                <Link
                  to="/u/$handle"
                  params={{ handle: profile.data.handle }}
                  className="hover:underline"
                >
                  @{profile.data.handle}
                </Link>
              )}
              <button
                type="button"
                className="text-neutral-600 hover:text-neutral-900"
                onClick={async () => {
                  await signOut();
                  navigate({ to: "/signin" });
                }}
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/signin" className="hover:underline">
                Sign in
              </Link>
              <Link to="/signup" className="hover:underline">
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
