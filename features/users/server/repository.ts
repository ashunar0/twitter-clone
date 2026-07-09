import { eq, inArray } from "drizzle-orm";
import { db } from "../../../server/lib/db";
import { users, type UserRow } from "./table";

export type StoredUser = UserRow;

export const usersRepository = {
  // id で 1 件取得。無ければ null。
  async findById(id: string): Promise<StoredUser | null> {
    const [row] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return row ?? null;
  },
  // 複数 id を 1 クエリで取得 (enrichMany の N+1 回避用)。
  async findByIds(ids: string[]): Promise<StoredUser[]> {
    if (ids.length === 0) return [];
    return db.select().from(users).where(inArray(users.id, ids));
  },
};
