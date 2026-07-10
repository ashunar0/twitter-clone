import type { Tweet } from "../type";
import type {
  AuthorSummary,
  CreateTweetWire,
  LikeStateWire,
  OriginalTweetWire,
  RetweetStateWire,
  TweetsListResponseWire,
} from "../schema";
import type { DB } from "../../../server/lib/db";
import type { Storage } from "../../../server/lib/storage";
import type { MediaSummary } from "../../media/schema";
import { mediaService } from "../../media/server/service";
import {
  profilesRepository,
  type StoredProfileWithUser,
} from "../../profiles/server/repository";
import { likesRepository } from "../../likes/server/repository";
import {
  tweetsRepository,
  TWEETS_PAGE_SIZE,
  type StoredTweet,
  type TweetCursor,
} from "./repository";
import { encodeTweetCursor } from "./cursor";

// DB row → wire 形への変換。
function toWire(row: StoredTweet): Tweet {
  return {
    id: row.id,
    authorId: row.authorId,
    parentId: row.parentId,
    retweetOfId: row.retweetOfId,
    body: row.body,
    createdAt: row.createdAt,
  };
}

// profile+user JOIN 行 → AuthorSummary。name / image は users 側から、handle は profiles 側から。
function toAuthorSummary(row: StoredProfileWithUser): AuthorSummary {
  return {
    handle: row.profile.handle,
    name: row.user.name,
    avatarUrl: row.user.image ?? null,
  };
}

export const tweetsService = {
  // create: current user 名義で 1 件作成する。parentId 有りなら reply、retweetOfId 有りなら RT。
  // id / createdAt は server 側で自動採番。mediaIds は usecase が別途 attachToTweet で紐付ける (service は low-level に保つ)。
  async create(
    db: DB,
    input: {
      body: string;
      parentId?: string | null;
      retweetOfId?: string | null;
    },
    currentUserId: string,
  ): Promise<Tweet> {
    const row = await tweetsRepository.insert(db, {
      id: crypto.randomUUID(),
      authorId: currentUserId,
      parentId: input.parentId ?? null,
      retweetOfId: input.retweetOfId ?? null,
      body: input.body,
    });
    return toWire(row);
  },
  // findById: usecase から親 / RT 元 tweet の存在確認に使う。
  async findById(db: DB, id: string): Promise<Tweet | null> {
    const row = await tweetsRepository.findById(db, id);
    return row ? toWire(row) : null;
  },
  // list: 直近 tweets (or 特定 author の) を 1 page 取得、cursor で seek pagination する。
  // 1 page に含まれる RT tweet の元 tweet + author を originalTweets map で解決 (page 外も含む)。
  // media enrichment は media feature の service を叩いて mediaSummaries を組む。
  async list(
    db: DB,
    storage: Storage,
    currentUserId: string,
    filter?: { authorId?: string; cursor?: TweetCursor },
  ): Promise<TweetsListResponseWire> {
    const rows = filter?.authorId
      ? await tweetsRepository.findByAuthorId(db, filter.authorId, filter.cursor)
      : await tweetsRepository.findRecent(db, filter?.cursor);
    const tweetIds = rows.map((r) => r.id);
    // 元 tweet 解決対象: RT 行の retweetOfId + 通常 tweet 自身 (「私が RT した？」の対象は "元" tweet id なので通常 tweet も対象)。
    const originalIds = [
      ...new Set(
        rows.flatMap((r) => (r.retweetOfId ? [r.retweetOfId] : [r.id])),
      ),
    ];
    // RT 元 tweet を実際に読む対象は「同 page に含まれない」ものだけ。含まれてれば authorSummaries と一緒に既に持ってる。
    const rowIds = new Set(tweetIds);
    const missingOriginalIds = originalIds.filter((id) => !rowIds.has(id));

    const authorIds = [...new Set(rows.map((r) => r.authorId))];

    // page 外の RT 元 tweet を fetch。author は fetch 後に追加解決する。
    const originalRows = await tweetsRepository.findByIds(
      db,
      missingOriginalIds,
    );
    // 元 tweet の author も authorSummaries に足す必要がある。
    for (const o of originalRows) authorIds.push(o.authorId);

    // like は "display 対象" (通常 tweet は自身、RT 行は元 tweet) について集計する。
    // したがって likeState の key は tweetIds ∪ originalIds = displayIds。
    const displayIds = [...new Set([...tweetIds, ...originalIds])];

    // 別 feature (profiles, likes, media) + 自 feature の cross reads を並列。
    const [
      profileRows,
      likeMineIds,
      likeCountsMap,
      retweetCountsMap,
      retweetMineIds,
      mediaMap,
    ] = await Promise.all([
      profilesRepository.findByUserIds(db, [...new Set(authorIds)]),
      likesRepository.findMineIds(db, displayIds, currentUserId),
      likesRepository.countByTweetIds(db, displayIds),
      tweetsRepository.countRetweetsByOriginalIds(db, originalIds),
      tweetsRepository.findMineRetweetOriginalIds(
        db,
        originalIds,
        currentUserId,
      ),
      // media は display 対象 tweet に紐づいたものを取る (RT 行自体は body 空で media 無し)。
      mediaService.listByTweetIds(db, storage, displayIds),
    ]);

    const authorSummaries: Record<string, AuthorSummary> = {};
    for (const row of profileRows) {
      authorSummaries[row.profile.userId] = toAuthorSummary(row);
    }

    const likeCounts: Record<string, number> = {};
    for (const id of displayIds) likeCounts[id] = likeCountsMap.get(id) ?? 0;
    const likeState: LikeStateWire = { counts: likeCounts, mineIds: likeMineIds };

    const retweetCounts: Record<string, number> = {};
    for (const id of originalIds) retweetCounts[id] = retweetCountsMap.get(id) ?? 0;
    const retweetState: RetweetStateWire = {
      counts: retweetCounts,
      mineIds: retweetMineIds,
    };

    // originalTweets: 元 tweet + author の bundle。同 page 内 / 外の両方を含める (FE の解決を単純化)。
    const originalTweets: Record<string, OriginalTweetWire> = {};
    const rowById = new Map(rows.map((r) => [r.id, r]));
    for (const id of originalIds) {
      const src = rowById.get(id) ?? originalRows.find((o) => o.id === id);
      if (!src) continue;
      const author = authorSummaries[src.authorId];
      if (!author) continue;
      originalTweets[id] = { tweet: toWire(src), author };
    }

    // page が満杯なら次があると判断、最後の row を cursor に。
    // 端でぴったり終わる corner case は次 fetch が空返しで自然に閉じる。
    const last = rows[rows.length - 1];
    const nextCursor =
      rows.length === TWEETS_PAGE_SIZE && last ? encodeTweetCursor(last) : null;

    const mediaSummaries: Record<string, MediaSummary[]> = {};
    for (const [tweetId, arr] of mediaMap) mediaSummaries[tweetId] = arr;

    return {
      tweets: rows.map(toWire),
      authorSummaries,
      likeState,
      retweetState,
      originalTweets,
      mediaSummaries,
      nextCursor,
    };
  },
};
