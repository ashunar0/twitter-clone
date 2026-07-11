import { ApiError } from "../../../../server/lib/errors";
import type { DB } from "../../../../server/infra/db";
import { tweetsRepository } from "../repository";
import { tweetsService } from "../service";
import { notificationsService } from "../../../notifications/server/service";

// 元 tweet を current user 名義で retweet する (body="" の tweet row を作る)。冪等: 既に RT 済みなら noop で既存 row を返す。
// self-retweet は許容するが通知はスキップ (like と同じ)。
export async function retweetTweet(
  db: DB,
  originalId: string,
  currentUserId: string,
): Promise<void> {
  const original = await tweetsService.findById(db, originalId);
  if (!original) throw ApiError.notFound("tweet not found");
  // RT 対象がすでに RT の場合は「元の元」に寄せる (Twitter と同じ、RT of RT は展開)。
  const targetId = original.retweetOfId ?? original.id;
  const existing = await tweetsRepository.findRetweetOf(
    db,
    targetId,
    currentUserId,
  );
  if (existing) return; // 冪等: 既に RT 済み
  await tweetsService.create(
    db,
    { body: "", parentId: null, retweetOfId: targetId },
    currentUserId,
  );
  // 元 tweet の author (自分以外) に "retweet" 通知。
  const finalTarget = original.retweetOfId
    ? await tweetsService.findById(db, targetId)
    : original;
  if (finalTarget && finalTarget.authorId !== currentUserId) {
    await notificationsService.record(db, {
      kind: "retweet",
      recipientId: finalTarget.authorId,
      actorId: currentUserId,
    });
  }
}
