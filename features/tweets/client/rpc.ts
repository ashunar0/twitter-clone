import { rpcClient } from "@/lib/hono/client";
import type {
  CreateTweetWire,
  TweetWire,
  TweetsListResponseWire,
} from "../schema";

export const tweetsRpc = {
  // GET /api/tweets — 直近 tweets + author summary の read model を取得。
  async list(): Promise<TweetsListResponseWire> {
    const res = await rpcClient.api.tweets.$get();
    if (!res.ok) throw new Error("failed to fetch tweets");
    return (await res.json()) as TweetsListResponseWire;
  },
  // POST /api/tweets — current user 名義で 1 件作成、作成された Tweet を返す。
  async create(input: CreateTweetWire): Promise<TweetWire> {
    const res = await rpcClient.api.tweets.$post({ json: input });
    if (!res.ok) throw new Error("failed to create tweet");
    return (await res.json()) as TweetWire;
  },
};
