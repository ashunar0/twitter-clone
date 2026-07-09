import { z } from "zod";

// POST /api/follows の body。current user が followeeId を follow する。
export const createFollowWireSchema = z.object({
  followeeId: z.string(),
});
export type CreateFollowWire = z.infer<typeof createFollowWireSchema>;

// GET /api/follows/counts/:userId の response。
export const followCountsSchema = z.object({
  followers: z.number(),
  following: z.number(),
});
export type FollowCounts = z.infer<typeof followCountsSchema>;

// GET /api/follows/mine/:userId の response。current user が対象 user を follow してるか。
export const followMineSchema = z.object({
  isFollowing: z.boolean(),
});
export type FollowMine = z.infer<typeof followMineSchema>;
