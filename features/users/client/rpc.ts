import { rpcClient } from "@/lib/hono/client";
import { throwIfNotOk } from "@/lib/hono/apiError";
import type { UpdateProfileWire, UserWire } from "../schema";

export const usersRpc = {
  // GET /api/users/me — mock auth 済みの current user を取得。
  async me(): Promise<UserWire> {
    const res = await rpcClient.api.users.me.$get();
    await throwIfNotOk(res);
    return (await res.json()) as UserWire;
  },
  // GET /api/users/by-handle/:handle — handle で 1 件取得。存在しなければ ApiError.notFound。
  async byHandle(handle: string): Promise<UserWire> {
    const res = await rpcClient.api.users["by-handle"][":handle"].$get({
      param: { handle },
    });
    await throwIfNotOk(res);
    return (await res.json()) as UserWire;
  },
  // PUT /api/users/me — 自分の name / handle を更新、更新後 user を返す。
  async updateMe(input: UpdateProfileWire): Promise<UserWire> {
    const res = await rpcClient.api.users.me.$put({ json: input });
    await throwIfNotOk(res);
    return (await res.json()) as UserWire;
  },
};
