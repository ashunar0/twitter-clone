import type { AuthorSummary, OriginalTweetWire, TweetWire } from "./schema";

// wire == domain な entity は alias。
export type Tweet = TweetWire;

// FE cache 型: mineIds を Set 化して O(1) lookup にする (wire は array)。
// wire→cache 変換は features/tweets/client/queries.ts の selectFlattened で行う。
export type LikeState = {
  counts: Record<string, number>;
  mineIds: Set<string>;
};

export type RetweetState = {
  counts: Record<string, number>;
  mineIds: Set<string>;
};

export type TweetsData = {
  tweets: Tweet[];
  authorSummaries: Record<string, AuthorSummary>;
  likeState: LikeState;
  retweetState: RetweetState;
  originalTweets: Record<string, OriginalTweetWire>;
};
