import { db } from "./db";
import { users } from "../../features/users/server/table";
import { SEED_USER_ID } from "./currentUser";

// 開発用の初期データ投入。冪等 (onConflictDoNothing) で繰り返し実行安全。
async function seed() {
  await db
    .insert(users)
    .values({
      id: SEED_USER_ID,
      handle: "asahi",
      name: "Asahi",
      avatarUrl: null,
    })
    .onConflictDoNothing();
  console.log(`seed OK (SEED_USER_ID=${SEED_USER_ID})`);
}

seed().then(() => process.exit(0));
