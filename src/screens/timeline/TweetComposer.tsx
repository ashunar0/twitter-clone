import { useState, type ChangeEvent, type FormEvent } from "react";
import { Button } from "@/shared/ui/button";
import { useCurrentProfileQuery } from "@features/profiles/client/queries";
import { useCreateTweetMutation } from "@features/tweets/client/mutations";
import { mediaRpc } from "@features/media/client/rpc";
import {
  ACCEPTED_MIME_TYPES,
  MAX_MEDIA_BYTES,
  type MediaWire,
} from "@features/media/schema";

const MAX_LENGTH = 280;
const MAX_MEDIA = 4;

// 投稿フォーム。parentId 有りなら reply、無しなら top-level tweet。
// media は file 選択時に即 upload (orphan media 行を作る) → 得た id 配列を tweet 作成時に渡す。
// current user が取れるまで disabled、送信成功で textarea / uploaded をクリア + optional onSubmitted 呼出。
export function TweetComposer({
  parentId,
  onSubmitted,
  placeholder,
  submitLabel,
}: {
  parentId?: string;
  onSubmitted?: () => void;
  placeholder?: string;
  submitLabel?: string;
} = {}) {
  const currentProfileQuery = useCurrentProfileQuery();
  const currentProfile = currentProfileQuery.data;
  const createTweet = useCreateTweetMutation(currentProfile!);

  const [body, setBody] = useState("");
  const [uploaded, setUploaded] = useState<MediaWire[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const disabled =
    !currentProfile ||
    createTweet.isPending ||
    uploading ||
    (body.trim().length === 0 && uploaded.length === 0);

  // file 選択時にすぐ upload → uploaded list に足す (最大 MAX_MEDIA)。BE 側 schema と同じ制約を FE でも先取りする。
  const onFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;
    const room = MAX_MEDIA - uploaded.length;
    const target = files.slice(0, room);
    setUploadError(null);
    setUploading(true);
    try {
      const results: MediaWire[] = [];
      for (const f of target) {
        if (
          !ACCEPTED_MIME_TYPES.includes(
            f.type as (typeof ACCEPTED_MIME_TYPES)[number],
          )
        ) {
          throw new Error("対応外の形式なのだ (jpg/png/webp/gif)");
        }
        if (f.size > MAX_MEDIA_BYTES) {
          throw new Error("ファイルが大きすぎるのだ (5MB まで)");
        }
        results.push(await mediaRpc.upload(f));
      }
      setUploaded((prev) => [...prev, ...results]);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "upload に失敗");
    } finally {
      setUploading(false);
    }
  };

  const onRemoveMedia = (id: string) =>
    setUploaded((prev) => prev.filter((m) => m.id !== id));

  // form submit を止めて mutation を発火、成功したら state をクリアして親に通知。
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (disabled || !currentProfile) return;
    createTweet.mutate(
      {
        body: body.trim(),
        parentId: parentId ?? null,
        mediaIds: uploaded.map((m) => m.id),
      },
      {
        onSuccess: () => {
          setBody("");
          setUploaded([]);
          onSubmitted?.();
        },
      },
    );
  };

  return (
    <form onSubmit={onSubmit} className="mb-6 flex flex-col gap-2">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={
          currentProfile
            ? (placeholder ?? "What's happening?")
            : "Loading…"
        }
        maxLength={MAX_LENGTH}
        rows={3}
        disabled={!currentProfile}
        className="w-full rounded-lg border border-neutral-300 p-3 focus:border-neutral-500 focus:outline-none"
      />
      {uploaded.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {uploaded.map((m) => (
            <div key={m.id} className="relative">
              <img
                src={m.url}
                alt=""
                className="h-20 w-20 rounded object-cover"
              />
              <button
                type="button"
                onClick={() => onRemoveMedia(m.id)}
                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-neutral-900 text-xs text-white"
                aria-label="Remove image"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-neutral-500">
          <label className="cursor-pointer text-sky-600 hover:underline">
            画像を追加
            <input
              type="file"
              accept={ACCEPTED_MIME_TYPES.join(",")}
              multiple
              className="hidden"
              onChange={onFileChange}
              disabled={uploaded.length >= MAX_MEDIA || uploading}
            />
          </label>
          <span>
            {body.length}/{MAX_LENGTH}
          </span>
          {uploading && <span>uploading…</span>}
        </div>
        <Button type="submit" disabled={disabled} loading={createTweet.isPending}>
          {submitLabel ?? "Tweet"}
        </Button>
      </div>
      {uploadError && <div className="text-sm text-red-600">{uploadError}</div>}
      {createTweet.isError ? (
        <div className="text-sm text-red-600">投稿に失敗した。もう一度。</div>
      ) : null}
    </form>
  );
}
