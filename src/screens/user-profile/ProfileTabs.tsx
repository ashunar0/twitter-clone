import { Link, useLocation } from "@tanstack/react-router";

// プロフィールのタブ (ツイート / 返信 / メディア)。
// active は pathname 完全一致で、下に brand-blue の太バーを重ねる (X 準拠)。
export function ProfileTabs({ handle }: { handle: string }) {
  return (
    <nav className="mt-4 flex border-b border-border">
      <TabLink to="/u/$handle" params={{ handle }} label="ツイート" exact />
      <TabLink to="/u/$handle/with_replies" params={{ handle }} label="返信" />
      <TabLink to="/u/$handle/media" params={{ handle }} label="メディア" />
    </nav>
  );
}

// タブ 1 個。/u/$handle だけ exact=true にして、返信/メディアの pathname に "startsWith" で吸われないようにする。
function TabLink({
  to,
  params,
  label,
  exact = false,
}: {
  to: "/u/$handle" | "/u/$handle/with_replies" | "/u/$handle/media";
  params: { handle: string };
  label: string;
  exact?: boolean;
}) {
  const location = useLocation();
  const target = to.replace("$handle", params.handle);
  const active = exact
    ? location.pathname === target
    : location.pathname.startsWith(target);
  return (
    <Link
      to={to}
      params={params}
      className="relative flex flex-1 items-center justify-center py-4 text-sm text-fg-muted hover:bg-fg/5"
    >
      <span className={active ? "font-bold text-fg" : ""}>{label}</span>
      {active ? (
        <span className="absolute bottom-0 h-1 w-14 rounded-full bg-brand-blue" />
      ) : null}
    </Link>
  );
}
