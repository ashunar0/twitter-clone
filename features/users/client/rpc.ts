import { rpcClient } from "@/lib/hono/client";
import type { UserWire } from "../schema";

export const usersRpc = {
  // GET /api/users/me — mock auth 済みの current user を取得。
  async me(): Promise<UserWire> {
    const res = await rpcClient.api.users.me.$get();
    if (!res.ok) throw new Error("failed to fetch current user");
    return (await res.json()) as UserWire;
  },
  // GET /api/users/by-handle/:handle — handle で 1 件取得。存在しなければ throw。
  async byHandle(handle: string): Promise<UserWire> {
    const res = await rpcClient.api.users["by-handle"][":handle"].$get({
      param: { handle },
    });
    if (!res.ok) throw new Error("user not found");
    return (await res.json()) as UserWire;
  },
};
