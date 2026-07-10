import { z } from "zod";

// upload response の wire 形。id は tweet の mediaIds に含めて紐付ける。
// url は表示に使う (dev: /dev-uploads/<key>、prod: R2 public URL)。
export const mediaWireSchema = z.object({
  id: z.string(),
  url: z.string(),
  mimeType: z.string(),
});
export type MediaWire = z.infer<typeof mediaWireSchema>;

// 別 feature (tweets) から使う summary shape (list enrichment 用)。
// owning feature = media、他 feature は inline object で持たずこの型を import。
export const mediaSummarySchema = z.object({
  id: z.string(),
  url: z.string(),
  mimeType: z.string(),
});
export type MediaSummary = z.infer<typeof mediaSummarySchema>;

// 受け付け mime type (image のみ、規約検証範囲を絞る)。
export const ACCEPTED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
// 上限 5 MB (Worker payload 制限 + R2 free tier 想定)。
export const MAX_MEDIA_BYTES = 5 * 1024 * 1024;
