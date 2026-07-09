import type { FollowCounts } from "../schema";
import { followsRepository } from "./repository";

export const followsService = {
  // 1 件 follow を追加、既存なら false を返す (冪等)。
  async follow(followerId: string, followeeId: string): Promise<boolean> {
    return followsRepository.insert(followerId, followeeId);
  },
  // 1 件 follow を外す (冪等)。
  async unfollow(followerId: string, followeeId: string): Promise<void> {
    await followsRepository.remove(followerId, followeeId);
  },
  // followerId が followeeId を follow しているか。
  async isFollowing(followerId: string, followeeId: string): Promise<boolean> {
    return followsRepository.exists(followerId, followeeId);
  },
  // user の followers / following 件数。
  async counts(userId: string): Promise<FollowCounts> {
    return followsRepository.counts(userId);
  },
};
