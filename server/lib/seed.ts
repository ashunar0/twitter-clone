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

  // cursor pagination の検証用ダミー tweet (40 件、id を zero-pad して DESC ソート安定に)。
  // 全件同じ current_timestamp で入る想定 → (createdAt, id) の id tie-breaker を実地で叩く。
  const dummy = Array.from({ length: 40 }, (_, i) => {
    const idx = String(i).padStart(3, "0");
    const author = i % 3 === 0 ? "u2" : SEED_USER_ID;
    return {
      id: `td${idx}`,
      authorId: author,
      body: `dummy tweet #${idx} — pagination test なのだ`,
    };
  });
  await db.insert(tweets).values(dummy).onConflictDoNothing();

  console.log("seed OK");
}

seed().then(() => process.exit(0));
