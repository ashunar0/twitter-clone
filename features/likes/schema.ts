import { z } from "zod";

// POST /api/likes の body。tweetId を受け取り、current user 名義で 1 件作成。
export const createLikeWireSchema = z.object({
  tweetId: z.string(),
});
export type CreateLikeWire = z.infer<typeof createLikeWireSchema>;
