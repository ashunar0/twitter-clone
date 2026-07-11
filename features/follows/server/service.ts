import type { FollowCounts } from "../schema";
import type { DB } from "../../../server/infra/db";
import { followsRepository } from "./repository";

export const followsService = {
  // 1 件 follow を追加、既存なら false を返す (冪等)。
  async follow(
    db: DB,
    followerId: string,
    followeeId: string,
  ): Promise<boolean> {
    return followsRepository.insert(db, followerId, followeeId);
  },
  // 1 件 follow を外す (冪等)。
  async unfollow(
    db: DB,
    followerId: string,
    followeeId: string,
  ): Promise<void> {
    await followsRepository.remove(db, followerId, followeeId);
  },
  // followerId が followeeId を follow しているか。
  async isFollowing(
    db: DB,
    followerId: string,
    followeeId: string,
  ): Promise<boolean> {
    return followsRepository.exists(db, followerId, followeeId);
  },
  // user の followers / following 件数。
  async counts(db: DB, userId: string): Promise<FollowCounts> {
    return followsRepository.counts(db, userId);
  },
};
