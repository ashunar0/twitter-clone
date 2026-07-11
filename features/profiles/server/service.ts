import type { DB } from "../../../server/infra/db";
import { ApiError } from "../../../server/lib/errors";
import type { Profile } from "../type";
import type {
  ProfileSummary,
  UpdateProfileWire,
} from "../schema";
import {
  profilesRepository,
  type StoredProfileWithUser,
} from "./repository";

// (profile, user) JOIN row → wire 形へ。name / image は users 側から拾う。
function toWire(row: StoredProfileWithUser): Profile {
  return {
    userId: row.profile.userId,
    handle: row.profile.handle,
    name: row.user.name,
    avatarUrl: row.user.image ?? null,
  };
}

// summary は tweets/notifications の enrichment 用。id を持たない (map の key に userId を使う)。
function toSummary(row: StoredProfileWithUser): ProfileSummary {
  return {
    handle: row.profile.handle,
    name: row.user.name,
    avatarUrl: row.user.image ?? null,
  };
}

export const profilesService = {
  // userId で 1 件取得。存在しなければ null。
  async getByUserId(db: DB, userId: string): Promise<Profile | null> {
    const row = await profilesRepository.findByUserId(db, userId);
    return row ? toWire(row) : null;
  },
  // handle で 1 件取得。存在しなければ null。
  async getByHandle(db: DB, handle: string): Promise<Profile | null> {
    const row = await profilesRepository.findByHandle(db, handle);
    return row ? toWire(row) : null;
  },
  // handle が空いてるかを DB lookup で判定する。availability check endpoint 用の pure read。
  async isHandleAvailable(db: DB, handle: string): Promise<boolean> {
    const row = await profilesRepository.findByHandle(db, handle);
    return row === null;
  },
  // 複数 userId → summary map。cross-feature enrichment の対外 API (tweets 等が使う)。
  async summariesByUserIds(
    db: DB,
    userIds: string[],
  ): Promise<Record<string, ProfileSummary>> {
    const rows = await profilesRepository.findByUserIds(db, userIds);
    const result: Record<string, ProfileSummary> = {};
    for (const row of rows) result[row.profile.userId] = toSummary(row);
    return result;
  },
  // 自分の profile (handle + name) を更新する。
  // handle 重複は事前 check + UNIQUE 制約 catch の 2 段構え。
  async updateMe(
    db: DB,
    currentUserId: string,
    input: UpdateProfileWire,
  ): Promise<Profile> {
    // 事前 check: 他人が同じ handle を使ってないか。
    const existing = await profilesRepository.findByHandle(db, input.handle);
    if (existing && existing.profile.userId !== currentUserId) {
      throw ApiError.conflict("そのハンドルはすでに使われています", {
        handle: "already taken",
      });
    }
    try {
      // handle は profiles 側、name は users 側 (better-auth 管理領域) を更新する。
      const handleRow = await profilesRepository.updateHandle(
        db,
        currentUserId,
        input.handle,
      );
      if (!handleRow) throw ApiError.notFound("profile not found");
      await profilesRepository.updateUserName(db, currentUserId, input.name);
      const updated = await profilesRepository.findByUserId(db, currentUserId);
      if (!updated) throw ApiError.notFound("profile not found");
      return toWire(updated);
    } catch (err) {
      if (isUniqueConstraintError(err)) {
        throw ApiError.conflict("そのハンドルはすでに使われています", {
          handle: "already taken",
        });
      }
      throw err;
    }
  },
};

// SQLite (libsql / D1) の UNIQUE 制約違反かを判定する (両ドライバとも同じ文字列を吐く)。
function isUniqueConstraintError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  return /UNIQUE constraint failed/i.test(err.message);
}
