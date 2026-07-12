import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { ArrowLeft, Mail, MoreHorizontal, Search, User } from "lucide-react";
import { Avatar } from "@/shared/ui/avatar";
import { useProfileByHandleQuery } from "@features/profiles/client/queries";
import { useSession } from "@features/users/client/auth-client";
import { useUserTweetsQuery } from "@features/tweets/client/queries";
import { useFollowCountsQuery } from "@features/follows/client/queries";
import { TweetItem } from "@/widgets/tweet-item/TweetItem";
import { FollowButton } from "@/widgets/follow-button/FollowButton";
import { InfiniteScrollSentinel } from "@/shared/InfiniteScrollSentinel";
import { Button } from "@/shared/ui/button";
import { IconButton } from "@/shared/ui/icon-button";
import { EditProfileForm } from "./EditProfileForm";

// プロフィール上部の sticky header。左に戻る矢印、右に name (bold) + N posts (subtle)。
// X 準拠で backdrop-blur + 半透明 bg を敷き、tweet list をスクロールしても見えるようにする。
function ProfileHeader({ name, postCount }: { name: string; postCount: number }) {
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
        <span className="text-xs text-fg-muted">{postCount} posts</span>
      </div>
      {/* 右端の検索 icon。X 準拠、現状は見た目のみで動かない。 */}
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

// user profile 画面。loader で prefetch 済みの profile / tweets / follow 情報を cache から読む。
export function UserProfileScreen({ handle }: { handle: string }) {
  const profileQuery = useProfileByHandleQuery(handle);
  const session = useSession();
  const profile = profileQuery.data;
  // profile が確定するまで下位 query は enable しない (userId が要る)。
  const tweetsQuery = useUserTweetsQuery(profile?.userId ?? "");
  const countsQuery = useFollowCountsQuery(profile?.userId ?? "");
  const [editing, setEditing] = useState(false);

  if (profileQuery.isLoading) return <div className="p-6">Loading…</div>;
  if (profileQuery.error || !profile)
    return <div className="p-6 text-red-600">User not found</div>;

  const tweets = tweetsQuery.data;
  const counts = countsQuery.data;
  const isMe = session.data?.user.id === profile.userId;

  return (
    <main className="min-h-svh w-full border-x border-border">
      <ProfileHeader name={profile.name} postCount={tweets?.tweets.length ?? 0} />
      <ProfileBanner avatar={profile.avatarUrl} name={profile.name} />
      <ProfileActionRow
        isMe={isMe}
        isEditing={editing}
        userId={profile.userId}
        onEdit={() => setEditing(true)}
      />
      <div className="mb-6 px-4">
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
      <h2 className="mb-3 text-lg font-semibold">Tweets</h2>
      {tweetsQuery.isLoading || !tweets ? (
        <div>Loading tweets…</div>
      ) : (
        <>
          <ul className="flex flex-col gap-3">
            {tweets.tweets.map((tweet) => {
              // retweet 行なら元 tweet を表示、行 author (retweeter) は TweetItem の retweet header 再対応時に戻す。
              const isRt = tweet.retweetOfId != null;
              const original = isRt
                ? tweets.originalTweets[tweet.retweetOfId!]
                : null;
              const displayTweet = original?.tweet ?? tweet;
              const displayAuthor =
                original?.author ?? tweets.authorSummaries[tweet.authorId];
              const retweetedBy = isRt
                ? tweets.authorSummaries[tweet.authorId]
                : undefined;
              return (
                <TweetItem
                  key={tweet.id}
                  tweet={displayTweet}
                  author={displayAuthor}
                  retweetedBy={retweetedBy}
                  likeCount={tweets.likeState.counts[displayTweet.id] ?? 0}
                  retweetCount={tweets.retweetState.counts[displayTweet.id] ?? 0}
                  mineLike={tweets.likeState.mineIds.has(displayTweet.id)}
                  mineRetweet={tweets.retweetState.mineIds.has(displayTweet.id)}
                />
              );
            })}
            {tweets.tweets.length === 0 && (
              <li className="text-neutral-500">まだ tweet がないのだ。</li>
            )}
          </ul>
          <InfiniteScrollSentinel
            onVisible={() => tweetsQuery.fetchNextPage()}
            disabled={
              !tweetsQuery.hasNextPage || tweetsQuery.isFetchingNextPage
            }
            label={
              tweetsQuery.isFetchingNextPage
                ? "Loading more…"
                : tweetsQuery.hasNextPage
                  ? ""
                  : ""
            }
          />
        </>
      )}
    </main>
  );
}
