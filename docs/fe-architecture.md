# FE アーキテクチャ規約 (v0、WIP)

**目的:** BE ([be-architecture.md](./be-architecture.md)) と同格の「AI 実装がブレないレール」を FE features/ 側に敷く。UI 側 (screens/widgets/shared) はレール化せず自由度を残す。

**環境:** Vite + React 19 + TanStack Router + TanStack Query + hisui-ui。Next.js 前提のパターン (SC / Server Actions / layout.tsx) は使わない。

## 大方針: 2 軸アーキテクチャ

**ロジック** と **UI** は違う軸で切る。

| 軸 | 対象 | 切り方 |
|---|---|---|
| ドメイン軸 | ロジック (BE + FE の server 対話) | `features/<domain>/{server, client, schema, type, lib}` |
| 画面/操作軸 | UI (表示、UX state、合成) | `src/{app, screens, widgets, shared}` |

**Why:** ロジックはデータフローの凝集で束になる (ドメイン)、UI は人の操作の凝集で束になる (画面)。1 軸で切ると必ず歪む。

---

## アンカー規則 (絶対に破らない)

1. **BE endpoint 呼び出しは `features/<domain>/client` 内でのみ書く**
   screens / widgets / component から `rpcClient` を直接呼ばない。
2. **`features/<A>/client` は `features/<B>/client` を import しない**
   ドメイン跨ぎのデータ shape は BE 側 endpoint で組んで返す (cross-domain read model)。
   例外: mutation 側から他 feature の queryKey factory の import は cross-domain invalidation 目的でのみ許可 (詳細後述)。
3. **`rpc.ts` は `queries.ts` / `mutations.ts` 以外から import 禁止**

---

## ファイル構造

```
features/<domain>/
  schema.ts       ← zod 定義 + z.infer 型 (Request / Response 両方)
  type.ts         ← domain の TS 型 (FE cache 型もここ)
  lib/            ← server/client 両用の pure 関数
  client/
    rpc.ts        ← transport (React 非依存 object literal)
    queries.ts    ← queryKey factory + useQuery hook
    mutations.ts  ← useMutation hook (optimistic pattern)
  server/         ← BE 側 (be-architecture.md 参照)
```

`lib/` を `<domain>/` 直下に置く理由: pure fn は BE でも FE でも invariant 検証や派生値計算に使える可能性があるから、どちら側にも寄せない。

---

## client/ の書き方

### rpc.ts — transport 層

```ts
import { rpcClient } from "@/lib/hono/client";
import type { TweetsListResponseWire, TweetWire, CreateTweetWire } from "../schema";

export const tweetsRpc = {
  // GET /api/tweets — 直近 tweets + author summary を取得。
  async list(): Promise<TweetsListResponseWire> {
    const res = await rpcClient.api.tweets.$get();
    if (!res.ok) throw new Error("failed to fetch tweets");
    return (await res.json()) as TweetsListResponseWire;
  },
  // POST /api/tweets — current user 名義で 1 件作成。
  async create(input: CreateTweetWire): Promise<TweetWire> {
    const res = await rpcClient.api.tweets.$post({ json: input });
    if (!res.ok) throw new Error("failed to create tweet");
    return (await res.json()) as TweetWire;
  },
};
```

- **React 非依存**。hook でも component でも呼べる純関数の集合
- 形は object literal (`export const <domain>Rpc = { ... }`)
- `rpcClient.api.<resource>.$method(...)` を薄く包むだけ
- `!res.ok` → throw、成功時は wire 型で返す
- **やらない**: cache 触る / 派生値計算 / React hooks / UI state

### queries.ts — server state cache 層

```ts
import { useQuery } from "@tanstack/react-query";
import type { TweetsData } from "../type";
import { tweetsRpc } from "./rpc";

/** queryKey factory — mutation 側の invalidation / optimistic 更新から参照する為 export 必須。 */
export const tweetsKeys = {
  all: ["tweets"] as const,
  lists: () => [...tweetsKeys.all, "list"] as const,
  list: () => [...tweetsKeys.lists()] as const,
} as const;

// public timeline を取得。
export function useTweetsQuery() {
  return useQuery<TweetsData>({
    queryKey: tweetsKeys.list(),
    queryFn: () => tweetsRpc.list(),
  });
}
```

- **queryKey は factory 関数で export 必須** (mutation 側の invalidation / optimistic で参照する)
- wire→domain 変換 helper (`snapshotToCache` 等) が必要な時はここに置く
- hook 命名: 下記「命名詳細」参照
- **やらない**: mutation / rpc 直書き / component

### mutations.ts — server state 更新層

```ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Tweet, TweetsData } from "../type";
import type { CreateTweetWire } from "../schema";
import type { User } from "@features/users/type";
import { tweetsRpc } from "./rpc";
import { tweetsKeys } from "./queries";

type MutationContext = { snapshot: TweetsData | undefined };

// 新規 tweet を作成、optimistic に cache 先頭へ挿入する。
// 成功時に server 応答で差し替え、失敗時は snapshot に巻き戻す。
export function useCreateTweetMutation(currentUser: User) {
  const queryClient = useQueryClient();
  const listKey = tweetsKeys.list();

  return useMutation<Tweet, Error, CreateTweetWire, MutationContext>({
    mutationFn: (input) => tweetsRpc.create(input),
    onMutate: async (input) => { /* snapshot + optimistic 挿入 */ },
    onError: (_e, _v, ctx) => { /* rollback */ },
    onSuccess: (created) => { /* server 応答で差し替え */ },
  });
}
```

- **scope を決める params は hook 引数** (`currentUser`)
- **mutation vars は mutationFn の引数** (`input`)
- optimistic pattern: `onMutate` snapshot → `onError` rollback → `onSuccess` reconcile
- invalidation / setQueryData は `queries.ts` の queryKey factory を import して使う
- **やらない**: UI state / navigation / form 状態

### hook 命名詳細

#### Query hook (queries.ts)

- **標準**: `use<Thing>Query`
- **Scope 付き**: `use<Scope><Thing>Query` (`useCurrentUserQuery`, `useMonthEventsQuery`)
- **Thing の単複**: 対象データの shape で選ぶ — list なら複数形 (`useTweetsQuery`)、単体なら単数 (`useUserQuery`)
- **例外 (hydration 系)**: `use<Thing>From<Source>` — loader 由来の初期化を伴う hook

#### Mutation hook (mutations.ts)

- **標準**: `use<Verb><Thing>Mutation`
- **verb 統一辞書:**

| verb | 意味 | 例 |
|---|---|---|
| Create | 新規作成のみ | `useCreateTweetMutation` |
| Save | upsert / create-or-update / merge 保存 | `useSaveProfileMutation` |
| Update | 既存の部分更新 (patch) | `useUpdateXxxMutation` |
| Delete | 削除 (rpc の remove/destroy と食い違っても mutation は Delete に統一) | `useDeleteTweetMutation` |
| Toggle | on/off 切替 | `useToggleLikeMutation` |
| Send | 発信・送信 | `useSendMessageMutation` |
| Mark | フラグ更新 (既読等) | `useMarkAsReadMutation` |
| Submit | フォーム submit 系 | `useSubmitSignupMutation` |

- **例外 (verb+thing 結合)**: 単一動作を表す時は verb だけで OK
  - `useLoginMutation`, `useSignupMutation`, `useLogoutMutation`
  - 補足: verb 単体で意味が閉じてる場合のみ

#### helper 関数 (queries.ts / mutations.ts / lib 内)

- **`use` で始めない** (hook じゃない事を明示)
- **wire → domain 変換**: `<wire>To<domain>` — `snapshotToCache`
- **domain 内 pure 計算**: 動詞から始める — `applyLikeToggle`, `buildReplyTree`

#### rpc.ts のメソッド名

- **object literal のメソッド名は verb 主体で短く**: `list`, `create`, `remove`, `update`, `toggleLike`
- mutation との verb 揃えは強制しない (rpc の `remove` と mutation の `Delete` は許容)

### segment 依存グラフ

```
rpc.ts       ← queries.ts / mutations.ts のみ
queries.ts   ← rpc.ts, lib
mutations.ts ← rpc.ts, queries.ts (queryKey factory のみ), lib
```

外 (screens/widgets/component) は `queries.ts` と `mutations.ts` の hook しか触らない。

---

## 型命名規約

### schema.ts (wire = zod で定義)

- **必ず `<X>Wire` (or `<X>Request` / `<X>Response`) 接尾辞** — 今プロジェクトは `Wire` 系採用
- Request も Response も zod で定義、`z.infer` で型 export
- Response が wire==domain な時も接尾辞は保つ (レール硬さ優先)

```ts
export const createTweetWireSchema = z.object({ body: z.string().min(1).max(280) });
export type CreateTweetWire = z.infer<typeof createTweetWireSchema>;

export const tweetWireSchema = z.object({ id: z.string(), authorId: z.string(), body: z.string(), createdAt: z.string() });
export type TweetWire = z.infer<typeof tweetWireSchema>;

export const tweetsListResponseSchema = z.object({
  tweets: z.array(tweetWireSchema),
  authorSummaries: z.record(z.string(), authorSummarySchema),
});
export type TweetsListResponseWire = z.infer<typeof tweetsListResponseSchema>;
```

### type.ts (domain)

- **命名: 無印 `<X>` (単体) or `<X>Data` (cache/集合)**
- wire==domain な時は `type <X> = <X>Wire` alias で置く (schema.ts で Wire 定義は必ず書く)
- 内部部品型 (`LikeState` 等) も主役と併記、ファイル分けない

```ts
import type { TweetWire, TweetsListResponseWire } from "./schema";
export type Tweet = TweetWire; // wire==domain のとき alias
export type TweetsData = TweetsListResponseWire; // cache 型

// wire と shape が違う時は独立定義:
// export type LikeState = { counts: Record<string, number>; mine: Set<string> };
```

### 判定基準 (二択)

- BE と話す型 → `schema.ts`
- それ以外 → `type.ts`

---

## 層境界と import ルール

**縦関係 (UI 層):**
```
src/app/         (TanStack Router のルート定義、Vite entry)
  ↓
src/screens/     (画面固有 UI + 合成)
  ↓
src/widgets/     (跨ぎ画面 UI 部品)
  ↓
src/shared/      (UI primitive、hisui-ui 生成先)

features/<domain>/   (ドメイン層、UI とは独立軸)
```

**大原則:**
- UI 層は上→下のみ import 可
- UI 層 → features は OK (widgets 以上は features/{client, schema, type, lib} を自由に触れる)
- features → UI 層は絶対禁止

**具体ルール (仮運用中):**

1. **screens ↔ screens 相互 import 禁止** — 共通化欲求は widgets へ上げる
2. **widgets ↔ widgets 相互 import 禁止 (フラット構造)** — 共通化欲求は shared or features へ
3. **shared → features 禁止 (硬い)** — primitive を domain-agnostic に保つ。domain 依存 UI は widgets へ
4. **shared → src/screens, src/widgets 禁止** (逆依存)
5. **features → src/{screens, widgets, shared} 禁止** (逆依存)
6. **`features/<domain>/client/rpc.ts` は同 features 内の queries.ts / mutations.ts 以外から import 禁止**
7. **`features/<A>/client` は `features/<B>/client` を import しない** (features 間 client 依存禁止)
   - **例外 (Query key invalidation)**: `features/<A>/client/mutations.ts` は `features/<B>/client/queries.ts` の queryKey factory (`<B>Keys`) を **invalidation 目的でのみ** import 可。hook / rpc / 変換関数の import は禁止のまま
8. **widgets → features/client hook 呼び出しは OK** — widget は「data fetch を含めて跨ぎ画面で自己完結する UI」

**import 可否マトリックス:**

| from ↓ / to → | src/app | screens | widgets | shared | features/client | features/{schema,type,lib} | features/server, rpc |
|---|---|---|---|---|---|---|---|
| **src/app** | - | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **screens** | ❌ | ❌※1 | ✅ | ✅ | ✅ | ✅ | ❌ |
| **widgets** | ❌ | ❌ | ❌※2 | ✅ | ✅ | ✅ | ❌ |
| **shared** | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **features/{client,lib}** | ❌ | ❌ | ❌ | ❌ | features 間禁止 (例外あり) | 同 domain 内のみ ✅ | rpc は同 features 内のみ |

※1 共通化は widgets へ / ※2 共通化は shared or features へ

---

## view-model hook の帰属 (仮運用中)

「domain 操作」と「UX orchestration」で層を分ける。

### features/<domain>/client の hook = 純粋な domain 操作
- server と話す (query / mutation)
- 付随する軽い timing / invalidation の味付けは吸収可 (`MIN_LOADING_MS` 等)
- `useState` / `useEffect` を持たない
- 「別画面で流用しても同じ意味になる」

### UI 層 (widgets/ui or screens/ui) の hook = UX orchestration
- modal 開閉、form flow、wizard
- `useState` / `useEffect` で UX state 管理
- localStorage / URL / DOM / focus 等の browser 事情
- 特定画面/widget の文脈でしか成立しない
- **内部で features/client の hook を叩く**

### 判定基準 (上から順、いずれか YES なら UI 側)

1. `useState` を持つか？
2. `useEffect` を持つか？
3. localStorage / URL / DOM / focus に触るか？
4. 特定画面/widget の文脈でしか意味を成さないか？

全て NO → features/client。

**簡易テスト:** 「別の画面で流用したくなるか？」YES → features/client、NO → UI 側

### Grey zone の初期方針

| 論点 | 位置 |
|---|---|
| form validation state (error 表示、submit disable) | UI 側 (useForm と同層) |
| optimistic update | features/client mutations.ts (cache 一貫性は domain 側の責務) |
| debounce / retry policy | features/client (server interaction policy は domain 側) |
| fetch → form initial state (edit-profile 等) | UI 側 view-model、内部で query hook を叩く |
| mutation に紐づいた UX 味付け (MIN_LOADING_MS 等) | features/client で吸収可、複雑化したら UI 側へ引き上げ |

---

## Query key 規約

TanStack Query 公式推奨の Hierarchical + Query Key Factory pattern に準拠。

### 形式

```
[domain, kind, ...args]
```

- **domain**: features フォルダ名と一致させる (`tweets`, `users`, `notifications` 等)
- **kind**: データ種類 (英語 kebab-case、下記の統一辞書から選ぶ)
- **args**: identifier / filter (位置引数)

### kind 統一辞書 (全 domain で同じ意味に同じ語)

| kind | 意味 | 例 |
|---|---|---|
| `list` | 一覧 | `["tweets", "list"]` |
| `detail` | 単体詳細 | `["users", "detail", id]` |
| `me` | 自分固有 single | `["users", "me"]` |
| `by-<axis>` | 軸で lookup | `["users", "by-handle", name]` |
| `<verb-noun>` | 集約/派生 | `["notifications", "unread-count"]` |

### factory の形 (object literal + self-reference)

```ts
export const tweetsKeys = {
  all: ["tweets"] as const,
  lists: () => [...tweetsKeys.all, "list"] as const,
  list: () => [...tweetsKeys.lists()] as const,
  details: () => [...tweetsKeys.all, "detail"] as const,
  detail: (id: string) => [...tweetsKeys.details(), id] as const,
} as const;
```

- **命名**: `<domain>Keys` (複数形の keys)
- **`all` は必ず用意** — root prefix、full invalidate 用
- **中間 (`lists`, `details`) は parametrized 版を書くなら必ず用意** — kind 単位 invalidate 用

### 配置

- queries.ts 冒頭に export (別ファイルに切らない)
- mutations.ts / 呼び出し側は factory を import して使う

### mutation invalidation の書き方

```ts
queryClient.invalidateQueries({ queryKey: tweetsKeys.all });         // 全消し
queryClient.invalidateQueries({ queryKey: tweetsKeys.lists() });     // list 系全部
queryClient.invalidateQueries({ queryKey: tweetsKeys.list() });      // 特定 list
```

### 禁止事項

- **生の `["tweets", ...]` を直書き禁止** — 必ず factory 経由 (typo 検知失敗を防ぐ)

---

## Route loader 規約 (TanStack Router)

TanStack Router の `loader` option で initial data を先読みできる。Next.js の SC loader / Server Actions とは違い、**FE 側 (browser) で走る** (SSR していない前提)。

### 配置と命名

- **配置**: `src/screens/<slice>/loader.ts` (route file に直書きせず slice 直下に切る)
- **命名**: `load<Slice>()` (例: `loadProfileDetail`)
- **返り値**: **常に object で wrap して返す** (将来 field 追加時の breaking change を避ける)
- **型 export**: `type <Slice>LoaderData = Awaited<ReturnType<typeof load<Slice>>>`

```ts
// src/screens/profile-detail/loader.ts
import type { QueryClient } from "@tanstack/react-query";
import { userByHandleOptions } from "@features/users/client/queries";
import { tweetsListOptions } from "@features/tweets/client/queries";

// prefetch 対象を集約。route loader 内で queryClient.ensureQueryData を叩く。
export async function loadProfileDetail(
  queryClient: QueryClient,
  handle: string,
) {
  const [user, tweets] = await Promise.all([
    queryClient.ensureQueryData(userByHandleOptions(handle)),
    queryClient.ensureQueryData(tweetsListOptions()),
  ]);
  return { user, tweets };
}
export type ProfileDetailLoaderData = Awaited<ReturnType<typeof loadProfileDetail>>;
```

```ts
// src/app/routes/profile.$handle.tsx
import { createFileRoute } from "@tanstack/react-router";
import { loadProfileDetail } from "@/screens/profile-detail/loader";
import { ProfileDetailScreen } from "@/screens/profile-detail/ui/ProfileDetailScreen";

export const Route = createFileRoute("/profile/$handle")({
  loader: ({ context: { queryClient }, params: { handle } }) =>
    loadProfileDetail(queryClient, handle),
  component: ProfileDetailScreen,
});
```

`context: { queryClient }` は `src/app/main.tsx` の `createRouter({ context: { queryClient } })` で注入している (実装済)。

### 依存ルール

- **loader は features/*/client (rpc / queryOptions) のみ import 可** — server code は禁止
- **loader 内でやってよい事**: rpc 経由の fetch、queryClient への prefetch、Zod parse、param 整形
- **loader 内でやってはいけない事**: 副作用 (mutation) — mutation は component から呼ぶ
- **route file から features/server 直呼び禁止** — FE ランタイムに BE のコードを持ち込まない

### 縦線: `src/app/routes/*.tsx → screens/<slice>/loader.ts → features/<domain>/client`

- route file は 5〜10 行、loader を挿すだけ + component を挿すだけ
- screens 側にロジックが集まる

### Next.js layout.tsx 相当

TanStack Router の parent route (`__root.tsx` / `_layout.tsx`) が担当。shell 用の slice (`src/screens/<name>-shell/`) を切って parent route の loader / component に使う。

### 1 rpc 直呼びの時も loader を切るか？

- **切らない**: TanStack Router では loader を挿さなくても component 内の `useQuery` で十分機能する (Suspense や初期 spinner 許容ならこれで OK)
- **切る**: navigation 中に fetch を先読みして「表示 = ready」を保証したい時 (Next.js の SC loader と近い体感)
- 判断: **列挙表示画面 (timeline / list)** は component 内 useQuery で開始、**detail 遷移 (profile 詳細等)** で navigation 中の待ちを消したければ loader 切る、が実務目安。#4a はこれで useQuery 始まり (loader なし)

---

## Domain 跨ぎ shape の帰属

### アンカー: cross-domain composition は BE endpoint がやる

「Tweet + author」の合成データが欲しい → BE endpoint がまとめて返す (read model)。**FE で domain 型を合成する構造は原則作らない**。

理由: データ加工は BE の得意領域。FE features/type.ts を domain-pure に保てる、cache invalidation の依存関係が endpoint 経由で明示化される。

### 硬い禁止

- **`features/<A>/type.ts` が `features/<B>/type.ts` を import しない** — domain type は各 domain 内で self-contained

### 種類 1: endpoint が返す合成 shape (read model)

**owning feature の schema.ts に wire 型として置く。foreign domain データは inline object で書く (User / Profile 全体を import しない)。**

```ts
// features/tweets/schema.ts
export const authorSummarySchema = z.object({
  handle: z.string(),
  name: z.string(),
  avatarUrl: z.string().nullable(),
});
export const tweetsListResponseSchema = z.object({
  tweets: z.array(tweetWireSchema),
  authorSummaries: z.record(z.string(), authorSummarySchema),  // ← inline、User 型を引かない
});
export type TweetsListResponseWire = z.infer<typeof tweetsListResponseSchema>;
```

- owning feature = endpoint URL のドメイン (`GET /tweets` → tweets)
- foreign データを inline で書く時は **小さい object shape のみ**、User 全体は絶対 import しない

### 種類 2: FE で合成が必要な時 (endpoint に頼れない時)

順に検討:

1. **Inline compose** — component / view-model hook 内で `{ tweet, author }` を作る、型名すら付けない
2. **Composition site 型** — 再利用したいなら screens/<slice>/type.ts or view-model hook 内 local type に置く
3. **BE endpoint に統合** — 複数画面で必要なら BE endpoint 側に read model として育てる

### BE 側 cross-domain の扱い (参考)

| 種類 | BE パターン |
|---|---|
| **read** の cross-domain (denormalized read model) | owning feature の service が別 feature の repository を read enrichment に使う |
| **write** の cross-domain (副作用、複数 service orchestration) | **usecase 層**で foreign feature の service を経由 |

詳細は [be-architecture.md](./be-architecture.md) 参照。

### shared / monorepo packages は使わない

- 「features 跨ぎで純粋な domain 型を共有したい」場面は BE endpoint 側の read model で済ませる
- どうしても要ったら `src/shared/` に primitive を置くのは可、当面は避ける
- monorepo packages 化は over-engineering、solo project 規模では不要

---

## 実装から観測したメモ (随時更新)

- **#4a 時点の cross-domain read model**: `tweetsListResponseSchema` の `authorSummaries: z.record(...)` inline で綺麗に嵌まった。FE 側は `data.authorSummaries[tweet.authorId]` の lookup で消費。User 型を tweets 側に一切 import しなくて済んだ
- **#4b 時点の optimistic pattern**: `useMutation` の hook 引数に scope (currentUser)、mutationFn 引数に mutation vars (input) を分離するパターンで綺麗に書けた。`onMutate` で snapshot → cache 先頭に optimistic entry 挿入 → `onError` rollback → `onSuccess` で optimistic を server 応答で差し替え、が典型フロー
- **観察予定**: wire==domain な段階では `type <X> = <X>Wire` alias で足りている。Set / Map 変換が必要になる場面 (like / reaction / notification 既読等) でどこが曲がるかを確認したい
- **観察予定**: 現状 loader を 1 つも切っていない (timeline は component 内 useQuery で開始)。detail 系ページを追加した時に「loader ありなし」でどっちが素直か検証したい

---

## AI 実装が踏みがちな失敗 pattern

- **api と model を混ぜる** — loader.ts に "matches 計算" を含めがち。segment を明示するプロンプトが必要
- **架空の共有制約を持ち出して過剰設計する** — 「これは 2 screens で共有される」と根拠なく主張して widgets 層を発動する。**確認 (grep) の前に構造判断を下さない**
- **rpc.ts の返り値型を無視して cast する** — `as TweetsListResponseWire` の cast で終わらず、schema.parse を挟むべきかどうかは validation の効き所を見て判断する
