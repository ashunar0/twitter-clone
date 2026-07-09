import { Link } from "@tanstack/react-router";
import { useCurrentUserQuery } from "@features/users/client/queries";
import { useNotificationsQuery } from "@features/notifications/client/queries";

// アプリ全体の nav bar。Home / Notifications / My profile。
// notifications の unreadCount を badge 表示する。
export function AppHeader() {
  const currentUser = useCurrentUserQuery().data;
  const unread = useNotificationsQuery().data?.unreadCount ?? 0;

  return (
    <header className="border-b border-neutral-200 bg-white">
      <nav className="mx-auto flex max-w-xl items-center justify-between px-6 py-3">
        <Link to="/" className="text-lg font-bold hover:underline">
          Twitter Clone
        </Link>
        <div className="flex items-center gap-4 text-sm">
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
          {currentUser && (
            <Link
              to="/u/$handle"
              params={{ handle: currentUser.handle }}
              className="hover:underline"
            >
              @{currentUser.handle}
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
