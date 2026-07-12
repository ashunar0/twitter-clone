import { Search, User } from "lucide-react";
import { Avatar } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";

// mock trend データ。将来 trends feature を作ったら差し替える。
const MOCK_TRENDS: { category: string; title: string; posts: string }[] = [
  {
    category: "テクノロジー・トレンド",
    title: "TanStack Router",
    posts: "12.3K posts",
  },
  {
    category: "プログラミング・トレンド",
    title: "Cloudflare Workers",
    posts: "4,521 posts",
  },
  { category: "トレンド", title: "ずんだもん", posts: "58.9K posts" },
  { category: "トレンド", title: "React 19", posts: "31.2K posts" },
];

// mock おすすめユーザー。将来 recommendation を作ったら差し替える。
const MOCK_SUGGESTIONS: { name: string; handle: string; avatarUrl?: string }[] =
  [
    { name: "Anthropic", handle: "AnthropicAI" },
    { name: "Cloudflare Dev", handle: "CloudflareDev" },
    { name: "TanStack", handle: "tan_stack" },
  ];

// 右サイドバー。Twitter/X 準拠で 検索 / トレンド / おすすめユーザー の 3 セクション。
// ロジックは全部 mock、ここでは見た目だけ作る。
export function RightSidebar() {
  return (
    <aside className="sticky top-0 hidden h-svh w-96 shrink-0 flex-col gap-4 overflow-y-auto py-2 pl-6 pr-2 lg:flex">
      <SearchBox />
      <TrendsCard />
      <WhoToFollowCard />
    </aside>
  );
}

// 検索 input。Input primitive の outline variant (border + bg-surface) を pill 化 + icon padding。
// フォームは submit しない (route 未実装)。
function SearchBox() {
  return (
    <div className="relative">
      <Search
        className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-fg-muted"
        aria-hidden
      />
      <Input
        type="search"
        placeholder="検索"
        variant="outline"
        size="md"
        className="rounded-full pl-11"
      />
    </div>
  );
}

// トレンドカード。カテゴリ / タイトル / posts 数の 3 行構成 × N。
function TrendsCard() {
  return (
    <Card.Root asChild>
      <section>
        <h2 className="px-4 pt-3 text-xl font-bold text-fg">
          いまどうしてる？
        </h2>
        <ul>
          {MOCK_TRENDS.map((t) => (
            <li key={t.title}>
              <button
                type="button"
                className="flex w-full flex-col items-start gap-0.5 px-4 py-3 text-left hover:bg-fg/5"
              >
                <span className="text-xs text-fg-muted">{t.category}</span>
                <span className="text-sm font-bold text-fg">{t.title}</span>
                <span className="text-xs text-fg-muted">{t.posts}</span>
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="w-full rounded-b-lg px-4 py-3 text-left text-sm text-brand-blue hover:bg-fg/5"
        >
          さらに表示
        </button>
      </section>
    </Card.Root>
  );
}

// おすすめユーザーカード。avatar / name / handle + 白抜き Follow ボタン。
function WhoToFollowCard() {
  return (
    <Card.Root asChild>
      <section>
        <h2 className="px-4 pt-3 text-xl font-bold text-fg">
          おすすめユーザー
        </h2>
        <ul>
          {MOCK_SUGGESTIONS.map((u) => (
            <li
              key={u.handle}
              className="flex items-center gap-3 px-4 py-3 hover:bg-fg/5"
            >
              <Avatar.Root className="size-10 shrink-0">
                {u.avatarUrl ? (
                  <Avatar.Image src={u.avatarUrl} alt={u.name} />
                ) : null}
                <Avatar.Fallback>
                  <User className="size-5 text-fg-subtle" aria-hidden />
                </Avatar.Fallback>
              </Avatar.Root>
              <div className="flex min-w-0 flex-1 flex-col leading-tight">
                <span className="truncate text-sm font-bold text-fg">
                  {u.name}
                </span>
                <span className="truncate text-sm text-fg-muted">
                  @{u.handle}
                </span>
              </div>
              <Button className="h-8 rounded-full bg-fg px-4 text-sm font-bold text-surface hover:bg-fg/90">
                フォロー
              </Button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="w-full rounded-b-lg px-4 py-3 text-left text-sm text-brand-blue hover:bg-fg/5"
        >
          さらに表示
        </button>
      </section>
    </Card.Root>
  );
}
