import type { Tweet } from "../type";
import type {
  AuthorSummary,
  CreateTweetWire,
  LikeStateWire,
  TweetsListResponseWire,
} from "../schema";
import type { DB } from "../../../server/lib/db";
import { usersRepository, type StoredUser } from "../../users/server/repository";
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
    body: row.body,
    createdAt: row.createdAt,
  };
}

// user row → AuthorSummary への抜粋。
function toAuthorSummary(row: StoredUser): AuthorSummary {
  return {
    handle: row.handle,
    name: row.name,
    avatarUrl: row.avatarUrl,
  };
}

export const tweetsService = {
  // create: current user 名義で 1 件作成する。parentId 有りなら reply。id / createdAt は server 側で自動採番。
  async create(
    db: DB,
    input: CreateTweetWire,
    currentUserId: string,
  ): Promise<Tweet> {
    const row = await tweetsRepository.insert(db, {
      id: crypto.randomUUID(),
      authorId: currentUserId,
      parentId: input.parentId ?? null,
      body: input.body,
    });
    return toWire(row);
  },
  // findById: usecase から親 tweet の存在確認に使う。
  async findById(db: DB, id: string): Promise<Tweet | null> {
    const row = await tweetsRepository.findById(db, id);
    return row ? toWire(row) : null;
  },
  // list: 直近 tweets (or 特定 author の) を 1 page 取得、cursor で seek pagination する。
  // 1 page 分だけ tweets + author summary + likeState + nextCursor を返す (page 跨ぎの merge は FE 側)。
  async list(
    db: DB,
    currentUserId: string,
    filter?: { authorId?: string; cursor?: TweetCursor },
  ): Promise<TweetsListResponseWire> {
    const rows = filter?.authorId
      ? await tweetsRepository.findByAuthorId(db, filter.authorId, filter.cursor)
      : await tweetsRepository.findRecent(db, filter?.cursor);
    const tweetIds = rows.map((r) => r.id);
    const authorIds = [...new Set(rows.map((r) => r.authorId))];

    // 別 feature (users, likes) の repository を read-only で使う。service→service は禁止規約。
    const [authors, mineIds, countsMap] = await Promise.all([
      usersRepository.findByIds(db, authorIds),
      likesRepository.findMineIds(db, tweetIds, currentUserId),
      likesRepository.countByTweetIds(db, tweetIds),
    ]);
    const authorMap = new Map(authors.map((a) => [a.id, a]));

    const authorSummaries: Record<string, AuthorSummary> = {};
    for (const id of authorIds) {
      const row = authorMap.get(id);
      if (row) authorSummaries[id] = toAuthorSummary(row);
    }

    const counts: Record<string, number> = {};
    for (const id of tweetIds) counts[id] = countsMap.get(id) ?? 0;

    const likeState: LikeStateWire = { counts, mineIds };

    // page が満杯なら次があると判断、最後の row を cursor に。
    // 端でぴったり終わる corner case は次 fetch が空返しで自然に閉じる。
    const last = rows[rows.length - 1];
    const nextCursor =
      rows.length === TWEETS_PAGE_SIZE && last ? encodeTweetCursor(last) : null;

    return {
      tweets: rows.map(toWire),
      authorSummaries,
      likeState,
      nextCursor,
    };
  },
};
