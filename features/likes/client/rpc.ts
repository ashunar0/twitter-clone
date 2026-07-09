import { rpcClient } from "@/lib/hono/client";
import type { CreateLikeWire } from "../schema";

export const likesRpc = {
  // POST /api/likes — current user が tweetId を like する (冪等)。
  async add(input: CreateLikeWire): Promise<void> {
    const res = await rpcClient.api.likes.$post({ json: input });
    if (!res.ok) throw new Error("failed to add like");
  },
  // DELETE /api/likes/:tweetId — current user の like を外す (冪等)。
  async remove(tweetId: string): Promise<void> {
    const res = await rpcClient.api.likes[":tweetId"].$delete({
      param: { tweetId },
    });
    if (!res.ok) throw new Error("failed to remove like");
  },
};
