import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { eq } from "drizzle-orm";
import type { DB } from "../../../server/infra/db";
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
    // signup 時に client から handle を受け取る。better-auth の additionalFields は
    // users テーブルに列を足すことを前提とするが、うちは handle を profiles 側に隔離したいので使わない。
    // 代わりに databaseHooks の ctx.body から handle を直接読んで profiles に書き込む。
    databaseHooks: {
      user: {
        create: {
          // signup 前に handle format + 重複を潰す。最終防衛線は profiles.handle の UNIQUE 制約。
          // NOTE: "features/users は profiles を read してよい" は規約上厳密には NG だが、
          // onboarding step として例外的に許容 (規約 doc 記載)。
          before: async (user, ctx) => {
            const handle = readHandle(ctx);
            if (!handle) {
              throw new APIError("BAD_REQUEST", { message: "handle is required" });
            }
            const existing = await db
              .select({ userId: profiles.userId })
              .from(profiles)
              .where(eq(profiles.handle, handle))
              .get();
            if (existing) {
              throw new APIError("BAD_REQUEST", { message: "handle is already taken" });
            }
            return { data: user };
          },
          // signup 直後に profiles を入力 handle で作成する。UNIQUE 衝突 (TOCTOU) は catch して user を巻き戻す。
          after: async (user, ctx) => {
            const handle = readHandle(ctx);
            if (!handle) return;
            try {
              await db.insert(profiles).values({ userId: user.id, handle });
            } catch {
              // 直前 before check と UNIQUE 制約の間で race したら、既作成の users row を消してエラー。
              await db.delete(users).where(eq(users.id, user.id));
              throw new APIError("BAD_REQUEST", { message: "handle is already taken" });
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
