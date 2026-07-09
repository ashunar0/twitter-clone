import type { TweetWire, TweetsListResponseWire } from "./schema";

// wire == domain な段階では alias で置く。
// cache 変換が必要になった時点で Set / Map への差し替えを検討 (現状は Record のまま)。
export type Tweet = TweetWire;
export type TweetsData = TweetsListResponseWire;
