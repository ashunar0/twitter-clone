import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { Storage } from "./storage";

// Node dev 用の storage impl。R2 の代わりに `public/dev-uploads/` に書く。
// Vite dev server が public/ を "/" 直下で serve するので、`/dev-uploads/<key>` で FE から読める。
// prod (Workers) では R2 binding 版 (storage-worker.ts) が使われる。
export function createNodeStorage(): Storage {
  const dir = join(process.cwd(), "public", "dev-uploads");
  return {
    async put(key, body, _mimeType) {
      await mkdir(dir, { recursive: true });
      await writeFile(join(dir, key), body);
    },
    publicUrl(key) {
      return `/dev-uploads/${key}`;
    },
  };
}
