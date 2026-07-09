import type { Tweet, TweetsData } from "../type";
import type { AuthorSummary } from "../schema";
import { usersRepository, type StoredUser } from "../../users/server/repository";
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
  // list: 直近 tweets に author の summary を付けて返す (cross-domain read model)。
  async list(): Promise<TweetsData> {
    const rows = await tweetsRepository.findRecent();
    const authorIds = [...new Set(rows.map((r) => r.authorId))];
    // 別 feature (users) の repository を read-only で使う。service→service は禁止規約。
    const authors = await usersRepository.findByIds(authorIds);
    const authorMap = new Map(authors.map((a) => [a.id, a]));

    const authorSummaries: Record<string, AuthorSummary> = {};
    for (const id of authorIds) {
      const row = authorMap.get(id);
      if (row) authorSummaries[id] = toAuthorSummary(row);
    }

    return {
      tweets: rows.map(toWire),
      authorSummaries,
    };
  },
};
