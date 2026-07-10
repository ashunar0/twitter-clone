import { HTTPException } from "hono/http-exception";
import type { CreateTweetWire } from "../../schema";
import type { Tweet } from "../../type";
import { tweetsService } from "../service";
import { notificationsService } from "../../../notifications/server/service";

// tweet を 1 件作成する。parentId 有りなら reply として扱い、
// parent author (自分以外) に "reply" 通知を発火する。parentId なしは通常 tweet。
// 通常 tweet も usecase 経由に統一 (「route は service か usecase の片方」規約準拠)。
export async function createTweet(
  input: CreateTweetWire,
  currentUserId: string,
): Promise<Tweet> {
  // parentId 有りなら parent 存在確認、無ければ 404 で弾く (dangling reply 防止)。
  if (input.parentId) {
    const parent = await tweetsService.findById(input.parentId);
    if (!parent) {
      throw new HTTPException(404, { message: "parent tweet not found" });
    }
    const created = await tweetsService.create(input, currentUserId);
    // self-reply には通知を送らない (自分宛の noise を避ける)。
    if (parent.authorId !== currentUserId) {
      await notificationsService.record({
        kind: "reply",
        recipientId: parent.authorId,
        actorId: currentUserId,
      });
    }
    return created;
  }
  return tweetsService.create(input, currentUserId);
}
