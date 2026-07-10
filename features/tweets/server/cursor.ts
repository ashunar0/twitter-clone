// tweets の cursor pagination 用 opaque token。
// (createdAt, id) の複合 cursor を base64url に閉じ込め、FE には string として運ぶ。
// createdAt が秒精度なので id を tie-breaker にして重複/欠落を防ぐ。
// btoa/atob 使用 (Node / Cloudflare Workers 両対応、Buffer 依存なし)。

// {createdAt, id} を "|" 区切りで base64url 化する。
export function encodeTweetCursor(row: {
  createdAt: string;
  id: string;
}): string {
  return toBase64Url(`${row.createdAt}|${row.id}`);
}

// base64url cursor を復号する。壊れた入力は null を返す (route 側で 400 にできる)。
export function decodeTweetCursor(
  token: string,
): { createdAt: string; id: string } | null {
  try {
    const raw = fromBase64Url(token);
    const [createdAt, id] = raw.split("|");
    if (!createdAt || !id) return null;
    return { createdAt, id };
  } catch {
    return null;
  }
}

// standard base64 → URL-safe (RFC 4648 §5) に変換する。
function toBase64Url(s: string): string {
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// URL-safe base64 を standard に戻して decode する。
function fromBase64Url(s: string): string {
  const padded = s.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4;
  return atob(pad ? padded + "=".repeat(4 - pad) : padded);
}
