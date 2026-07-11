import { rpcClient } from "@/lib/hono/client";
import { throwIfNotOk } from "@/lib/hono/apiError";
import type {
  HandleAvailabilityWire,
  ProfileWire,
  UpdateProfileWire,
} from "../schema";

export const profilesRpc = {
  // GET /api/profiles/me — current user の profile を取得。
  async me(): Promise<ProfileWire> {
    const res = await rpcClient.api.profiles.me.$get();
    await throwIfNotOk(res);
    return (await res.json()) as ProfileWire;
  },
  // GET /api/profiles/by-handle/:handle — handle で 1 件取得。
  async byHandle(handle: string): Promise<ProfileWire> {
    const res = await rpcClient.api.profiles["by-handle"][":handle"].$get({
      param: { handle },
    });
    await throwIfNotOk(res);
    return (await res.json()) as ProfileWire;
  },
  // PUT /api/profiles/me — 自分の handle / name を更新、更新後 profile を返す。
  async updateMe(input: UpdateProfileWire): Promise<ProfileWire> {
    const res = await rpcClient.api.profiles.me.$put({ json: input });
    await throwIfNotOk(res);
    return (await res.json()) as ProfileWire;
  },
  // GET /api/profiles/handle-availability?handle=xxx — signup wizard 用、認証不要。
  async handleAvailability(handle: string): Promise<HandleAvailabilityWire> {
    const res = await rpcClient.api.profiles["handle-availability"].$get({
      query: { handle },
    });
    await throwIfNotOk(res);
    return (await res.json()) as HandleAvailabilityWire;
  },
};
