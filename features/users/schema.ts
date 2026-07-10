import { z } from "zod";

// handle の共有スキーマ。BE / FE の両側から使う (validation は同じ regex)。
// 3〜15 文字、a-z / A-Z / 0-9 / _ のみ。
export const handleSchema = z
  .string()
  .regex(/^[a-zA-Z0-9_]{3,15}$/, "3〜15 文字の英数字と _ のみ");

// name の共有スキーマ。1〜50 文字、空白削って min 1 を弾く。
export const nameSchema = z
  .string()
  .trim()
  .min(1, "名前を入力してください")
  .max(50, "50 文字以内にしてください");

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

// PUT /api/users/me — 自分の profile を更新する時の入力。
// avatarUrl は今回スコープ外 (upload 未実装のため)、name / handle のみ。
export const updateProfileWireSchema = z.object({
  name: nameSchema,
  handle: handleSchema,
});
export type UpdateProfileWire = z.infer<typeof updateProfileWireSchema>;
