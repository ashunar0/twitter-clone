# BE アーキテクチャ規約 (v0、WIP)

**目的:** Hono + Drizzle + zod で feature 単位に垂直スライスを積む時のレール。実装から抽出したルールのみ、机上論は入れない。

**参照:** [hono-feature-add skill](../../.claude/skills/hono-feature-add/) — このプロジェクトの BE 実装は skill のルールに従う。差分は本ドキュメントで明示する。

---

## 3 層 + usecase (route → [usecase →] service → repository → db)

```
features/<domain>/server/
  ├─ table.ts          ← Drizzle テーブル定義 (schema)
  ├─ repository.ts     ← Drizzle 薄ラッパ (DB access)
  ├─ service.ts        ← 業務ロジック + wire 変換 + enrichment
  ├─ usecases/         ← cross-feature orchestration (関数 1 個につき 1 ファイル)
  │  └─ <verb><Entity>.ts
  └─ index.ts          ← Hono sub-app (route 定義)
```

- **route** は service (単一 feature 内で完結する時) または usecase (cross-feature orchestration が要る時) を呼ぶ
- **service** は自 feature の repository と、read enrichment 目的で **別 feature の repository** を呼ぶ
- **repository** は自 feature の Drizzle table のみ触る
- 単方向 DAG。逆流禁止

**Clean / Onion Architecture の Application Service (Interactor) 層に相当。**

## サブ app のルール (hono-feature 準拠、絶対に破らない)

1. **命名**: `const <plural> = new Hono<{ Variables: AuthVariables }>()`、`export default <plural>`
   - `usersRoutes` / `userRoutes` / `app` 禁止 — plural そのままの変数名
2. **routes は 1 本の chain**: `new Hono(...).use(...).get(...).post(...)`
   - `<plural>.get(...); <plural>.post(...);` と分けて書くと **RPC 型推論が壊れる** (Hono の `hc<AppType>()` が空 client になる)
3. **mount は `server/app.ts` の chain 内**: `app.route("/api/<plural>", <plural>)`
   - AppType が routes 型を蓄積するため、`server/app.ts` 内でも chain 維持

## DB schema の置き場所

- **`features/<domain>/server/table.ts`** に Drizzle テーブル定義
  - feature root の `schema.ts` は wire=zod で予約済のため名前衝突を避ける
- **`server/lib/schema.ts`** で全 feature の table を re-export
  - drizzle-kit の schema 引数を 1 ファイル指定で済ませる
  - **relative import 必須** — drizzle-kit は tsconfig paths を解決しない
- migrations は **`drizzle/` at root**、drizzle-kit で生成

**手順:**
```
1. features/<domain>/server/table.ts で sqliteTable(...) 追加
2. server/lib/schema.ts に export * from ... 追記
3. pnpm db:generate  → drizzle/NNNN_*.sql が生成
4. pnpm db:migrate   → 適用
```

## Wire / Domain 型の分離

`features/<domain>/schema.ts` (wire、zod):
```ts
export const <entity>WireSchema = z.object({ ... });
export type <Entity>Wire = z.infer<typeof <entity>WireSchema>;

// server が自動 set する field を落とした create 用。
export const create<Entity>WireSchema = <entity>WireSchema.omit({
  id: true,
  createdAt: true,
  // authorId 等の "current user から埋める" field も omit
});
export type Create<Entity>Wire = z.infer<typeof create<Entity>WireSchema>;
```

`features/<domain>/type.ts` (domain):
```ts
// wire == domain な段階では alias で置く
export type <Entity> = <Entity>Wire;
```

**判断基準 (二択):**
- BE と話す型 → `schema.ts`
- それ以外 (FE cache 型など) → `type.ts`

## service の書き方

```ts
// DB row → wire 形への変換 helper。service 内 or lib へ。
function toWire(row: StoredEntity): Entity {
  return { ... };
}

export const <plural>Service = {
  // <一言コメント>
  async getById(id: string): Promise<Entity | null> {
    const row = await <plural>Repository.findById(id);
    return row ? toWire(row) : null;
  },
  // create / update は「入力 (wire)」と「context (currentUserId 等)」を分離した引数で受ける。
  async create(input: CreateEntityWire, currentUserId: string): Promise<Entity> {
    const row = await <plural>Repository.insert({
      id: crypto.randomUUID(),
      ...input,
      authorId: currentUserId,   // server 自動 set の field
    });
    return toWire(row);
  },
};
```

- **`toWire` を挟むのは必須** — Drizzle の `$inferSelect` 型を直接 client に返さない (wire 契約を通す)
- **enrichment** (join 相当の後処理) は **`enrichMany`** で 1 クエリ + Map 変換して N+1 回避
  - 個別行ごとに他 feature の repository を叩かない
- **id 生成**: `crypto.randomUUID()` を server 側で採番 (Node / Cloudflare Workers 両対応)
- **create/update の引数**: `service.create(input, currentUserId)` — 入力とコンテキストを分離。route 側で `c.get("currentUser").id` を渡す
- **create の response**: 作成した entity 単体を 201 で返す。cross-domain 合成 (author summary 等) は list endpoint に任せる — create response には混ぜない

## Route の書き方

```ts
const <plural> = new Hono<{ Variables: AuthVariables }>()
  // GET は auth 不要なら withCurrentUser を外してよい (public read)。
  .get("/", async (c) => { ... })
  // 書き込み系は auth + zValidator を chain 内で束ねる。
  .post(
    "/",
    withCurrentUser,
    zValidator("json", create<Entity>WireSchema),
    async (c) => {
      const input = c.req.valid("json");
      const currentUser = c.get("currentUser");
      const entity = await <plural>Service.create(input, currentUser.id);
      return c.json(entity, 201);
    },
  );
```

- **zod validation は route 入口で弾く** — `@hono/zod-validator` の `zValidator("json", schema)` を chain 内に置く
  - service 内で `schema.parse()` はしない (責務分離、error shape も route 側で統一)
- **status code**: create 成功 = **201**、list = 200、削除成功 = 204 (未実装)
- **auth と validator は同じ chain 内**: `.post("/", withCurrentUser, zValidator(...), handler)` — 順序も意味あり (auth 先、validator 後、handler 最後)

## Cross-feature access ルール

| パターン | 手段 | 例 |
|---|---|---|
| **Read enrichment** (join 相当の後付け) | service → 別 feature の **repository** | tweets list に author summary を混ぜる |
| **Write orchestration** (副作用複数 feature 跨ぎ) | route → **usecase** → 複数 service | tweet 作成時に notification も発火 |
| **単一 feature 完結** の read / write | route → 自 feature の service | 通常はこれ |

**硬い禁止:**
- **service → 別 feature の service** — 必要になったら usecase 層を作る
- **`features/<A>/type.ts` が `features/<B>/type.ts` を import しない** — cross-domain 合成 shape は owning feature の `schema.ts` に inline object で書く
- **repository → 別 feature の何か** — repository は自 feature の table しか触らない

### Read enrichment pattern (BE endpoint が cross-domain 合成)

「Tweet + author」の合成が欲しい → **owning feature (tweets) の endpoint がまとめて返す** (read model)。FE で domain 型を合成する構造は原則作らない。

`features/tweets/server/service.ts` の list:
```ts
async list(): Promise<TweetsListWire> {
  const rows = await tweetsRepository.findRecent();
  // 別 feature の "repository" を read-only で使う (service → service は禁止)
  const authorIds = [...new Set(rows.map((r) => r.authorId))];
  const authors = await usersRepository.findByIds(authorIds);
  const authorMap = new Map(authors.map((a) => [a.id, a]));

  return {
    tweets: rows.map(toWire),
    authorSummaries: Object.fromEntries(
      authorIds.map((id) => [id, {
        handle: authorMap.get(id)?.handle ?? "",
        name: authorMap.get(id)?.name ?? "",
        avatarUrl: authorMap.get(id)?.avatarUrl ?? null,
      }]),
    ),
  };
}
```

### Usecase pattern (write orchestration)

複数 feature の service を叩く write 処理は、owning feature の `server/usecases/` に **関数 1 個 = ファイル 1 個**で書く。

配置と命名:
```
features/<owner>/server/usecases/
  └─ <verb><Entity>.ts    ← ファイル名 == 関数名 (camelCase)
```

**#16 で実装した実例** (features/follows/server/usecases/followUser.ts):
```ts
import { HTTPException } from "hono/http-exception";
import { followsService } from "../service";
import { notificationsService } from "../../../notifications/server/service";

// follow を追加し、新規なら followee 宛に "follow" 通知を発火する。
export async function followUser(
  currentUserId: string,
  followeeId: string,
): Promise<void> {
  if (currentUserId === followeeId) {
    throw new HTTPException(400, { message: "cannot follow yourself" });
  }
  const created = await followsService.follow(currentUserId, followeeId);
  // 冪等: 既に follow 済みなら通知を再作成しない。
  if (created) {
    await notificationsService.record({
      kind: "follow",
      recipientId: followeeId,
      actorId: currentUserId,
    });
  }
}
```

route 側 (features/follows/server/index.ts):
```ts
.post("/", zValidator("json", createFollowWireSchema), async (c) => {
  const { followeeId } = c.req.valid("json");
  const currentUser = c.get("currentUser");
  await followUser(currentUser.id, followeeId);
  return c.json({ ok: true }, 201);
})
```

- **ファイル 1 個 = 関数 1 個**、export はデフォルトでなく named
- ファイル名 (`followUser.ts`) と関数名 (`followUser`) を必ず一致させる
- **usecase は他 feature の service を import してよい** (このためだけの層)
- **service は他 feature の service を import しない** — orchestration が要る時は usecase を切る
- **route は service か usecase のどちらかを呼ぶ**、両方は混ぜない (責務が曖昧になる)
- **business rule は usecase に置く** — self-follow 禁止のような制約はここで `HTTPException` を投げる (service は low-level に保つ)

### 冪等 write orchestration パターン

「重複投入は無視しつつ、新規時だけ side effect (通知等) を打つ」を実現するために、repository / service で **新規作成されたか** を返す:

```ts
// features/follows/server/repository.ts
async insert(followerId: string, followeeId: string): Promise<boolean> {
  const result = await db
    .insert(follows)
    .values({ followerId, followeeId })
    .onConflictDoNothing()
    .returning({ followerId: follows.followerId });
  return result.length > 0;   // ← 新規時のみ true
}

// features/follows/server/service.ts
async follow(followerId: string, followeeId: string): Promise<boolean> {
  return followsRepository.insert(followerId, followeeId);
}

// features/follows/server/usecases/followUser.ts
const created = await followsService.follow(currentUserId, followeeId);
if (created) await notificationsService.record({...});   // ← 新規時だけ
```

- `.onConflictDoNothing().returning(...)` — SQLite / PG 共通で機能
- 「複数回 POST しても副作用は 1 回」を保証、client 側の retry / double-click に強い
- delete 系は逆に「存在しなくても 204」で冪等、副作用なし → usecase 不要 (route → service 直呼び)

### 副作用のライフサイクル分離

follow を外しても notification は消えない (通知履歴は残す)。
「関係 entity」と「side effect entity (通知履歴)」は別ライフサイクル、**cascade は関係 entity にだけ効かせる** (follows table の `onDelete: "cascade"` は users まで)。

### 判断フロー

```
このロジックは cross-feature の副作用を伴う？
  ├─ Yes → usecase
  └─ No  → service (単一 feature 完結)

このロジックは他 feature の read が要る？
  ├─ Yes (join 的) → service が他 feature の repository を read
  └─ 他 feature の service が要る？ → 上と同じで usecase
```

## Mock auth の pattern

- **`server/lib/currentUser.ts` に隔離**
  - `AuthVariables` 型 + `withCurrentUser` middleware + `SEED_USER_ID` 定数
- サブ app は `new Hono<{ Variables: AuthVariables }>().use("*", withCurrentUser)` で受ける
- route handler は `c.get("currentUser")` で参照
- **本物 auth に差し替える時はこの 1 ファイルの書き換えで済むように保つ** — 他所で `SEED_USER_ID` や `currentUser` の構造を直接触らない

## RPC 境界 (FE への型 export)

- **`server/app.ts`** で Hono app を chain 完成 → `export type AppType = typeof routes` で FE に露出
- **`server/app.ts` は runtime 非依存** — Node API (`process.env` 等) を書かない
- Node 起動用の `process.env.PORT` 等は **`server/index.ts`** に隔離
- FE tsconfig の include は **`server/app.ts` のみ**

## Seed script

- **`server/lib/seed.ts`** に開発用初期データを 1 ファイルにまとめる
- **冪等** (`onConflictDoNothing` 等) — 繰り返し実行して壊れない
- 追加 feature ができたら **同ファイルに書き足す** (feature ごとに seed ファイル分けない、まず 1 箇所で保つ)
- `pnpm db:seed` で実行

## Comment style

- **関数 / endpoint の定義直上に 1 行コメント**
  - 20〜50 文字目安、「〜する」で終わる形が読みやすい
- Endpoint の場合は method + path も書く: `// GET /api/users/me — mock auth 済みの current user を返す。`
- 型 alias / schema 定義 / 定数はコメント不要 (名前で伝わる)
- 副作用や順序に依存がある場合は、追加で **なぜ** その順序かを書く

## Naming 辞書 (BE 側)

| 概念 | 名前 |
|---|---|
| Hono sub-app 変数 | `<plural>` (`users`, `tweets`) |
| Repository export | `<plural>Repository` |
| Service export | `<plural>Service` |
| Drizzle table | `<plural>` |
| DB row 型 | `StoredEntity` / `<Entity>Row` |
| Wire→domain 変換 | `toWire` (service 内 private) |
| Auth middleware | `withCurrentUser` |

## Cursor pagination パターン

list endpoint を **1 page 分だけ返す + `nextCursor` を付与**する形に統一。cursor は server 側で **opaque token** (`base64url(createdAt|id)`) に閉じて、FE には string としてしか運ばない。

### 検証で確定した規則

- **cursor は複合キー必須**: `(createdAt, id)` の tuple で seek する。SQLite の `current_timestamp` は秒精度なので単独 `createdAt <` だと同秒内で重複/欠落が出る (seed 40 件同秒で実証済み)
- **SQL は tuple 比較を or/and に展開**: Drizzle は row-value 未対応、`or(lt(createdAt, c.createdAt), and(eq(createdAt, c.createdAt), lt(id, c.id)))` で書く
- **order も複合**: `orderBy(desc(createdAt), desc(id))` — cursor と揃える
- **page size は server hardcode** (`TWEETS_PAGE_SIZE = 20`) — client 指定は受けない
- **cursor helper は Node / Cloudflare Workers 両対応**: `btoa`/`atob` + URL-safe 変換で書く (Buffer 禁止)
- **cursor 破損 = 400**: route で `decodeTweetCursor` が `null` を返したら `ApiError.validationFailed({ cursor: "invalid cursor" })`
- **nextCursor の判定**: `rows.length === PAGE_SIZE && last` なら next あり、そうでなければ null (境界ぴったりで終わる corner case は次 fetch が空返しで自然に閉じる)

## 統一 Error shape

全 endpoint が同じ shape で 4xx / 5xx を返す。`server/lib/errors.ts` の `ApiError` と `app.onError` (グローバルハンドラ) で reshape する。

### shape

```ts
type ApiErrorBody = {
  code:
    | "validation_failed"    // 400: zod / 入力形式 NG
    | "conflict"             // 409: 重複 / business rule 違反
    | "not_found"            // 404: resource 不在
    | "forbidden"            // 403: 認可不足 (未使用)
    | "internal";            // 500: 未処理
  message: string;                 // 人間向け 1 行 (toast にそのまま)
  fields?: Record<string, string>; // validation_failed / conflict の時、field 名 → メッセージ
};
```

### 使い分け (route / usecase / service から throw)

- `ApiError.validationFailed(fields, message?)` — 400、複数フィールド OK
- `ApiError.conflict(message, fields?)` — 409、handle 重複 / self-follow など。fields は field 起因なら付ける
- `ApiError.notFound(message)` — 404
- `ApiError.forbidden(message)` — 403

### zValidator は wrapper 経由

`server/lib/zv.ts` で `@hono/zod-validator` を wrap、失敗時に自動で `ApiError.validationFailed(fields)` に変換する。route 側は `zv("json", schema)` を書くだけで validation_failed shape が保証される。

- zod issue の `path` を `.` join で 1 key に、`message` を値に格納
- issue が複数フィールドに跨がれば `fields` の複数 key として返る (`{ name: "...", handle: "..." }`)
- **既存の `zValidator` 直呼びは禁止** — 全て `zv` 経由

### グローバルハンドラ (`apiErrorHandler`)

`app.onError(apiErrorHandler)` で登録:
- `ApiError` → その body / status
- `HTTPException` → status から code を推定して reshape (Hono 内部 exception の互換用)
- それ以外 (Error) → `code: "internal"`, 500

### FE 側 (`src/lib/hono/apiError.ts`)

同じ shape を FE 側でも `ApiError` class として持ち、rpc 層の `throwIfNotOk(res)` が `!res.ok` 時に body を parse して throw する。**全 rpc.ts は `throwIfNotOk` 経由**、`throw new Error("failed to ...")` は禁止。

### handle / name などの入力 schema は BE/FE 共有

`features/<domain>/schema.ts` に `handleSchema`, `nameSchema` のような **field 単位の共有 schema** を切り、BE の validation と FE の client-side check で同じ regex/制約を使う。message も同じ (BE/FE で乖離しない、UX 一貫)。

## Cloudflare Workers 対応 (request-scoped DB)

Node singleton パターンから **request-scoped な db 注入**に移行した (Cloudflare Workers の Isolate モデル対応)。

### 変更点

- **`db.ts` は type だけ**: `export type DB = BaseSQLiteDatabase<"async", unknown>` — libSQL / D1 どちらも継承する共通 base
- **runtime は entry 分離**: `db-node.ts` (`@libsql/client`), `db-worker.ts` (`drizzle-orm/d1`)。app.ts はどちらも import しない (Workers bundle への Node 依存混入回避)
- **`withDb(resolver)` middleware**: `c.set("db", resolver(c))`。resolver は entry file (`server/index.ts` / `server/worker.ts`) が組む
- **app.ts は builder function**: `buildRoutes(dbMiddleware)` に切り出し、entry file から呼び出す
- **全 repository / service / usecase の signature に `db: DB` を第一引数追加**
  - repository: `usersRepository.findById(db, id)`
  - service: `profilesService.updateMe(db, currentUserId, input)`
  - usecase: `createTweet(db, input, currentUserId)`
- **route は `const db = c.get("db")` を掴んで下流に渡す**

### なぜ signature 明示 (`db` を第一引数) にしたか

- **依存が可視化される**: どの関数が DB を触るか signature で分かる (AsyncLocalStorage 等の暗黙注入と対比)
- **test 時に mock DB を渡しやすい**: 引数なので差し替え自由
- **Cloudflare Workers の実装型に自然**: env binding を per-request で流す設計と噛み合う
- コストとしては全 signature に 1 引数追加、変更点が広いが機械的

### D1 との差分で気付いた点

- `.returning()` は D1 でも動く (SQLite compatible)
- `crypto.randomUUID()` は Workers でも Node でも同名で使える (共通)
- migration SQL は SQLite 互換なので **drizzle-kit の生成物をそのまま `wrangler d1 migrations apply`** に流せる
- `wrangler d1 execute --file` で seed SQL を流せる (seed.ts は Node 専用のまま残置)
- Workers bundle は `@libsql/client` を pull しない構成に分離する必要がある (`db-node.ts` / `db-worker.ts` の物理分離)

### Static assets との同 origin 配信

`wrangler.jsonc` の `assets` binding で FE を配信する時、`/api/*` にも SPA fallback が効いてしまうので **`run_worker_first: ["/api/*"]`** で Worker を先に走らせる。設定漏れると /api が index.html を返す。

## Auth 実装 (better-auth) と users/profiles 分割

mock auth (SEED_USER_ID 固定) から **better-auth** による本物 auth に切り替え。同時に `users` を **auth テーブル (better-auth 管理)** と **profiles (public identity)** に split。

### なぜ split したか (業界標準の話)

- **merged 派**: 早期 SaaS / MVP は 1 テーブルで OK
- **split 派**: Twitter/Instagram 規模は分離が主流
  - password hash や MFA secret を public 表示テーブルと物理分離 (漏洩時 blast radius 抑制)
  - profile がリッチ化 (bio, cover, verified 等) しても auth を汚さない
  - cache 戦略が異なる (profile は CDN、auth は絶対キャッシュしない)
- better-auth 自体が `user` + `account` を分ける設計思想
- twitter-clone は Twitter 規模を模す前提なので split を選択

### テーブル構成

```
users (better-auth 管理、features/users/server/table.ts)
├─ id, email UNIQUE, emailVerified, name, image, createdAt/updatedAt
accounts (credential/OAuth リンク、password hash はここ)
├─ id, accountId, providerId, userId FK, password, ...
sessions (cookie session)
├─ id, expiresAt, token, userId FK, ...
verifications (email verification / reset token)

profiles (our domain、features/profiles/server/table.ts)
├─ userId PK/FK (1:1 with users), handle UNIQUE, createdAt
```

- `usePlural: true` で better-auth 側の default 単数名を複数形に上書き
- FK 参照 (tweets.author_id 等) は `users.id` 継続 (relation は無傷)

### feature 分割 (A: features/users = auth / features/profiles = identity)

- **features/users/** = auth ドメイン
  - `server/table.ts`: users + accounts + sessions + verifications
  - `server/auth.ts`: `getAuth(db)` で better-auth instance を返す factory
  - `server/index.ts`: `/api/auth/*` の handler を丸ごと mount
  - `client/auth-client.ts`: `createAuthClient` + `useSession` / `signIn` / `signUp` を re-export
- **features/profiles/** = identity ドメイン
  - `server/table.ts`: profiles
  - `server/repository.ts`: profile+user JOIN で取り出す `StoredProfileWithUser`
  - tweets/notifications の enrichment は `profilesRepository.findByUserIds` を叩く
- **feature 名 vs URL の乖離**: `features/users` を `/api/auth` に mount している (better-auth の default basePath に合わせるため)。auth は "システム関心" なので domain 名と URL 名が食い違うのは許容

### signup 時の profile auto-create

better-auth の `databaseHooks.user.create.after` で profile を default handle (email prefix + random suffix) 付きで自動 insert。auth ドメインが profile 1 個を生む onboarding step として例外的に許容 (規約 doc 記載)。

### session cookie と Cloudflare Workers

- `BETTER_AUTH_SECRET` を Cloudflare secret で管理 (`wrangler secret put`)
- `wrangler.jsonc` に `"compatibility_flags": ["nodejs_compat"]` — better-auth が `node:crypto` を使うため必須
- `trustedOrigins` に dev/prod 両方の URL を列挙 (Vite proxy 経由の "Invalid origin" 対策)
- `withCurrentUser` middleware は `getAuth(db, {secret: c.env.BETTER_AUTH_SECRET}).api.getSession(...)` で cookie から session 抽出
- 未認証は `ApiError.forbidden` を throw (401 相当は forbidden で寄せる、規約 5 種類を膨らませない)

### mock 隔離の意義が証明された

mock 時代の `withCurrentUser` (SEED_USER_ID 固定) → 本物 auth 切り替え時に **他 feature の handler 側は変更ゼロ**。全ての feature route が `c.get("currentUser")` を読むだけ、なので中身が mock だろうと better-auth session だろうと consumer には無影響。**mock 隔離規約の payoff がここで払拭された**。

### FE 側 auth guard

`__root.tsx` の `useEffect` で `session.isPending === false` かつ `!session.data` なら `/signin` へ redirect。`/signin` / `/signup` は public path として除外。

## Mention 実装 (associated table + dedupe 通知)

Twitter の `@handle` mention は tweet の attribute として **owning feature (tweets) に associated table を併置**する形で実装。

### テーブル配置

```
features/tweets/server/
├─ table.ts          ← tweets + mentions (両方 export、同 feature が複数 table を持つ)
├─ repository.ts     ← tweetsRepository + mentionsRepository (同ファイルに併置)
```

- **1 feature = 1 aggregate**: 複数 table が同一 aggregate を成す時は同 feature に併置する (mentions は tweet の attribute)
- **repository も同ファイル**: `tweetsRepository` と `mentionsRepository` を repository.ts に並置。分離するのは別 aggregate になった時 (今回は YAGNI で 1 ファイル)
- **mentions PK は複合**: `(tweetId, mentionedUserId)`、両 FK cascade。同 tweet 内の同 handle 重複は 1 行に丸める (insertMany + onConflictDoNothing で冪等)
- **業界標準**: Twitter/Instagram も mention は dedicated table を持つ (mention 一覧 endpoint / 検索 index のため)。parse-on-write (body だけ持って抽出は都度) は MVP 向け

### mention 抽出と cross-feature 解決

- **regex は BE/FE 揃える**: `/(?<![a-zA-Z0-9_])@([a-zA-Z0-9_]{3,15})(?![a-zA-Z0-9_])/g` — handleSchema と同じ 3〜15 [a-zA-Z0-9_] 制約
  - **BE**: `features/tweets/server/usecases/createTweet.ts` で抽出 → mentions insert
  - **FE**: `widgets/tweet-item/TweetItem.tsx` で抽出 → `<Link>` 装飾
  - regex 定義は物理的に別ファイルだが、正体は「handle の形」なので handleSchema と乖離しない (handle schema 変更時は 2 箇所を揃えて直す)
- **handle → userId 解決は cross-feature read**: `profilesRepository.findByHandles(db, handles)` を usecase から叩く (service→service 禁止、usecase→他 feature の repository read は OK)
- **実在しない handle は無視**: mention 抽出結果を `findByHandles` の返り row 数と照合、resolve できたものだけ insert / notify。tweet 自体は成立させる (throw しない)

### 通知の dedupe (reply と mention の重複回避)

reply かつ本文で @parent-author を明示的に呼んだ場合、**reply 通知だけ発火し mention 通知はスキップ**。

```ts
// features/tweets/server/usecases/createTweet.ts (要点)
if (parentAuthorId && parentAuthorId !== currentUserId) {
  await notificationsService.record(db, { kind: "reply", recipientId: parentAuthorId, ... });
}
for (const uid of mentionedUserIds) {
  if (uid === currentUserId) continue;       // self-mention skip
  if (uid === parentAuthorId) continue;      // reply 通知と重複するので skip
  await notificationsService.record(db, { kind: "mention", recipientId: uid, ... });
}
```

- **dedupe の帰属**: 「reply も mention も同じ actor が同じ recipient に打つ」重複回避 = **usecase 層**が判断すべき (rule は service に置かない規約)
- **順序**: reply 先に発火 → mention はスキップ判定、の順で書く (逆にすると mention 先に打って reply でまた打つ二重発火が起きる)
- Twitter も reply 通知優先で mention は打たない
- **重要: `mentions` row と `notifications` row は独立**。reply 内の `@parent-author` は notification は dedupe されるが `mentions` row は insert する。structural fact (この tweet が誰を参照するか) は残す、push signal (通知) だけ抑制する分離。将来「mention された tweet 一覧」endpoint を作る時に reply も含む必要があるため。follow を外しても通知履歴が残るのと同じ「関係 entity と side effect entity のライフサイクル分離」規約の適用例

## 未確定 (次スライスで検証)

なし (Media upload、Retweet、UI トンマナ / 記事化 が Tier A に残っている)

## 検証済み (実装で確定)

| 論点 | 決着 | 検証したスライス |
|---|---|---|
| create の service 引数 | `service.create(input, currentUserId)` (入力 vs context 分離) | #4b tweets create |
| zod validation の layer | route 入口で `zv("json", schema)` を chain 内に (`server/lib/zv.ts` 経由、失敗時 ApiError に自動変換) | #4b tweets create / updateProfile |
| create response の形 | 作成 entity 単体を 201。cross-domain 合成は list に任せる | #4b tweets create |
| id 生成 | server 側で `crypto.randomUUID()` | #4b tweets create |
| read の cross-domain 合成 | service が別 feature の repository を read enrichment に使う | #4a tweets list |
| write の cross-domain orchestration | `usecases/<verb><Entity>.ts` で 1 ファイル 1 関数、他 feature service 呼び出し許可 | #16 followUser |
| 冪等 write + side effect | `.onConflictDoNothing().returning(...)` の length で新規判定、新規時のみ side effect 発火 | #16 followUser |
| business rule の帰属 | service は low-level、rule (self-follow 禁止等) は usecase の `ApiError` で | #16 followUser |
| side effect entity のライフサイクル | 関係 entity と別 (follow 削除でも通知履歴は残す)、cascade は関係 entity のみ | #16 follows/notifications |
| self-ref FK (reply の parent) | `text().references((): AnySQLiteColumn => tweets.id)` で型注釈経由、cascade は初期 CREATE 時のみ効く (ALTER TABLE は制限あり) | tweets reply |
| cursor pagination | opaque `base64url(createdAt\|id)`、tuple 比較を or/and 展開、page size は server hardcode | tweets cursor |
| 統一 error shape | `{code, message, fields?}` bare、`ApiError` + `apiErrorHandler` + `zv` wrapper で全 endpoint 揃える。BE/FE で `handleSchema` などを共有 | updateProfile |
| request-scoped DB | `db.ts` は type only、Node/Workers factory を entry で選択。全 repository/service/usecase の signature に `db: DB` 第一引数を追加。app.ts は builder 化。static assets と同 origin 配信は `run_worker_first: ["/api/*"]` | Cloudflare Workers deploy |
| Auth 本実装 + users/profiles split | better-auth (email/password) + `usePlural: true` + `databaseHooks` で profile auto-create。features/users = auth、features/profiles = identity に分離。`nodejs_compat` + `BETTER_AUTH_SECRET` (Cloudflare secret) + `trustedOrigins` で Workers 動作 | better-auth 導入 |
| associated table (1 feature に複数 table) | owning feature (aggregate) の table.ts / repository.ts に併置。mentions は tweets 内。分離するのは別 aggregate になった時 | mention |
| 通知の dedupe (reply × mention) | usecase 層で reply 通知先を先に確定 → mention list からその userId (と self) を除外して発火。順序は reply 先に | mention |
