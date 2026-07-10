import type { DB } from "../../../../server/lib/db";
import { tweetsRepository } from "../repository";

// current user が elementaryId (元 tweet) について作った RT 行を削除する。存在しなくても noop (冪等)。
// 通知履歴は残す (規約: 関係 entity と side effect entity のライフサイクル分離)。
export async function unretweetTweet(
  db: DB,
  originalId: string,
  currentUserId: string,
): Promise<void> {
  const existing = await tweetsRepository.findRetweetOf(
    db,
    originalId,
    currentUserId,
  );
  if (!existing) return;
  await tweetsRepository.deleteById(db, existing.id);
}
