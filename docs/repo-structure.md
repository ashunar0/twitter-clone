# リポジトリ構造 (WIP)

**目的:** FE / BE / 共有ドメイン層を root で明示し、依存の向きをフォルダ構造で伝える。

## トップレベル

```
twitter-clone/
├─ docs/                   ← 設計ドキュメント
├─ src/                    ← FE 専用 (Vite が build する対象)
│  ├─ app/                 ← TanStack Router entry + routes
│  ├─ screens/             ← 画面固有 UI + composition
│  ├─ widgets/             ← 跨ぎ画面 UI 部品
│  ├─ shared/              ← UI primitive (hisui-ui の生成先: shared/ui)
│  └─ lib/                 ← FE utility (hono client 等)
├─ features/               ← ドメイン層 (FE / BE 両方から参照される)
│  └─ <domain>/
│     ├─ schema.ts         ← wire 契約 (zod)
│     ├─ type.ts           ← domain 型 (FE の cache 型もここ)
│     ├─ lib/              ← pure 関数 (FE / BE 共通で使い得るもの)
│     ├─ client/           ← FE 側: rpc / queries / mutations
│     └─ server/           ← BE 側: index (route) / service / repository / table
├─ server/                 ← BE entry (Node で起動する別プロセス、別 build)
│  ├─ app.ts               ← Hono app 定義層 (runtime 非依存、AppType export)
│  ├─ index.ts             ← Node 起動 entry (dev / prod-Node)
│  └─ lib/                 ← BE utility (db client / seed / mock auth 等)
├─ drizzle/                ← DB migrations (drizzle-kit 生成)
├─ package.json            ← 単一 (workspace 不使用)
├─ tsconfig.{json, web.json, server.json}
├─ vite.config.ts
├─ drizzle.config.ts
└─ hisui.json
```

## 依存の向き

**大原則:** 上位が下位を import する、逆はしない。

```
src/app          ─→ src/screens ─→ src/widgets ─→ src/shared, src/lib
                 ↘
                    features/<domain>/{client, schema, type, lib}

server/          ─→ features/<domain>/{server, schema, type, lib}

features/<domain>/server ─→ features/<domain>/{schema, type, lib}, server/lib
features/<domain>/client ─→ features/<domain>/{schema, type, lib}, src/lib
```

## 硬い禁止

1. **`features/*/server` を `src/` から import しない** — FE bundle に BE コードが混じる
2. **`features/*/client` を `server/` から import しない** — BE bundle に React が混じる
3. **`features/<A>` の内部を `features/<B>` から import しない** — cross-domain 合成は BE endpoint (read model) で解決
4. **`src/lib/hono/client.ts` の `rpcClient` は `features/*/client/rpc.ts` からのみ呼ぶ** — screens / widgets / component が直接 rpc を叩かない

## FE / BE 型境界

- **wire 契約 (`features/<domain>/schema.ts`)** — zod で定義、FE / BE 両方が参照する共有点
- **AppType (`server/app.ts` から export)** — Hono の型を FE の `hc<AppType>()` に流す。**`server/app.ts` は runtime 非依存**にしておく (Node API に触ると FE の tsconfig で解決が壊れる)
- FE tsconfig の include は **`server/app.ts` のみ** — Node 依存コードを FE 型解決に持ち込まない

## tsconfig

- `tsconfig.web.json` — FE build 用。include: `src`, `features`, `server/app.ts`
- `tsconfig.server.json` — BE build 用。include: `server`, `features`
- `tsconfig.json` — references (project references の親)

## FE / BE の起動

- `pnpm dev` — FE + BE 同時 (`run-p dev:web dev:server`)
- `pnpm dev:web` — Vite (`:5173`)
- `pnpm dev:server` — Hono + tsx watch (`:8787`)
- Vite dev proxy: `/api/*` → `:8787`

## デプロイ想定 (未実施)

Cloudflare Workers Assets バインディングで **1 Worker が FE build (静的) と BE (`fetch` handler) の両方を提供**する予定。同一 origin、CORS 不要。詳細は移行時に別ドキュメント化。
