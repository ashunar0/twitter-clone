import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import type { DB } from "../../../server/lib/db";
import { profiles } from "../../profiles/server/table";
import {
  users,
  accounts,
  sessions,
  verifications,
} from "./table";

// better-auth 設定 factory。db instance が per-request なので factory 化する。
// 各 request の Hono handler で `getAuth(db)` を呼ぶ。
// - email/password のみ (OAuth は次スライス)
// - modelName で複数形テーブル名に合わせる
// - signup 時に databaseHooks で profiles row を default handle 付きで自動作成
export function getAuth(db: DB, opts?: { secret?: string; baseURL?: string }) {
  return betterAuth({
    secret: opts?.secret,
    baseURL: opts?.baseURL,
    database: drizzleAdapter(db, {
      provider: "sqlite",
      // usePlural=true の時 schema key も複数形にする (better-auth の drizzle adapter 仕様)。
      schema: {
        users,
        accounts,
        sessions,
        verifications,
      },
      usePlural: true,
    }),
    // dev では Vite (5173) → proxy → server (8787) なので Origin が baseURL と乖離する。
    // prod は Cloudflare Workers subdomain。全部信頼リストに入れる。
    trustedOrigins: [
      "http://localhost:5173",
      "http://localhost:8787",
      "https://twitter-clone.asahi-gaia1530.workers.dev",
    ],
    emailAndPassword: {
      enabled: true,
      // demo なので verification をスキップ (signup 即使える)。
      requireEmailVerification: false,
    },
    databaseHooks: {
      user: {
        create: {
          after: async (user) => {
            // signup 直後に profiles を default handle 付きで自動作成する。
            // "features/users は features/profiles の repository を read/write してよい"
            // …は規約上厳密には NG だが、auth ドメインが profile 1 個を生む onboarding step
            // として例外的に許容 (規約 doc に記載)。
            await db
              .insert(profiles)
              .values({ userId: user.id, handle: defaultHandleFor(user.email) })
              .onConflictDoNothing();
          },
        },
      },
    },
  });
}

// email prefix + 数字 suffix で default handle を作る (3〜15 文字、a-z/0-9/_ のみ)。
// signup 後に本人が /u/@me から edit すること想定。
function defaultHandleFor(email: string): string {
  const prefix =
    (email.split("@")[0] ?? "user").replace(/[^a-zA-Z0-9_]/g, "").slice(0, 10) || "user";
  const suffix = Math.floor(Math.random() * 100000)
    .toString()
    .padStart(5, "0");
  return `${prefix}${suffix}`.slice(0, 15);
}

// better-auth の型を re-export (Session 型を middleware から使う)。
export type Auth = ReturnType<typeof getAuth>;
