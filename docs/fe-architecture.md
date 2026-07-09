# FE アーキテクチャ規約 (v2 実験、WIP)

**branch:** `refactor/fe-architecture-v2` (from dev)
**開始:** 2026-07-05
**目的:** BE ([hono-feature-pattern](../features)) と同格の「AI 実装がブレないレール」を FE features/ 側に敷く。UI 側 (screens/widgets/shared) はレール化せず自由度を残す。

## 大方針: 2 軸アーキテクチャ

**ロジック** と **UI** は違う軸で切る。

| 軸 | 対象 | 切り方 |
|---|---|---|
| ドメイン軸 | ロジック (BE + FE の server 対話) | `features/<domain>/{server,client,schema,type,lib}` |
| 画面/操作軸 | UI (表示、UX state、合成) | `src/{screens,widgets,shared}/ui/` |

**Why:** ロジックはデータフローの凝集で束になる (ドメイン)、UI は人の操作の凝集で束になる (画面)。1 軸で切ると必ず歪む。

**Why not FSD 純正:** `screens/*/api` に mutation を置くと同じドメインの mutation が複数 screens に散り cohesion が壊れる (v1 実験で観測)。

---

## アンカー規則 (絶対に破らない)

1. **BE endpoint 呼び出しは `features/<domain>/client` 内でのみ書く**
   screens / widgets / component から rpc / fetch を直接呼ばない。
2. **`features/<A>/client` は `features/<B>/client` を import しない**
   ドメイン跨ぎのデータ shape は BE 側 endpoint で組んで返す。
3. **`rpc.ts` は `queries.ts` / `mutations.ts` 以外から import 禁止**

---

## ファイル構造

```
features/<domain>/
  schema.ts       ← zod 定義 + z.infer 型 (Request / Response 両方)
  type.ts         ← domain の TS 型
  client/
    rpc.ts        ← transport (React 非依存 object literal)
    queries.ts    ← "use client"、queryKey factory 必須
    mutations.ts  ← "use client"、optimistic pattern
  server/         ← BE 側 (既存の hono-feature-pattern に従う)
  lib/            ← server/client 両用の pure 関数
```

`lib/` を `<domain>/` 直下に置く理由: pure fn は BE でも FE でも invariant 検証や派生値計算に使える可能性があるから、どちら側にも寄せない。

---

## client/ の書き方

### rpc.ts — transport 層

```ts
import { rpcClient } from "@/lib/hono/client";
import type { CommentsListResponse, CommentResponse } from "../schema";

export const commentsRpc = {
  async list(profileId: string): Promise<CommentsListResponse> {
    const res = await rpcClient.api.v2.comments.$get({ query: { profileId } });
    if (!res.ok) throw new Error("failed to fetch comments");
    return (await res.json()) as CommentsListResponse;
  },
  // create, remove, ...
};
```

- **React 非依存**。hook でも component でも呼べる純関数の集合
- 形は object literal (`export const <domain>Rpc = { ... }`)
- `rpcClient.api.v2.<resource>.$method(...)` を薄く包むだけ
- `!res.ok` → throw、成功時は wire 型で返す
- **やらない**: cache 触る / 派生値計算 / React hooks / UI state

### queries.ts — server state cache 層

```ts
"use client";
import { useQuery } from "@tanstack/react-query";

/** invalidation 側からも参照するため export 必須。 */
export const commentsKey = (profileId: string) => ["comments", profileId] as const;

/** wire → domain 変換 helper。ここに置く。 */
export function snapshotToCache(res: CommentsListResponse): CommentsData { ... }

export function useCommentsQuery(profileId: string) {
  return useQuery({ queryKey: commentsKey(profileId), queryFn: () => ... });
}
```

- 先頭に `"use client"`
- **queryKey は factory 関数で export 必須** (mutation 側の invalidation で参照する)
- wire→domain 変換 helper (`snapshotToCache` 等) はここに置く
- hook 命名: 下記「命名詳細」参照
- **やらない**: mutation / rpc 直書き / component

### mutations.ts — server state 更新層

```ts
"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { commentsKey } from "./queries";
import { commentsRpc } from "./rpc";

export function useSendCommentMutation({ profileId, myProfile }: Params) {
  const queryClient = useQueryClient();
  const key = commentsKey(profileId);

  return useMutation({
    mutationFn: async ({ body, parentId }: SendVars) => commentsRpc.create({ ... }),
    onMutate: async (vars) => {
      await queryClient.cancelQueries({ queryKey: key });
      const snapshot = queryClient.getQueryData<CommentsData>(key);
      queryClient.setQueryData<CommentsData>(key, (prev) => ...); // optimistic
      return { snapshot };
    },
    onError: (_e, _v, ctx) => { if (ctx?.snapshot) queryClient.setQueryData(key, ctx.snapshot); },
    onSuccess: (created) => { /* server 応答を反映 */ },
  });
}
```

- 先頭に `"use client"`
- 命名: 下記「命名詳細」参照
- **scope を決める params は hook 引数** (`{ profileId, myProfile }`)
- **mutation vars は mutationFn の引数**
- optimistic pattern: `onMutate` snapshot → `onError` rollback → `onSuccess` reconcile
- invalidation は `queries.ts` の queryKey factory を import して使う
- **やらない**: UI state / navigation / form 状態

### hook 命名詳細

#### Query hook (queries.ts)

- **標準**: `use<Thing>Query`
- **Scope 付き**: `use<Scope><Thing>Query` (`useMyProfileQuery`, `useMonthEventsQuery`, `useUnreadCountQuery`)
- **Thing の単複**: 対象データの shape で選ぶ — list なら複数形 (`useCommentsQuery`)、単体なら単数 (`useProfileQuery`)
- **例外 (hydration 系)**: `use<Thing>From<Source>` — SSR/snapshot 由来の初期化を伴う hook (`useCommentsFromSnapshot`)

#### Mutation hook (mutations.ts)

- **標準**: `use<Verb><Thing>Mutation`
- **verb 統一辞書:**

| verb | 意味 | 例 |
|---|---|---|
| Create | 新規作成のみ | `useCreatePostMutation` |
| Save | upsert / create-or-update / merge 保存 | `useSaveMyProfileMutation` |
| Update | 既存の部分更新 (patch) | `useUpdateXxxMutation` |
| Delete | 削除 (rpc の remove/destroy と食い違っても mutation は Delete に統一) | `useDeleteCommentMutation` |
| Toggle | on/off 切替 | `useToggleReactionMutation` |
| Send | 発信・送信 | `useSendCommentMutation`, `useSendAnnouncementMutation` |
| Mark | フラグ更新 (既読等) | `useMarkAsReadMutation` |
| Submit | フォーム submit 系 | `useSubmitSignupRequestMutation` |
| Approve / Reject | 承認/却下 (admin action) | `useApproveSignupRequestMutation` |

- **例外 (verb+thing 結合)**: 単一動作を表す時は verb だけで OK
  - `useLoginMutation`, `useSignupMutation`, `useSetupMutation`, `useForgotPasswordMutation`, `useResetPasswordMutation`, `useApplyMutation`
  - 補足: verb 単体で意味が閉じてる場合のみ (`login` = "log in a user")

#### helper 関数 (queries.ts / mutations.ts / lib 内)

- **`use` で始めない** (hook じゃない事を明示)
- **wire → domain 変換**: `<wire>To<domain>` — `snapshotToCache`
- **domain 内 pure 計算**: 動詞から始める — `applyReactionToggle`, `buildCommentTree`

#### rpc.ts のメソッド名

- **object literal のメソッド名は verb 主体で短く**: `list`, `create`, `remove`, `update`, `toggleXxx`
- mutation との verb 揃えは強制しない (rpc の `remove` と mutation の `Delete` は許容 — rpc は object 内メソッドとしての慣習優先)

### segment 依存グラフ

```
rpc.ts     ← queries.ts / mutations.ts のみ
queries.ts ← rpc.ts, lib
mutations.ts ← rpc.ts, queries.ts (queryKey factory のみ), lib
```

外 (screens/widgets/component) は `queries.ts` と `mutations.ts` の hook しか触らない。

---

## 型命名規約

### schema.ts (wire = zod で定義)

- **必ず `<X>Request` / `<X>Response` 接尾辞**
- Request も Response も zod で定義、`z.infer` で型 export
- Response が wire==domain な時も `Response` 接尾辞は保つ (レール硬さ優先)

```ts
export const createCommentRequestSchema = z.object({ body: z.string().min(1).max(1000) });
export type CreateCommentRequest = z.infer<typeof createCommentRequestSchema>;

export const commentResponseSchema = z.object({ id: z.string().uuid(), body: z.string(), ... });
export type CommentResponse = z.infer<typeof commentResponseSchema>;

export const commentsListResponseSchema = z.object({ comments: z.array(commentResponseSchema), ... });
export type CommentsListResponse = z.infer<typeof commentsListResponseSchema>;
```

### type.ts (domain)

- **命名: 無印 `<X>` (単体) or `<X>Data` (cache/集合)**
- wire==domain な時は `type <X> = <X>Response` alias で置く (schema.ts で Response 定義は必ず書く)
- 内部部品型 (`ReactionState` 等) も主役と併記、ファイル分けない

```ts
import type { CommentResponse } from "./schema";
export type Comment = CommentResponse; // wire==domain のとき alias

// cache 型 (Set 化等で wire と shape が違う)
export type ReactionState = { counts: Record<string, number>; mine: Set<string>; ... };
export type CommentsData = { comments: Comment[]; reactionState: ReactionState; ... };
```

### 判定基準 (二択)

- BE と話す型 → `schema.ts`
- それ以外 → `type.ts`

---

## 層境界と import ルール

**縦関係 (UI 層):**
```
app/                 (Next.js routing)
  ↓
src/screens/         (画面固有 UI + 合成)
  ↓
src/widgets/         (跨ぎ画面 UI 部品)
  ↓
src/shared/          (UI primitive)

features/<domain>/   (ドメイン層、UI とは独立軸)
```

**大原則:**
- UI 層は上→下のみ import 可
- UI 層 → features は OK (widgets 以上は features/{client, schema, type, lib} を自由に触れる)
- features → UI 層は絶対禁止

**具体ルール (仮運用中、ダメなら変える):**

1. **screens ↔ screens 相互 import 禁止** — 共通化欲求は widgets へ上げる
2. **widgets ↔ widgets 相互 import 禁止 (フラット構造)** — 共通化欲求は shared or features へ
3. **shared → features 禁止 (硬い)** — primitive を domain-agnostic に保つ。domain 依存 UI は widgets へ
4. **shared → src/screens, src/widgets 禁止** (逆依存)
5. **features → src/{screens, widgets, shared} 禁止** (逆依存)
6. **features/server は app/api の Hono adapter 経由でのみ触れる**
7. **features/<domain>/client/rpc.ts は同 features 内の queries.ts / mutations.ts 以外から import 禁止**
8. **features/<A>/client は features/<B>/client を import しない** (features 間 client 依存禁止)
   - **例外 (Query key invalidation)**: `features/<A>/client/mutations.ts` は `features/<B>/client/queries.ts` の queryKey factory (`<B>Keys`) を **invalidation 目的でのみ** import 可。hook / rpc / 変換関数の import は禁止のまま。cross-domain の cache 一貫性 (投稿 → profile 更新 等) は mutation 側に閉じ込める為
9. **widgets → features/client hook 呼び出しは OK** — widget は「data fetch を含めて跨ぎ画面で自己完結する UI」

**import 可否マトリックス:**

| from ↓ / to → | app | screens | widgets | shared | features/client | features/{schema,type,lib} | features/server, rpc |
|---|---|---|---|---|---|---|---|
| **app** | - | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ (Hono adapter 経由) |
| **screens** | ❌ | ❌※1 | ✅ | ✅ | ✅ | ✅ | ❌ |
| **widgets** | ❌ | ❌ | ❌※2 | ✅ | ✅ | ✅ | ❌ |
| **shared** | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **features/{client,lib}** | ❌ | ❌ | ❌ | ❌ | features 間禁止 | 同 domain 内のみ ✅ | rpc は同 features 内のみ |

※1 共通化は widgets へ / ※2 共通化は shared or features へ

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
- **内部で features/client の hook を叩く** (widget → features/client の許可規則を活用)

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

### 適用例 (現状コードのリファクタ方針)

- `features/posts/hooks/usePostForm` → `features/posts/client/mutations.ts` の `useCreatePostMutation` に統合、`hooks/` フォルダ廃止
- `features/posts/hooks/useDailyPrompt` → `src/widgets/daily-prompt/ui/useDailyPrompt.ts` に移動、内部で `useCreatePostMutation` を叩く

## Query key 規約

TanStack Query 公式推奨の Hierarchical + Query Key Factory pattern に準拠。

### 形式

```
[domain, kind, ...args]
```

- **domain**: features フォルダ名と一致させる (`comments`, `profiles`, `calendar` 等)
- **kind**: データ種類 (英語 kebab-case、下記の統一辞書から選ぶ)
- **args**: identifier / filter (位置引数)

### kind 統一辞書 (全 domain で同じ意味に同じ語)

| kind | 意味 | 例 |
|---|---|---|
| `list` | 一覧 | `["comments", "list", profileId]` |
| `detail` | 単体詳細 | `["profiles", "detail", id]` |
| `me` | 自分固有 single | `["profiles", "me"]` |
| `by-<axis>` | 軸で lookup | `["profiles", "by-nickname", name]` |
| `<verb-noun>` | 集約/派生 | `["notifications", "unread-count"]` |

### factory の形 (object literal + self-reference)

```ts
export const commentsKeys = {
  all: ["comments"] as const,
  lists: () => [...commentsKeys.all, "list"] as const,
  list: (profileId: string) => [...commentsKeys.lists(), profileId] as const,
  details: () => [...commentsKeys.all, "detail"] as const,
  detail: (id: string) => [...commentsKeys.details(), id] as const,
} as const;
```

- **命名**: `<domain>Keys` (複数形の keys)
- **`all` は必ず用意** — root prefix、full invalidate 用
- **中間 (`lists`, `details`) は parametrized 版を書くなら必ず用意** — kind 単位 invalidate 用
- 具体キーは `list(...)`, `detail(...)`, `me()` 等

### 配置

- queries.ts 冒頭に export (別ファイルに切らない)
- mutations.ts / 呼び出し側は factory を import して使う

### mutation invalidation の書き方

```ts
queryClient.invalidateQueries({ queryKey: commentsKeys.all });         // 全消し
queryClient.invalidateQueries({ queryKey: commentsKeys.lists() });     // list 系全部
queryClient.invalidateQueries({ queryKey: commentsKeys.list(profileId) }); // 特定 list
```

### 禁止事項

- **生の `["comments", ...]` を直書き禁止** — 必ず factory 経由 (typo 検知失敗を防ぐ)

### 現状 key の揃え方針 (v2 で実装時に対応)

| domain | before | after |
|---|---|---|
| comments | `["comments", profileId]` | `commentsKeys.list(profileId)` = `["comments", "list", profileId]` |
| calendar (events) | `["events", year, month]` | domain 名を `calendar` に揃え `calendarKeys.month(y, m)` = `["calendar", "month", y, m]` |
| notifications | 部分的に factory 化済 | `notificationsKeys.list()` / `.unreadCount()` に統一 |
| profiles | 部分的に factory 化済 | object literal 化、`byId` → `detail`、`nicknames` は独立 |
| signupRequests | `["signupRequests"]` | `signupRequestsKeys.list()` |

## SC loader 規約

Server Component が initial data を SSR で流し込む処理を loader として切り出す。Next.js に閉じないパターン (React Router / TanStack Router の loader 概念と互換)。

### 配置と命名

- **配置**: `src/screens/<slice>/loader.ts` (フォルダ切らず slice 直下、api/ フォルダは作らない)
- **命名**: `load<Slice>()` (例: `loadProfileDetail`)
- **返り値**: **常に object で wrap して返す** (将来 field 追加時の breaking change を避ける)
- **型 export**: `type <Slice>LoaderData = Awaited<ReturnType<typeof load<Slice>>>`

```ts
// src/screens/profile-detail/loader.ts
import { getProfileById } from "@/features/profiles/server/service";
import { listComments } from "@/features/comments/server/service";

export async function loadProfileDetail(id: string) {
  const [profile, comments] = await Promise.all([
    getProfileById(id),
    listComments({ profileId: id }),
  ]);
  return { profile, comments };
}
export type ProfileDetailLoaderData = Awaited<ReturnType<typeof loadProfileDetail>>;
```

```ts
// app/profile/[id]/page.tsx
import { loadProfileDetail } from "@/src/screens/profile-detail/loader";
import { ProfileDetailScreen } from "@/src/screens/profile-detail/ui/ProfileDetailScreen";

export default async function Page({ params }) {
  const data = await loadProfileDetail(params.id);
  return <ProfileDetailScreen data={data} />;
}
```

### 依存ルール

- **loader は features/*/server/service のみ import 可** — rpc.ts / client hooks は禁止 (server-only)
- **loader 内でやってよい事**: service 呼び出し / パラメタ加工 (Zod parse / date 変換 / auth session 取得)
- **loader 内でやってはいけない事**: 副作用 (mutation, cookie 書き込み等) — それらは Server Action に回す
- **app/**/**/page.tsx から features/server 直呼び禁止** — 必ず `src/screens/<slice>/loader.ts` 経由

これで縦線が固まる: `app → screens.loader → features/server`

### Next.js layout.tsx の扱い (shell slice)

Next.js の `layout.tsx` (子 page 間で共有される shell UI) は、それ自体が「特定 screen」でも widget でもない為、専用の shell slice として扱う:

- **配置**: `src/screens/<name>-shell/loader.ts` + `src/screens/<name>-shell/ui/<Name>Shell.tsx`
- **layout.tsx** は薄く: loader を呼んで shell に data を渡し、`{children}` を差し込むだけ

```tsx
// app/(app)/p/[id]/layout.tsx
import ProfileShell from "@/src/screens/profile-shell/ui/ProfileShell";

export default async function Layout({ children, params }) {
  const { id } = await params;
  return <ProfileShell id={id}>{children}</ProfileShell>;
}
```

Shell に Suspense 境界を敷きたい時は、shell 内に **async SC (`<Name>ShellHead.tsx` 等) を切って loader を呼び、`<Suspense>` で囲む**:

```tsx
// src/screens/profile-shell/ui/ProfileShell.tsx
export default function ProfileShell({ id, children }) {
  return (
    <div>
      <Suspense fallback={<ProfileHeadSkeleton />}>
        <ProfileShellHead id={id} />
      </Suspense>
      <ProfileTabs profileId={id} />
      {children}
    </div>
  );
}

// src/screens/profile-shell/ui/ProfileShellHead.tsx (async SC)
export default async function ProfileShellHead({ id }) {
  const data = await loadProfileShell(id);
  return <>...</>;
}
```

これで縦線 `app → screens.loader → features/server` が layout でも維持される (async SC は screens 内の ui/ に置き、loader を呼ぶ形なら loader.ts 集約規約を破らない)。「screens = URL scope の視覚単位」を広めに解釈して layout も含める。

### 1 service 直呼びの時も loader を切る

コスト低い (1 行) + AI 判断が「initial data 取得は必ず loader」の一択で済む。1 行 loader も許容。

## Domain 跨ぎ shape の帰属

### アンカー: cross-domain composition は BE endpoint がやる

「Post + author」の合成データが欲しい → BE endpoint がまとめて返す (read model)。**FE で domain 型を合成する構造は原則作らない**。

理由: データ加工は BE の得意領域。FE features/type.ts を domain-pure に保てる、cache invalidation の依存関係が endpoint 経由で明示化される。

### 硬い禁止

- **features/<A>/type.ts が features/<B>/type.ts を import しない** — domain type は各 domain 内で self-contained

### 種類 1: endpoint が返す合成 shape (read model)

**owning feature の schema.ts に wire 型として置く。foreign domain データは inline object で書く (Profile 全体を import しない)。**

```ts
// features/comments/schema.ts
export const commentsListResponseSchema = z.object({
  comments: z.array(commentResponseSchema),
  authorAvatars: z.record(z.string().optional()),  // ← inline、Profile 型を引かない
  reactionState: z.object({
    counts: z.record(z.number()),
    mine: z.array(z.string().uuid()),
    names: z.record(z.array(z.string())),
  }),
});
export type CommentsListResponse = z.infer<typeof commentsListResponseSchema>;
```

- owning feature = endpoint URL のドメイン (`GET /comments` → comments)
- foreign データを inline で書く時は **小さい object shape のみ**、Profile 全体は絶対 import しない

### 種類 2: FE で合成が必要な時 (endpoint に頼れない時)

順に検討:

1. **Inline compose** — component / view-model hook 内で `{ post, author }` を作る、型名すら付けない
2. **Composition site 型** — 再利用したいなら screens/<slice>/type.ts or view-model hook 内 local type に置く
3. **BE endpoint に統合** — 複数画面で必要なら BE endpoint 側に read model として育てる

### BE 側 cross-domain の扱い (参考、規約は hono-feature-pattern 側)

| 種類 | BE パターン |
|---|---|
| **read** の cross-domain (denormalized read model) | owning feature の service が repo で foreign table を直接 join (単発クエリで assembly) |
| **write** の cross-domain (副作用、複数 service orchestration) | **useCase 層**で foreign feature の service を経由 (例: `createStatusPostUseCase` が broadcasts.statusUpdate 発火) |

FE 規約としては BE 側には触らない。hono-feature-pattern に従う。

### shared / monorepo packages は使わない

- 「features 跨ぎで純粋な domain 型を共有したい」場面は BE endpoint 側の read model で済ませる
- どうしても要ったら shared/type.ts に primitive を置くのは可、当面は避ける
- monorepo packages 化は over-engineering、solo project 規模では不要

### 具体化: 現状 CommentsSnapshot の再配置

v2 での扱い:
- `commentsListResponseSchema` を **features/comments/schema.ts** に置く (wire、authorAvatars/reactionState 全部 inline)
- FE cache 変換後の `CommentsData` は **features/comments/type.ts** に置く (Set 化、domain 側)
- `Profile` 型は features/profiles/type.ts に閉じたまま、comments から絶対 import しない

---

## v1 実験からの引き継ぎメモ

観測した AI 失敗パターン:

1. **api と model を混ぜる** — loader.ts に "matches 計算" を含めがち。segment を明示するプロンプトが必要、lint 強制が候補
2. **架空の共有制約を持ち出して過剰設計する** — CommentSection が 2 screens で共有されてると根拠なく主張して widgets 層を発動しようとした。実際は grep で 1 箇所しか使われてなかった。**確認 (grep) の前に構造判断を下すな**
