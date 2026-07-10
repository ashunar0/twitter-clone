import { z } from "zod";

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

export const signUpWireSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string().trim().min(1, "名前を入力してください").max(50),
});
export type SignUpWire = z.infer<typeof signUpWireSchema>;

export const signInWireSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "パスワードを入力してください"),
});
export type SignInWire = z.infer<typeof signInWireSchema>;
