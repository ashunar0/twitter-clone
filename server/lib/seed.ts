import { db } from "./db";
import { users } from "../../features/users/server/table";
import { tweets } from "../../features/tweets/server/table";
import { SEED_USER_ID } from "./currentUser";

// 開発用の初期データ投入。冪等 (onConflictDoNothing) で繰り返し実行安全。
async function seed() {
  await db
    .insert(users)
    .values([
      {
        id: SEED_USER_ID,
        handle: "asahi",
        name: "Asahi",
        avatarUrl: null,
      },
      {
        id: "u2",
        handle: "zundamon",
        name: "ずんだもん",
        avatarUrl: null,
      },
    ])
    .onConflictDoNothing();

  await db
    .insert(tweets)
    .values([
      { id: "t1", authorId: SEED_USER_ID, body: "はじめてのつぶやきなのだ。" },
      { id: "t2", authorId: "u2", body: "ぼくもいるのだ。" },
      { id: "t3", authorId: SEED_USER_ID, body: "アーキテクチャ検証中。" },
    ])
    .onConflictDoNothing();

  console.log("seed OK");
}

seed().then(() => process.exit(0));
