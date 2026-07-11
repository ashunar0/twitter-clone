import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { eq } from "drizzle-orm";
import type { DB } from "./db";
import { profiles } from "../../features/profiles/server/table";
import {
  users,
  accounts,
  sessions,
  verifications,
} from "../../features/users/server/table";

// signup 時に auth が features 側に丸投げする side effect の抽象。
// - ensureHandleAvailable: 使えなければ throw (auth は理由を問わずそのまま bubble する)
// - onUserCreated: profile 作成など。throw したら auth が users row を巻き戻す
// composition root (server/app.ts など) で features 側の実装を注入する。
export type OnboardingHooks = {
  ensureHandleAvailable: (db: DB, handle: string) => Promise<void>;
  onUserCreated: (db: DB, userId: string, handle: string) => Promise<void>;
};

// better-auth 設定 factory。db instance が per-request なので factory 化する。
// - email/password のみ (OAuth は次スライス)
// - modelName で複数形テーブル名に合わせる
// - signup 時 databaseHooks は onboarding hooks を呼ぶだけ (profiles を直接触らない)
export function getAuth(
  db: DB,
  opts: { onboarding: OnboardingHooks; secret?: string; baseURL?: string },
) {
  return betterAuth({
    secret: opts.secret,
    baseURL: opts.baseURL,
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
    // handle は better-auth の additionalFields (users 列前提) に載せず ctx.body から拾う。
    // profiles テーブルへの書き込みは opts.onboarding に完全委譲する (features 越境を root で wire)。
    databaseHooks: {
      user: {
        create: {
          before: async (user, ctx) => {
            const handle = readHandle(ctx);
            if (!handle) {
              throw new APIError("BAD_REQUEST", { message: "handle is required" });
            }
            await opts.onboarding.ensureHandleAvailable(db, handle);
            return { data: user };
          },
          after: async (user, ctx) => {
            const handle = readHandle(ctx);
            if (!handle) return;
            try {
              await opts.onboarding.onUserCreated(db, user.id, handle);
            } catch (err) {
              // onboarding が転けたら既作成の users row を巻き戻す (compensating tx)。
              await db.delete(users).where(eq(users.id, user.id));
              throw err;
            }
          },
        },
      },
    },
  });
}

// databaseHooks ctx.body から handle を安全に取り出す。format は handleSchema と揃えた最小 check のみ。
function readHandle(ctx: unknown): string | null {
  const body = (ctx as { body?: unknown } | undefined)?.body;
  const handle = (body as { handle?: unknown } | undefined)?.handle;
  if (typeof handle !== "string") return null;
  if (!/^[a-zA-Z0-9_]{3,15}$/.test(handle)) return null;
  return handle;
}

// better-auth の型を re-export (Session 型を middleware から使う)。
export type Auth = ReturnType<typeof getAuth>;
