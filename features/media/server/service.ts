import { ApiError } from "../../../server/lib/errors";
import type { DB } from "../../../server/infra/db";
import type { Storage } from "../../../server/infra/storage";
import type { MediaWire } from "../schema";
import { ACCEPTED_MIME_TYPES, MAX_MEDIA_BYTES } from "../schema";
import { mediaRepository, type StoredMedia } from "./repository";

// mime type から storage key 用の拡張子を返す (簡易 mapping、"." 込みで)。
function extFromMime(mime: string): string {
  if (mime === "image/jpeg") return ".jpg";
  if (mime === "image/png") return ".png";
  if (mime === "image/webp") return ".webp";
  if (mime === "image/gif") return ".gif";
  return "";
}

// DB row → wire 形。url は storage.publicUrl で解決する (dev/prod で異なる base)。
function toWire(row: StoredMedia, storage: Storage): MediaWire {
  return {
    id: row.id,
    url: storage.publicUrl(row.r2Key),
    mimeType: row.mimeType,
  };
}

export const mediaService = {
  // multipart form の file を storage に put → media 行を uploaderId で作成し、wire を返す。
  // tweetId=null で作られ、後で tweets 側 usecase が attachToTweet で紐付ける。
  async upload(
    db: DB,
    storage: Storage,
    file: File,
    currentUserId: string,
  ): Promise<MediaWire> {
    if (!ACCEPTED_MIME_TYPES.includes(file.type as (typeof ACCEPTED_MIME_TYPES)[number])) {
      throw ApiError.validationFailed({ file: "unsupported mime type" });
    }
    if (file.size > MAX_MEDIA_BYTES) {
      throw ApiError.validationFailed({ file: "file too large" });
    }
    const id = crypto.randomUUID();
    const key = `${id}${extFromMime(file.type)}`;
    const bytes = new Uint8Array(await file.arrayBuffer());
    await storage.put(key, bytes, file.type);
    const row = await mediaRepository.insert(db, {
      id,
      uploaderId: currentUserId,
      tweetId: null,
      r2Key: key,
      mimeType: file.type,
    });
    return toWire(row, storage);
  },
  // enrichment: 複数 tweetId ごとの MediaSummary[] を Map で返す (N+1 回避)。
  async listByTweetIds(
    db: DB,
    storage: Storage,
    tweetIds: string[],
  ): Promise<Map<string, MediaWire[]>> {
    const rows = await mediaRepository.findByTweetIds(db, tweetIds);
    const map = new Map<string, MediaWire[]>();
    for (const r of rows) {
      if (!r.tweetId) continue;
      const arr = map.get(r.tweetId) ?? [];
      arr.push(toWire(r, storage));
      map.set(r.tweetId, arr);
    }
    return map;
  },
};
