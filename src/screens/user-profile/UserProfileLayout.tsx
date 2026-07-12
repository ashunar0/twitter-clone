import { useState } from "react";
import { Link, Outlet, useLocation, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Mail, MoreHorizontal, Search, User } from "lucide-react";
import { Avatar } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import { IconButton } from "@/shared/ui/icon-button";
import { FollowButton } from "@/widgets/follow-button/FollowButton";
import { useProfileByHandleQuery } from "@features/profiles/client/queries";
import { useSession } from "@features/users/client/auth-client";
import { useFollowCountsQuery } from "@features/follows/client/queries";
import { EditProfileForm } from "./EditProfileForm";

// /u/$handle 配下 (ツイート / 返信 / メディア タブ) の共通レイアウト。
// header + banner + アクション行 + 名前 / handle / follow 数 + タブ + Outlet を持ち、下段のタブ内容は子 route が描画する。
export function UserProfileLayout({ handle }: { handle: string }) {
  const profileQuery = useProfileByHandleQuery(handle);
  const session = useSession();
  const profile = profileQuery.data;
  const countsQuery = useFollowCountsQuery(profile?.userId ?? "");
  const [editing, setEditing] = useState(false);

  if (profileQuery.isLoading) return <div className="p-6">Loading…</div>;
  if (profileQuery.error || !profile)
    return <div className="p-6 text-red-600">User not found</div>;

  const counts = countsQuery.data;
  const isMe = session.data?.user.id === profile.userId;

  return (
    <main className="min-h-svh w-full border-x border-border">
      <ProfileHeader name={profile.name} handle={profile.handle} />
      <ProfileBanner avatar={profile.avatarUrl} name={profile.name} />
      <ProfileActionRow
        isMe={isMe}
        isEditing={editing}
        userId={profile.userId}
        onEdit={() => setEditing(true)}
      />
      <div className="px-4">
        <div>
          <h1 className="text-xl font-bold text-fg">{profile.name}</h1>
          <div className="text-sm text-fg-muted">@{profile.handle}</div>
        </div>
        <div className="mt-3 flex gap-4 text-sm text-fg-muted">
          <span>
            <strong className="text-fg">{counts?.following ?? 0}</strong>{" "}
            フォロー中
          </span>
          <span>
            <strong className="text-fg">{counts?.followers ?? 0}</strong>{" "}
            フォロワー
          </span>
        </div>
        {isMe && editing ? (
          <EditProfileForm profile={profile} onDone={() => setEditing(false)} />
        ) : null}
      </div>
      <ProfileTabs handle={handle} />
      <Outlet />
    </main>
  );
}

// タブ (ツイート / 返信 / メディア)。active は pathname 完全一致で、下に brand-blue の太バーを重ねる (X 準拠)。
function ProfileTabs({ handle }: { handle: string }) {
  return (
    <nav className="mt-4 flex border-b border-border">
      <TabLink to="/u/$handle" params={{ handle }} label="ツイート" exact />
      <TabLink
        to="/u/$handle/with_replies"
        params={{ handle }}
        label="返信"
      />
      <TabLink to="/u/$handle/media" params={{ handle }} label="メディア" />
    </nav>
  );
}

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

// プロフィール上部の sticky header。左に戻る矢印、右に name (bold) + N posts (subtle)。
// X 準拠で backdrop-blur + 半透明 bg を敷き、tweet list をスクロールしても見えるようにする。
// postCount は本来 tweet 総数だが、profile layout では tweet データを持たないので handle を出すだけの簡略版。
function ProfileHeader({ name, handle }: { name: string; handle: string }) {
  const router = useRouter();
  return (
    <div className="sticky top-0 z-10 flex items-center gap-6 bg-bg/70 px-4 py-2 backdrop-blur-md">
      <IconButton
        type="button"
        variant="ghost"
        size="lg"
        aria-label="戻る"
        className="rounded-full"
        onClick={() => router.history.back()}
      >
        <ArrowLeft className="size-5" />
      </IconButton>
      <div className="flex min-w-0 flex-1 flex-col leading-tight">
        <span className="truncate text-lg font-bold text-fg">{name}</span>
        <span className="truncate text-xs text-fg-muted">@{handle}</span>
      </div>
      <IconButton
        type="button"
        variant="ghost"
        size="lg"
        aria-label="検索"
        className="rounded-full"
      >
        <Search className="size-5" />
      </IconButton>
    </div>
  );
}

// 横長のバナー画像 + 左下にかぶる大きめ avatar。schema にバナー画像がないので常に fg/10 の gray fallback。
// avatar は banner の下辺に半分ずつまたがるよう、banner 内で bottom を -64px (avatar 半径) にオフセット。
// banner の下にはみ出す 64px 分は、後続の ProfileActionRow (py-3 + size-lg = 64px) がちょうど埋める。
function ProfileBanner({ avatar, name }: { avatar: string | null; name: string }) {
  return (
    <div className="relative h-48 w-full bg-fg/10">
      <div className="absolute -bottom-16 left-4">
        <Avatar.Root className="size-32 rounded-full ring-4 ring-bg">
          {avatar ? <Avatar.Image src={avatar} alt={name} /> : null}
          <Avatar.Fallback className="bg-fg/10">
            <User className="size-14 text-fg-subtle" aria-hidden />
          </Avatar.Fallback>
        </Avatar.Root>
      </div>
    </div>
  );
}

// バナー直下 (avatar と同じ横 strip) の右寄せアクション行。
// - 自分: 「プロフィールを編集」ボタンのみ
// - 他人: 左から menu (…) / DM (メール icon) / Follow ボタン
// DM と menu は現状表示のみで動かない。
function ProfileActionRow({
  isMe,
  isEditing,
  userId,
  onEdit,
}: {
  isMe: boolean;
  isEditing: boolean;
  userId: string;
  onEdit: () => void;
}) {
  return (
    <div className="flex justify-end gap-2 px-4 py-3">
      {isMe ? (
        !isEditing && (
          <Button
            variant="outline"
            className="rounded-full font-bold"
            onClick={onEdit}
          >
            プロフィールを編集
          </Button>
        )
      ) : (
        <>
          <IconButton
            type="button"
            variant="outline"
            size="lg"
            aria-label="メニュー"
            className="rounded-full"
          >
            <MoreHorizontal className="size-5" />
          </IconButton>
          <IconButton
            type="button"
            variant="outline"
            size="lg"
            aria-label="メッセージ"
            className="rounded-full"
          >
            <Mail className="size-5" />
          </IconButton>
          <FollowButton targetUserId={userId} />
        </>
      )}
    </div>
  );
}
