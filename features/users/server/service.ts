import type { DB } from "../../../server/lib/db";
import type { User } from "../type";
import { usersRepository, type StoredUser } from "./repository";

// user row → wire 形。auth ドメインの内部 identity として email も含める。
function toWire(row: StoredUser): User {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    image: row.image,
  };
}

export const usersService = {
  // id で 1 件取得。currentUser middleware から使う。
  async getById(db: DB, id: string): Promise<User | null> {
    const row = await usersRepository.findById(db, id);
    return row ? toWire(row) : null;
  },
};
