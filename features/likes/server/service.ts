import type { DB } from "../../../server/lib/db";
import { likesRepository } from "./repository";

export const likesService = {
  // current user 名義で tweet に like を付ける (冪等)。
  async add(db: DB, tweetId: string, currentUserId: string): Promise<void> {
    await likesRepository.insert(db, tweetId, currentUserId);
  },
  // current user の like を外す (冪等)。
  async remove(db: DB, tweetId: string, currentUserId: string): Promise<void> {
    await likesRepository.remove(db, tweetId, currentUserId);
  },
};
