# docs/

このプロジェクトは **Twitter clone を題材に、FE / BE のアーキテクチャ規約が別ドメインでも成立するかを検証する** ためのもの。本番運用は目指さない。

## 読む順番

1. **[repo-structure.md](./repo-structure.md)** — root トップの構成、依存の向き、B 構成 (features 直下に client/server 兄弟) を選んだ理由と代償
2. **[be-architecture.md](./be-architecture.md)** — Hono 3層 (route → service → repository) + usecase 層、Drizzle + zod のパターン、mock auth、cross-domain の扱い
3. **[fe-architecture.md](./fe-architecture.md)** — features/*/client の書き方 (rpc / queries / mutations)、TanStack Router loader、queryKey factory、cross-domain read model の消費

すべての規約は **実装で確定した規則のみ** を書くことをルールにしている。未検証の論点は各 doc の「未確定」節にまとめて、次のスライスで検証する。

## 実装状況 (2026-07-09 時点)

**5 domain**: users / tweets / likes / follows / notifications
**画面**: `/` timeline、`/u/:handle` profile、`/notifications`
**mock auth**: `server/lib/currentUser.ts` に隔離、`SEED_USER_ID = "u1"` 固定

## 参考にしている外部規約

- **BE**: [hono-feature-add skill](https://github.com/anthropics/claude-code) (ローカルの `~/.claude/skills/hono-feature-add/`) — feature 単位の垂直スライスを積む時のルール。このプロジェクトは skill 準拠、差分は be-architecture.md で明示
- **FE**: 元は profile-app (別 repo、Next.js) の `fe-architecture.md v2 実験` — この規約を TanStack Router / Vite 版に adapt したものが本 docs

## 検証観点

- 規約が **別ドメインでも成立するか** (profile-app → Twitter clone の再現性)
- 規約が **スケールに耐えるか** (5 domain 実装した時点で観測)
- 規約が **記事化できるか** (Zenn writeup 予定、B / A 両構成に対応する書き方)

## デプロイ想定

Cloudflare Workers + Static Assets バインディングで **1 Worker が FE 静的 build と BE fetch handler の両方を提供** する予定 (未実装)。同一 origin、CORS 不要。
