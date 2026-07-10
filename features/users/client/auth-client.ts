import { createAuthClient } from "better-auth/react";

// better-auth の React client。cookie ベースの session を read/write する hook を提供する。
// baseURL を同一 origin (相対 URL) にすることで dev proxy / prod いずれも自動で /api/auth に届く。
// useSession() を FE 各所で使うと SWR 的に session 更新を追従する。
export const authClient = createAuthClient({
  baseURL: typeof window !== "undefined" ? window.location.origin : "",
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
} = authClient;
