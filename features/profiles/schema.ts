import { z } from "zod";

// handle の共有スキーマ (BE/FE 両方から使う)。3〜15 文字、a-z / A-Z / 0-9 / _。
export const handleSchema = z
  .string()
  .regex(/^[a-zA-Z0-9_]{3,15}$/, "3〜15 文字の英数字と _ のみ");

// name の共有スキーマ。1〜50 文字、trim して min 1 で空欄弾く。
export const nameSchema = z
  .string()
  .trim()
  .min(1, "名前を入力してください")
  .max(50, "50 文字以内にしてください");

// profile 単体の wire 形。auth の users 側 name/image と handle を merge した「見せる identity」。
export const profileWireSchema = z.object({
  userId: z.string(),
  handle: z.string(),
  name: z.string(),
  avatarUrl: z.string().nullable(),
});
export type ProfileWire = z.infer<typeof profileWireSchema>;

// 別 feature から使う軽量な summary shape (tweets / notifications の enrichment 用)。
// owning feature = profiles、他 feature は inline object で持たず、この型を import する。
export const profileSummarySchema = z.object({
  handle: z.string(),
  name: z.string(),
  avatarUrl: z.string().nullable(),
});
export type ProfileSummary = z.infer<typeof profileSummarySchema>;

// PUT /api/profiles/me — 自分の profile (handle + name) を更新する。
// avatarUrl は今回スコープ外 (upload 未実装)。
export const updateProfileWireSchema = z.object({
  name: nameSchema,
  handle: handleSchema,
});
export type UpdateProfileWire = z.infer<typeof updateProfileWireSchema>;

// GET /api/profiles/handle-availability?handle=xxx — signup wizard 用の handle 空き check。
// 認証不要 (公開 endpoint)。format 不正は 400、空いてれば {available:true}、埋まってれば {available:false}。
export const handleAvailabilityQuerySchema = z.object({
  handle: handleSchema,
});
export const handleAvailabilityWireSchema = z.object({
  available: z.boolean(),
});
export type HandleAvailabilityWire = z.infer<typeof handleAvailabilityWireSchema>;
