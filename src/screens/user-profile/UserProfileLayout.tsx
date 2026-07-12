import { useState } from "react";
import { Outlet } from "@tanstack/react-router";
import { useProfileByHandleQuery } from "@features/profiles/client/queries";
import { useSession } from "@features/users/client/auth-client";
import { useFollowCountsQuery } from "@features/follows/client/queries";
import { EditProfileForm } from "./EditProfileForm";
import { ProfileActionRow } from "./ProfileActionRow";
import { ProfileBanner } from "./ProfileBanner";
import { ProfileHeader } from "./ProfileHeader";
import { ProfileTabs } from "./ProfileTabs";

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
