import { rpcClient } from "@/lib/hono/client";
import type { UserWire } from "../schema";

export const usersRpc = {
  // GET /api/users/me — mock auth 済みの current user を取得。
  async me(): Promise<UserWire> {
    const res = await rpcClient.api.users.me.$get();
    if (!res.ok) throw new Error("failed to fetch current user");
    return (await res.json()) as UserWire;
  },
};
