import { rpcClient } from "@/lib/hono/client";
import type { TweetsListResponseWire } from "../schema";

export const tweetsRpc = {
  // GET /api/tweets — 直近 tweets + author summary の read model を取得。
  async list(): Promise<TweetsListResponseWire> {
    const res = await rpcClient.api.tweets.$get();
    if (!res.ok) throw new Error("failed to fetch tweets");
    return (await res.json()) as TweetsListResponseWire;
  },
};
