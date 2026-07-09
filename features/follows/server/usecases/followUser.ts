import { HTTPException } from "hono/http-exception";
import { followsService } from "../service";
import { notificationsService } from "../../../notifications/server/service";

// cross-feature write orchestration の初実装。
// follow を追加し、新規なら followee 宛に "follow" 通知を発火する。
// - 単一 feature 完結なら route → service で足りるが、side effect (notification) が乗るので usecase に切る
// - service → 他 feature の service 呼び出しは禁止規約、そのため usecase 経由に強制
export async function followUser(
  currentUserId: string,
  followeeId: string,
): Promise<void> {
  if (currentUserId === followeeId) {
    throw new HTTPException(400, { message: "cannot follow yourself" });
  }
  const created = await followsService.follow(currentUserId, followeeId);
  // 既存 follow を再要求された場合は通知を再作成しない (冪等)。
  if (created) {
    await notificationsService.record({
      kind: "follow",
      recipientId: followeeId,
      actorId: currentUserId,
    });
  }
}
