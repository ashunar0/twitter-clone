// Node (dev / seed) と Cloudflare R2 (prod) を同じ interface で扱う storage 抽象。
// db.ts と同じ考え方: type だけ共通、実装は entry file が差し替える。
export type Storage = {
  // key で 1 object を保存 (上書き)。key は uuid + 拡張子 想定。
  put(key: string, body: Uint8Array, mimeType: string): Promise<void>;
  // client 側が表示するときの URL (public bucket 前提)。
  // - dev: "/dev-uploads/<key>" — Vite が public/ を配る
  // - prod: "<MEDIA_PUBLIC_URL>/<key>" — R2 public bucket
  publicUrl(key: string): string;
};
