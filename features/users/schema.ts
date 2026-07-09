import { z } from "zod";

export const userWireSchema = z.object({
  id: z.string(),
  handle: z.string(),
  name: z.string(),
  avatarUrl: z.string().nullable(),
  createdAt: z.string(),
});

export type UserWire = z.infer<typeof userWireSchema>;

// user 更新は #4b 以降で登場するが、パターン提示のため先出し。
// server 側で自動 set する id / createdAt を落とす。
export const createUserWireSchema = userWireSchema.omit({
  id: true,
  createdAt: true,
});
export type CreateUserWire = z.infer<typeof createUserWireSchema>;
