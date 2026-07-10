import { z } from "zod";

// tweet 単体の wire 形。parentId は reply 元の tweet id、通常 tweet は null。
export const tweetWireSchema = z.object({
  id: z.string(),
  authorId: z.string(),
  parentId: z.string().nullable(),
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

// tweet ごとの like 情報。cross-domain read model の inline shape (owning feature = tweets)。
// wire は array (mineIds: string[])、FE cache では Set へ差し替える。
export const likeStateSchema = z.object({
  counts: z.record(z.string(), z.number()),
  mineIds: z.array(z.string()),
});
export type LikeStateWire = z.infer<typeof likeStateSchema>;

// GET /api/tweets の response (1 page)。
// nextCursor が非 null なら「続きあり」、null なら最後の page。
export const tweetsListResponseSchema = z.object({
  tweets: z.array(tweetWireSchema),
  authorSummaries: z.record(z.string(), authorSummarySchema),
  likeState: likeStateSchema,
  nextCursor: z.string().nullable(),
});
export type TweetsListResponseWire = z.infer<typeof tweetsListResponseSchema>;

// server 自動 set の id / createdAt / authorId (= current user) を落とした create 用。
export const createTweetWireSchema = tweetWireSchema.omit({
  id: true,
  createdAt: true,
  authorId: true,
});
export type CreateTweetWire = z.infer<typeof createTweetWireSchema>;
