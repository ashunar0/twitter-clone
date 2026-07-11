import { z } from "zod";
import { handleSchema, nameSchema } from "../profiles/schema";

// features/users は auth ドメイン。
// public 表示用の identity (handle 等) は features/profiles/schema.ts に隔離。
// - handle / name の共有 zod は profiles/schema.ts に置いた

// current 認証セッションの user (better-auth の user + 我々の必要 field)。
// wire 型を server 側で厳密には parse していないが、FE から見た shape を明示する。
export const userWireSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  image: z.string().nullable(),
});
export type UserWire = z.infer<typeof userWireSchema>;

// signup / signin の入力 (better-auth 側で validate されるが、FE の client-side pre-check 用)。
export const emailSchema = z.string().email("メール形式が正しくありません");
export const passwordSchema = z
  .string()
  .min(8, "パスワードは 8 文字以上にしてください");

// signup は wizard で 3 step (email+name → handle → password) に分割するが、最終 submit ではこの単一 schema で validate する。
// handle 制約は features/profiles の handleSchema を再利用 (単一の source of truth)。
export const signUpWireSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema,
  handle: handleSchema,
});
export type SignUpWire = z.infer<typeof signUpWireSchema>;

// wizard step ごとの部分 schema。各画面の field-level validate に使う。
export const signUpStep1Schema = signUpWireSchema.pick({ email: true, name: true });
export type SignUpStep1 = z.infer<typeof signUpStep1Schema>;

export const signUpStep2Schema = signUpWireSchema.pick({ handle: true });
export type SignUpStep2 = z.infer<typeof signUpStep2Schema>;

export const signUpStep3Schema = signUpWireSchema.pick({ password: true });
export type SignUpStep3 = z.infer<typeof signUpStep3Schema>;

export const signInWireSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "パスワードを入力してください"),
});
export type SignInWire = z.infer<typeof signInWireSchema>;
