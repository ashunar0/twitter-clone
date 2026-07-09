import type { User } from "../type";
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
  async getById(id: string): Promise<User | null> {
    const row = await usersRepository.findById(id);
    return row ? toWire(row) : null;
  },
};
