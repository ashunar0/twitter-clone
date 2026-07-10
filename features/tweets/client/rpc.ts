import { rpcClient } from "@/lib/hono/client";
import { throwIfNotOk } from "@/lib/hono/apiError";
import type {
  CreateTweetWire,
  TweetWire,
  TweetsListResponseWire,
} from "../schema";

export const tweetsRpc = {
  // GET /api/tweets — 1 page 分の tweets + author summary + likeState + nextCursor。
  // cursor 未指定なら最新 page、指定ありならそれより古い page を返す (seek pagination)。
  async list(filter?: {
    authorId?: string;
    cursor?: string;
  }): Promise<TweetsListResponseWire> {
    const query: Record<string, string> = {};
    if (filter?.authorId) query.authorId = filter.authorId;
    if (filter?.cursor) query.cursor = filter.cursor;
    const res = await rpcClient.api.tweets.$get({ query });
    await throwIfNotOk(res);
    return (await res.json()) as TweetsListResponseWire;
  },
  // POST /api/tweets — current user 名義で 1 件作成、作成された Tweet を返す。
  async create(input: CreateTweetWire): Promise<TweetWire> {
    const res = await rpcClient.api.tweets.$post({ json: input });
    await throwIfNotOk(res);
    return (await res.json()) as TweetWire;
  },
};
