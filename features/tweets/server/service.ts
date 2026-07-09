import type { Tweet } from "../type";
import type {
  AuthorSummary,
  CreateTweetWire,
  LikeStateWire,
  TweetsListResponseWire,
} from "../schema";
import { usersRepository, type StoredUser } from "../../users/server/repository";
import { likesRepository } from "../../likes/server/repository";
import { tweetsRepository, type StoredTweet } from "./repository";

// DB row → wire 形への変換。
function toWire(row: StoredTweet): Tweet {
  return {
    id: row.id,
    authorId: row.authorId,
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
  // create: current user 名義で 1 件作成する。id / createdAt は server 側で自動採番。
  async create(input: CreateTweetWire, currentUserId: string): Promise<Tweet> {
    const row = await tweetsRepository.insert({
      id: crypto.randomUUID(),
      authorId: currentUserId,
      body: input.body,
    });
    return toWire(row);
  },
  // list: 直近 tweets (or 特定 author の) に author summary + likeState を付けて返す。
  async list(
    currentUserId: string,
    filter?: { authorId?: string },
  ): Promise<TweetsListResponseWire> {
    const rows = filter?.authorId
      ? await tweetsRepository.findByAuthorId(filter.authorId)
      : await tweetsRepository.findRecent();
    const tweetIds = rows.map((r) => r.id);
    const authorIds = [...new Set(rows.map((r) => r.authorId))];

    // 別 feature (users, likes) の repository を read-only で使う。service→service は禁止規約。
    const [authors, mineIds, countsMap] = await Promise.all([
      usersRepository.findByIds(authorIds),
      likesRepository.findMineIds(tweetIds, currentUserId),
      likesRepository.countByTweetIds(tweetIds),
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

    return {
      tweets: rows.map(toWire),
      authorSummaries,
      likeState,
    };
  },
};
