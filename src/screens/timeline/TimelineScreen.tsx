import { TweetItem, type TweetItemProps } from "@/widgets/tweet-item/TweetItem";

// public timeline 画面。中央カラムに feed を並べる Twitter 風のレイアウト。
// 現時点はレイアウト検証のため仮データを配列で持つ。本 API 配線は次スライスで戻す。
export function TimelineScreen() {
  return (
    <main className="mx-auto min-h-svh w-full max-w-xl border-x border-border">
      <ul className="flex flex-col">
        {SAMPLE_TWEETS.map((t, i) => (
          <li key={i}>
            <TweetItem {...t} />
          </li>
        ))}
      </ul>
    </main>
  );
}

// 仮データ。author.avatarUrl は fallback の initials 動作を見るため一部だけ埋める。
// createdAt は Date.now 相対じゃなくて生の ISO を置いて相対整形を効かせる。
const SAMPLE_TWEETS: TweetItemProps[] = [
  {
    author: { name: "あさひ", handle: "asahi", avatarUrl: null },
    body: "はじめてのツイート表示なのだ。長い文が入った時に折り返しが自然に効くか、あと handle と時刻の並びが崩れないかを見る。",
    createdAt: new Date(Date.now() - 5 * 60_000).toISOString(),
    replyCount: 3,
    retweetCount: 12,
    likeCount: 48,
  },
  {
    author: { name: "ずんだもん", handle: "zundamon", avatarUrl: null },
    body: "action row のホバー挙動、count 0 のとき数字消えるか、みたいな細かい所を見るためのサンプルなのだ。",
    createdAt: new Date(Date.now() - 2 * 3600_000).toISOString(),
    likeCount: 7,
  },
  {
    author: {
      name: "Sarah Chen",
      handle: "sarah_c",
      avatarUrl: null,
    },
    body: "英語混じり + short body の見え方確認。",
    createdAt: new Date(Date.now() - 26 * 3600_000).toISOString(),
    replyCount: 1,
    retweetCount: 2,
    likeCount: 15,
  },
];
