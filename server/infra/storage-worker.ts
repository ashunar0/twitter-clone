import type { Storage } from "./storage";

// Cloudflare Workers 用の storage impl。env.MEDIA_BUCKET (R2 binding) に put する。
// publicUrl は wrangler.jsonc の vars.MEDIA_PUBLIC_URL (R2 public bucket) を base に組み立てる。
export function createWorkerStorage(
  bucket: R2Bucket,
  publicUrlBase: string,
): Storage {
  return {
    async put(key, body, mimeType) {
      await bucket.put(key, body, { httpMetadata: { contentType: mimeType } });
    },
    publicUrl(key) {
      return `${publicUrlBase}/${key}`;
    },
  };
}
