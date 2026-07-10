import { throwIfNotOk } from "@/lib/hono/apiError";
import type { MediaWire } from "../schema";

// POST /api/media は multipart。Hono client の型は zValidator("form") 前提なのでここは
// 素の fetch を使う (route が form parser を直接叩いてる構成に合わせる)。
// 失敗時は throwIfNotOk が body を parse して ApiError を throw する (rpc 規約に揃える)。
export const mediaRpc = {
  async upload(file: File): Promise<MediaWire> {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/media", {
      method: "POST",
      body: form,
      credentials: "include",
    });
    await throwIfNotOk(res);
    return (await res.json()) as MediaWire;
  },
};
