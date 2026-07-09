import { likesRepository } from "./repository";

export const likesService = {
  // current user 名義で tweet に like を付ける (冪等)。
  async add(tweetId: string, currentUserId: string): Promise<void> {
    await likesRepository.insert(tweetId, currentUserId);
  },
  // current user の like を外す (冪等)。
  async remove(tweetId: string, currentUserId: string): Promise<void> {
    await likesRepository.remove(tweetId, currentUserId);
  },
};
