# BE アーキテクチャ規約 (v0、WIP)

**目的:** Hono + Drizzle + zod で feature 単位に垂直スライスを積む時のレール。実装から抽出したルールのみ、机上論は入れない。

**参照:** [hono-feature-add skill](../../.claude/skills/hono-feature-add/) — このプロジェクトの BE 実装は skill のルールに従う。差分は本ドキュメントで明示する。

---

## 3 層 (route → service → repository → db)

```
features/<domain>/server/
  ├─ table.ts          ← Drizzle テーブル定義 (schema)
  ├─ repository.ts     ← Drizzle 薄ラッパ (DB access)
  ├─ service.ts        ← 業務ロジック + wire 変換 + enrichment
  └─ index.ts          ← Hono sub-app (route 定義)
```

- **route** は service を呼ぶ、**service** は repository を呼ぶ、**repository** は Drizzle を呼ぶ
- 単方向 DAG。逆流禁止 (repository が service を呼ばない、etc)
- **service → 別 feature の service は禁止**。cross-feature の read が要る時は **別 feature の repository** を直接呼ぶ (詳細は「cross-domain」節)

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
  // list / create / update / delete も同様に薄く
};
```

- **`toWire` を挟むのは必須** — Drizzle の `$inferSelect` 型を直接 client に返さない (wire 契約を通す)
- **enrichment** (join 相当の後処理) は **`enrichMany`** で 1 クエリ + Map 変換して N+1 回避
  - 個別行ごとに他 feature の repository を叩かない

## Cross-domain の扱い

### 原則: cross-domain 合成は BE endpoint がやる

「Tweet + author」の合成が欲しい → **owning feature (tweets) の endpoint がまとめて返す** (read model)。

- FE で domain 型を合成する構造は原則作らない
- 合成 shape は **owning feature の schema.ts に wire 型として置く**、foreign データは inline object shape で書く (相手の型を import しない)

### 実装 pattern

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

### 硬い禁止

- **`features/<A>/type.ts` が `features/<B>/type.ts` を import しない**
- **service → 別 feature の service を呼ばない** (business rule が二重になる、DAG が崩れる)
- **repository → 別 feature の何かを呼ばない** (repository は自 feature の table しか触らない)

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

- **create/update の 引数分割 pattern** — `service.create(input, currentUserId)` か `service.create({ ...input, authorId })` か。tweets で確定させる
- **zod validation の layer** — sub-app の `zValidator` で入口で弾くか、service 内で parse するか。`hono/zod-validator` 導入時に確定
- **error shape の統一** — HTTPException どの status を何に使うか。tweets create でエラー系が出た時に確定
