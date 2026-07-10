import { rpcClient } from "@/lib/hono/client";
import { throwIfNotOk } from "@/lib/hono/apiError";
import type {
  CreateFollowWire,
  FollowCounts,
  FollowMine,
} from "../schema";

export const followsRpc = {
  // POST /api/follows — current user が followeeId を follow する (usecase 経由、冪等)。
  async add(input: CreateFollowWire): Promise<void> {
    const res = await rpcClient.api.follows.$post({ json: input });
    await throwIfNotOk(res);
  },
  // DELETE /api/follows/:userId — current user の follow を外す (冪等)。
  async remove(userId: string): Promise<void> {
    const res = await rpcClient.api.follows[":userId"].$delete({
      param: { userId },
    });
    await throwIfNotOk(res);
  },
  // GET /api/follows/counts/:userId — followers / following 数。
  async counts(userId: string): Promise<FollowCounts> {
    const res = await rpcClient.api.follows.counts[":userId"].$get({
      param: { userId },
    });
    await throwIfNotOk(res);
    return (await res.json()) as FollowCounts;
  },
  // GET /api/follows/mine/:userId — current user が対象 user を follow してるか。
  async mineOf(userId: string): Promise<FollowMine> {
    const res = await rpcClient.api.follows.mine[":userId"].$get({
      param: { userId },
    });
    await throwIfNotOk(res);
    return (await res.json()) as FollowMine;
  },
};
