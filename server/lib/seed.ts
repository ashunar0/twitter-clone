import { eq } from "drizzle-orm";
import { createNodeDb } from "./db-node";
import { getAuth } from "../../features/users/server/auth";
import { profiles } from "../../features/profiles/server/table";
import { tweets } from "../../features/tweets/server/table";
import {
  accounts,
  sessions,
  users,
  verifications,
} from "../../features/users/server/table";
import { notifications } from "../../features/notifications/server/table";
import { likes } from "../../features/likes/server/table";
import { follows } from "../../features/follows/server/table";

// 開発用の初期データ投入。auth ドメインを better-auth 経由で作るため、REST API を叩かず
// getAuth(db).api.signUpEmail を internal 呼び出しする。冪等ではなく、毎回 wipe → 再構築する。
async function seed() {
  const db = createNodeDb();
  const auth = getAuth(db);

  // wipe: 依存順に消す (child → parent)。
  await db.delete(notifications);
  await db.delete(likes);
  await db.delete(follows);
  await db.delete(tweets);
  await db.delete(profiles);
  await db.delete(sessions);
  await db.delete(accounts);
  await db.delete(verifications);
  await db.delete(users);

  // signup: better-auth の internal API 経由。databaseHooks で profiles も同時に auto-create される。
  const asahi = await auth.api.signUpEmail({
    body: {
      email: "asahi@example.com",
      password: "password1",
      name: "Asahi",
    },
  });
  const zundamon = await auth.api.signUpEmail({
    body: {
      email: "zundamon@example.com",
      password: "password1",
      name: "ずんだもん",
    },
  });

  // default handle (random suffix) を分かりやすい値に固定。
  await db
    .update(profiles)
    .set({ handle: "asahi" })
    .where(eq(profiles.userId, asahi.user.id));
  await db
    .update(profiles)
    .set({ handle: "zundamon" })
    .where(eq(profiles.userId, zundamon.user.id));

  // tweets: 起点となる 3 件 + cursor 検証用ダミー 40 件。
  await db.insert(tweets).values([
    { id: "t1", authorId: asahi.user.id, body: "はじめてのつぶやきなのだ。" },
    { id: "t2", authorId: zundamon.user.id, body: "@asahi ぼくもいるのだ。" },
    { id: "t3", authorId: asahi.user.id, body: "@zundamon アーキテクチャ検証中。" },
  ]);

  const dummy = Array.from({ length: 40 }, (_, i) => {
    const idx = String(i).padStart(3, "0");
    const author = i % 3 === 0 ? zundamon.user.id : asahi.user.id;
    return {
      id: `td${idx}`,
      authorId: author,
      body: `dummy tweet #${idx} — pagination test なのだ`,
    };
  });
  await db.insert(tweets).values(dummy);

  console.log(`seed OK (asahi=${asahi.user.id}, zundamon=${zundamon.user.id})`);
}

seed().then(() => process.exit(0));
