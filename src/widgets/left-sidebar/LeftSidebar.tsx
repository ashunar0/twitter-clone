import { Link, useLocation } from "@tanstack/react-router";
import {
  Bell,
  Bird,
  Bookmark,
  Home,
  LogOut,
  Mail,
  Search,
  User,
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import { Avatar } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import { signOut } from "@features/users/client/auth-client";
import { useCurrentProfileQuery } from "@features/profiles/client/queries";

// 左サイドバー。Twitter/X 準拠で logo / nav / Post button / account footer の 4 段構成。
// 実装済み route (Home / Notifications / Profile) は Link、未実装 (検索/チャット/ブックマーク) は
// href="#" のダミーリンクで出す (存在感だけ先に確保、後で route が生えたら to に差し替える)。
export function LeftSidebar() {
  const currentProfileQuery = useCurrentProfileQuery();
  const currentProfile = currentProfileQuery.data;

  // profile リンクは current handle が要る (未取得時は /u へ落とさず disabled 相当に)。
  const profileTo = currentProfile ? `/u/${currentProfile.handle}` : "/";

  return (
    <aside className="sticky top-0 flex h-svh w-64 shrink-0 flex-col justify-between px-3 py-2">
      <div className="flex flex-col gap-1">
        {/* 上部 logo。auth 画面と揃えて lucide の Bird を使う (Twitter 由来のトンマナ)。 */}
        <Link
          to="/"
          className="flex size-12 items-center justify-center rounded-full text-fg hover:bg-fg/5"
          aria-label="Home"
        >
          <Bird className="size-7" aria-hidden />
        </Link>
        <NavItem to="/" icon={Home} label="ホーム" />
        <NavItem href="#" icon={Search} label="話題を検索" />
        <NavItem to="/notifications" icon={Bell} label="通知" />
        <NavItem href="#" icon={Mail} label="メッセージ" />
        <NavItem href="#" icon={Bookmark} label="ブックマーク" />
        <NavItem to={profileTo} icon={User} label="プロフィール" />
        {/* Post button. サイドバー幅に張り出す太めボタン。size-12 の nav item と縦リズムを合わせる。 */}
        <Button
          className="mt-2 h-12 w-full rounded-full bg-brand-blue text-base font-bold text-white hover:bg-brand-blue-dark"
        >
          ツイートする
        </Button>
      </div>
      {/* 下部 account footer。avatar / name / handle と signout。 */}
      {currentProfile ? (
        <button
          type="button"
          onClick={() => signOut()}
          className="flex items-center gap-3 rounded-full p-3 text-left hover:bg-fg/5"
          aria-label="ログアウト"
        >
          <Avatar.Root className="size-10 shrink-0">
            {currentProfile.avatarUrl ? (
              <Avatar.Image src={currentProfile.avatarUrl} alt={currentProfile.name} />
            ) : null}
            <Avatar.Fallback>
              <User className="size-5 text-fg-subtle" aria-hidden />
            </Avatar.Fallback>
          </Avatar.Root>
          <div className="flex min-w-0 flex-1 flex-col leading-tight">
            <span className="truncate text-sm font-bold text-fg">
              {currentProfile.name}
            </span>
            <span className="truncate text-sm text-fg-muted">
              @{currentProfile.handle}
            </span>
          </div>
          <LogOut className="size-4 text-fg-muted" aria-hidden />
        </button>
      ) : null}
    </aside>
  );
}

// nav 1 行。to (実装済み route) なら TanStack Link + active 判定、href (未実装) なら素の <a>。
// active state は pathname 一致で判定 (X は太字 + fill 済 icon で active を出す)。
function NavItem({
  to,
  href,
  icon: Icon,
  label,
}: {
  to?: string;
  href?: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
}) {
  const location = useLocation();
  const active = to != null && location.pathname === to;
  const className =
    "flex items-center gap-4 rounded-full px-3 py-2 text-xl text-fg hover:bg-fg/5";
  const inner = (
    <>
      <Icon className="size-6" strokeWidth={active ? 2.5 : 2} aria-hidden />
      <span className={active ? "font-bold" : "font-normal"}>{label}</span>
    </>
  );
  if (to) {
    return (
      <Link to={to} className={className}>
        {inner}
      </Link>
    );
  }
  return (
    <a href={href} className={className}>
      {inner}
    </a>
  );
}
