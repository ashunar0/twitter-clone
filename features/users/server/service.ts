import type { User } from "../type";
import type { UpdateProfileWire } from "../schema";
import type { DB } from "../../../server/lib/db";
import { ApiError } from "../../../server/lib/errors";
import { usersRepository, type StoredUser } from "./repository";

// DB row → wire 形への変換 (client に返す時の shape に整える)。
function toWire(row: StoredUser): User {
  return {
    id: row.id,
    handle: row.handle,
    name: row.name,
    avatarUrl: row.avatarUrl,
    createdAt: row.createdAt,
  };
}

export const usersService = {
  // id で 1 件取得。存在しなければ null。
  async getById(db: DB, id: string): Promise<User | null> {
    const row = await usersRepository.findById(db, id);
    return row ? toWire(row) : null;
  },
  // handle で 1 件取得。存在しなければ null。
  async getByHandle(db: DB, handle: string): Promise<User | null> {
    const row = await usersRepository.findByHandle(db, handle);
    return row ? toWire(row) : null;
  },
  // 自分の profile (name / handle) を更新する。
  // handle 重複は事前 check + UNIQUE 制約 catch の 2 段構え (race を UNIQUE で最終防衛)。
  async updateProfile(
    db: DB,
    currentUserId: string,
    input: UpdateProfileWire,
  ): Promise<User> {
    // 事前 check: 他人が同じ handle を使ってないか。
    const existing = await usersRepository.findByHandle(db, input.handle);
    if (existing && existing.id !== currentUserId) {
      throw ApiError.conflict("そのハンドルはすでに使われています", {
        handle: "already taken",
      });
    }
    try {
      const row = await usersRepository.updateById(db, currentUserId, input);
      if (!row) throw ApiError.notFound("user not found");
      return toWire(row);
    } catch (err) {
      // 事前 check と UPDATE の間で他人が同 handle を取った race を最終防衛。
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
