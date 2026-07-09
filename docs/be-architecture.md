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

## 未確定 (次スライスで検証)

- **error shape の統一** — zValidator 失敗時の 400 response 形、HTTPException の status 使い分けはまだ観察していない。バリデーション失敗を意図的に踏むスライス (validation UI テスト、必須欠落 UX) で確定
- **cursor pagination の型と実装** — tweets list は latest 50 固定、cursor 未実装。feed が伸びたスライスで導入

## 検証済み (実装で確定)

| 論点 | 決着 | 検証したスライス |
|---|---|---|
| create の service 引数 | `service.create(input, currentUserId)` (入力 vs context 分離) | #4b tweets create |
| zod validation の layer | route 入口で `zValidator("json", schema)` を chain 内に | #4b tweets create |
| create response の形 | 作成 entity 単体を 201。cross-domain 合成は list に任せる | #4b tweets create |
| id 生成 | server 側で `crypto.randomUUID()` | #4b tweets create |
| read の cross-domain 合成 | service が別 feature の repository を read enrichment に使う | #4a tweets list |
| write の cross-domain orchestration | `usecases/<verb><Entity>.ts` で 1 ファイル 1 関数、他 feature service 呼び出し許可 | #16 followUser |
| 冪等 write + side effect | `.onConflictDoNothing().returning(...)` の length で新規判定、新規時のみ side effect 発火 | #16 followUser |
| business rule の帰属 | service は low-level、rule (self-follow 禁止等) は usecase の `HTTPException` で | #16 followUser |
| side effect entity のライフサイクル | 関係 entity と別 (follow 削除でも通知履歴は残す)、cascade は関係 entity のみ | #16 follows/notifications |
