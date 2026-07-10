import { ApiError } from "../../../../server/lib/errors";
import type { DB } from "../../../../server/lib/db";
import type { CreateTweetWire } from "../../schema";
import type { Tweet } from "../../type";
import { tweetsService } from "../service";
import { mentionsRepository } from "../repository";
import { mediaRepository } from "../../../media/server/repository";
import { notificationsService } from "../../../notifications/server/service";
import { profilesRepository } from "../../../profiles/server/repository";

// body から @handle を抜き出す。handle は 3〜15 文字 [a-zA-Z0-9_]、前後に word char が来ないよう境界を効かせる。
// 例: "hi @asahi and @zundamon" → ["asahi", "zundamon"]。重複は Set で丸める。
const MENTION_RE = /(?<![a-zA-Z0-9_])@([a-zA-Z0-9_]{3,15})(?![a-zA-Z0-9_])/g;
function extractMentionHandles(body: string): string[] {
  const set = new Set<string>();
  for (const m of body.matchAll(MENTION_RE)) {
    if (m[1]) set.add(m[1]);
  }
  return [...set];
}

// tweet を 1 件作成し、mention 抽出 → mentions insert → 通知発火まで束ねる。
// parentId 有りなら reply として parent 存在確認 + reply 通知、mention は reply 通知と dedupe する。
export async function createTweet(
  db: DB,
  input: CreateTweetWire,
  currentUserId: string,
): Promise<Tweet> {
  // parentId 有りなら dangling reply 防止で先に親確認。
  let parentAuthorId: string | null = null;
  if (input.parentId) {
    const parent = await tweetsService.findById(db, input.parentId);
    if (!parent) throw ApiError.notFound("parent tweet not found");
    parentAuthorId = parent.authorId;
  }

  const created = await tweetsService.create(db, input, currentUserId);

  // mediaIds が来てれば current user が上げた orphan media を tweet に紐付ける (uploader 権限確認込み)。
  // 別 uploader / 既 attach 済 / 存在しない id は attachToTweet 側で silently skip される。
  if (input.mediaIds.length > 0) {
    await mediaRepository.attachToTweet(
      db,
      input.mediaIds,
      created.id,
      currentUserId,
    );
  }

  // mention 抽出 → 実在する handle だけ userId に解決。存在しない handle は無視 (tweet 自体は成立)。
  const handles = extractMentionHandles(input.body);
  const mentionedUserIds: string[] = [];
  if (handles.length > 0) {
    const profileRows = await profilesRepository.findByHandles(db, handles);
    for (const row of profileRows) {
      mentionedUserIds.push(row.profile.userId);
    }
    if (mentionedUserIds.length > 0) {
      await mentionsRepository.insertMany(
        db,
        mentionedUserIds.map((id) => ({
          tweetId: created.id,
          mentionedUserId: id,
        })),
      );
    }
  }

  // reply 通知は parent author (自分以外) にだけ発火。
  if (parentAuthorId && parentAuthorId !== currentUserId) {
    await notificationsService.record(db, {
      kind: "reply",
      recipientId: parentAuthorId,
      actorId: currentUserId,
    });
  }
  // mention 通知は self と parent author (reply 通知が別途飛ぶ) を除外して発火する dedupe。
  for (const uid of mentionedUserIds) {
    if (uid === currentUserId) continue;
    if (uid === parentAuthorId) continue;
    await notificationsService.record(db, {
      kind: "mention",
      recipientId: uid,
      actorId: currentUserId,
    });
  }

  return created;
}
