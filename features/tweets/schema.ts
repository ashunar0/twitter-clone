import { z } from "zod";

// tweet 単体の wire 形。
export const tweetWireSchema = z.object({
  id: z.string(),
  authorId: z.string(),
  body: z.string(),
  createdAt: z.string(),
});
export type TweetWire = z.infer<typeof tweetWireSchema>;

// tweet に紐づく author の summary。
// 別 feature (users) の型を import せず、必要 field のみ inline で定義する
// (cross-domain read model の owning feature 側 schema 規約)。
export const authorSummarySchema = z.object({
  handle: z.string(),
  name: z.string(),
  avatarUrl: z.string().nullable(),
});
export type AuthorSummary = z.infer<typeof authorSummarySchema>;

// GET /api/tweets の response。tweets + authorId→summary の map。
export const tweetsListResponseSchema = z.object({
  tweets: z.array(tweetWireSchema),
  authorSummaries: z.record(z.string(), authorSummarySchema),
});
export type TweetsListResponseWire = z.infer<typeof tweetsListResponseSchema>;

// server 自動 set の id / createdAt / authorId (= current user) を落とした create 用。
export const createTweetWireSchema = tweetWireSchema.omit({
  id: true,
  createdAt: true,
  authorId: true,
});
export type CreateTweetWire = z.infer<typeof createTweetWireSchema>;
