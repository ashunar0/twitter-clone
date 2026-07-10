import { eq, inArray } from "drizzle-orm";
import type { DB } from "../../../server/lib/db";
import { profiles, type ProfileRow } from "./table";
import { users, type UserRow } from "../../users/server/table";

// profiles 単体は handle しか持たない (name/avatarUrl は users 側)。
// なので repository は「profile + user を JOIN で取り出す」形に統一する。
// enrichment 用の read は cross-domain 合成の owning feature = profiles として吸収する。
export type StoredProfileWithUser = { profile: ProfileRow; user: UserRow };

export const profilesRepository = {
  // 1 件挿入。signup usecase から呼ばれる。
  async insert(
    db: DB,
    row: { userId: string; handle: string },
  ): Promise<ProfileRow> {
    const [inserted] = await db.insert(profiles).values(row).returning();
    if (!inserted) throw new Error("insert profile failed");
    return inserted;
  },
  // userId で 1 件取得 (profile + user)。
  async findByUserId(
    db: DB,
    userId: string,
  ): Promise<StoredProfileWithUser | null> {
    const [row] = await db
      .select({ profile: profiles, user: users })
      .from(profiles)
      .innerJoin(users, eq(profiles.userId, users.id))
      .where(eq(profiles.userId, userId))
      .limit(1);
    return row ?? null;
  },
  // handle (unique) で 1 件取得 (profile + user)。
  async findByHandle(
    db: DB,
    handle: string,
  ): Promise<StoredProfileWithUser | null> {
    const [row] = await db
      .select({ profile: profiles, user: users })
      .from(profiles)
      .innerJoin(users, eq(profiles.userId, users.id))
      .where(eq(profiles.handle, handle))
      .limit(1);
    return row ?? null;
  },
  // 複数 userId を 1 クエリで取得 (enrichMany の N+1 回避用)。
  async findByUserIds(
    db: DB,
    userIds: string[],
  ): Promise<StoredProfileWithUser[]> {
    if (userIds.length === 0) return [];
    return db
      .select({ profile: profiles, user: users })
      .from(profiles)
      .innerJoin(users, eq(profiles.userId, users.id))
      .where(inArray(profiles.userId, userIds));
  },
  // 複数 handle をまとめて解決 (mention の @handle → userId 解決用)。
  async findByHandles(
    db: DB,
    handles: string[],
  ): Promise<StoredProfileWithUser[]> {
    if (handles.length === 0) return [];
    return db
      .select({ profile: profiles, user: users })
      .from(profiles)
      .innerJoin(users, eq(profiles.userId, users.id))
      .where(inArray(profiles.handle, handles));
  },
  // handle だけ更新 (name は users 側で管理)。
  async updateHandle(
    db: DB,
    userId: string,
    handle: string,
  ): Promise<ProfileRow | null> {
    const [row] = await db
      .update(profiles)
      .set({ handle })
      .where(eq(profiles.userId, userId))
      .returning();
    return row ?? null;
  },
  // name (users 側) を更新する helper。auth ドメインを触るので profile 側の権限とセットで扱う。
  async updateUserName(
    db: DB,
    userId: string,
    name: string,
  ): Promise<void> {
    await db.update(users).set({ name }).where(eq(users.id, userId));
  },
};
