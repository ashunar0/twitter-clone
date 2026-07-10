import { eq, inArray } from "drizzle-orm";
import type { DB } from "../../../server/lib/db";
import { users, type UserRow } from "./table";

// users は auth ドメインの内部 identity。public 表示側の feature は profiles を参照する。
// ここでは display 情報 (name, image) を触るための最小 API のみ。
export type StoredUser = UserRow;

export const usersRepository = {
  // id で 1 件取得。無ければ null。
  async findById(db: DB, id: string): Promise<StoredUser | null> {
    const [row] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return row ?? null;
  },
  // 複数 id を 1 クエリで取得 (現状は使わないが auth 側の bulk lookup 用に残す)。
  async findByIds(db: DB, ids: string[]): Promise<StoredUser[]> {
    if (ids.length === 0) return [];
    return db.select().from(users).where(inArray(users.id, ids));
  },
};
