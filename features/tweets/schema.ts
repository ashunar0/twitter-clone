import { z } from "zod";

// tweet 単体の wire 形。
// - parentId は reply 元の tweet id (通常 tweet は null)
// - retweetOfId は RT 元の tweet id (通常 tweet は null)。RT は body="" で作成される
// parentId と retweetOfId が同時に埋まることは無い (reply / retweet 排他)。
export const tweetWireSchema = z.object({
  id: z.string(),
  authorId: z.string(),
  parentId: z.string().nullable(),
  retweetOfId: z.string().nullable(),
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

// tweet ごとの retweet 情報。likeState と同形の read model。
// key は「元 tweet id」(retweetOfId 側) で数える (RT レコード側の id ではない)。
// counts[originalTweetId] = 何人にその tweet が RT されたか、mineIds は current user が RT した元 tweetId。
export const retweetStateSchema = z.object({
  counts: z.record(z.string(), z.number()),
  mineIds: z.array(z.string()),
});
export type RetweetStateWire = z.infer<typeof retweetStateSchema>;

// RT tweet を表示する時に必要な「元 tweet + author」bundle。key は元 tweet id (retweetOfId)。
// 元 tweet が同 page に無くても FE 側で表示できるように、この map で解決する。
export const originalTweetSchema = z.object({
  tweet: tweetWireSchema,
  author: authorSummarySchema,
});
export type OriginalTweetWire = z.infer<typeof originalTweetSchema>;

// GET /api/tweets の response (1 page)。
// nextCursor が非 null なら「続きあり」、null なら最後の page。
export const tweetsListResponseSchema = z.object({
  tweets: z.array(tweetWireSchema),
  authorSummaries: z.record(z.string(), authorSummarySchema),
  likeState: likeStateSchema,
  retweetState: retweetStateSchema,
  originalTweets: z.record(z.string(), originalTweetSchema),
  nextCursor: z.string().nullable(),
});
export type TweetsListResponseWire = z.infer<typeof tweetsListResponseSchema>;

// server 自動 set の id / createdAt / authorId (= current user) を落とした create 用。
// retweetOfId も client からは指定させない (retweet は専用 endpoint POST /api/tweets/:id/retweet を使う)。
export const createTweetWireSchema = tweetWireSchema.omit({
  id: true,
  createdAt: true,
  authorId: true,
  retweetOfId: true,
});
export type CreateTweetWire = z.infer<typeof createTweetWireSchema>;
