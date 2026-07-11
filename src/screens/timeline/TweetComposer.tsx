import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { ImagePlus, User, X } from "lucide-react";
import { Avatar } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import { IconButton } from "@/shared/ui/icon-button";
import { useCurrentProfileQuery } from "@features/profiles/client/queries";
import { useCreateTweetMutation } from "@features/tweets/client/mutations";
import { mediaRpc } from "@features/media/client/rpc";
import {
  ACCEPTED_MIME_TYPES,
  MAX_MEDIA_BYTES,
  type MediaWire,
} from "@features/media/schema";
import { toaster } from "@/shared/ui/toast";

const MAX_LENGTH = 280;
const MAX_MEDIA = 4;

// timeline / reply の投稿フォーム (Twitter 風レイアウト)。
// - 左: current user の avatar
// - 右: 見出しなしの textarea + media プレビュー + action row (画像ボタン / count / Post)
// parentId 有りなら reply、無しなら top-level。media は file 選択時に即 upload → 得た id を作成時に渡す。
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
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const disabled =
    !currentProfile ||
    createTweet.isPending ||
    uploading ||
    (body.trim().length === 0 && uploaded.length === 0);

  // file 選択時にすぐ upload → uploaded list に足す (最大 MAX_MEDIA)。失敗は toast で返す。
  const onFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;
    const room = MAX_MEDIA - uploaded.length;
    const target = files.slice(0, room);
    setUploading(true);
    try {
      const results: MediaWire[] = [];
      for (const f of target) {
        if (
          !ACCEPTED_MIME_TYPES.includes(
            f.type as (typeof ACCEPTED_MIME_TYPES)[number],
          )
        ) {
          throw new Error("対応外の形式です (jpg/png/webp/gif)");
        }
        if (f.size > MAX_MEDIA_BYTES) {
          throw new Error("ファイルが大きすぎます (5MB まで)");
        }
        results.push(await mediaRpc.upload(f));
      }
      setUploaded((prev) => [...prev, ...results]);
    } catch (err) {
      toaster.create({
        type: "error",
        title: "画像アップロードに失敗しました",
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setUploading(false);
    }
  };

  const onRemoveMedia = (id: string) =>
    setUploaded((prev) => prev.filter((m) => m.id !== id));

  // form submit を止めて mutation 発火、成功で state を clear + 親に通知。
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
        onError: () => {
          toaster.create({ type: "error", title: "投稿に失敗しました" });
        },
      },
    );
  };

  return (
    <form
      onSubmit={onSubmit}
      className="flex items-start gap-3 border-b border-border px-4 py-3"
    >
      <Avatar.Root className="size-10 shrink-0">
        {currentProfile?.avatarUrl ? (
          <Avatar.Image src={currentProfile.avatarUrl} alt={currentProfile.name} />
        ) : null}
        <Avatar.Fallback>
          <User className="size-5 text-fg-subtle" aria-hidden />
        </Avatar.Fallback>
      </Avatar.Root>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        {/* avatar (size-10 = 40px) と placeholder の視覚中心を揃えるため、
            textarea を単一行スタート (rows=1) + min-h-10 + py-2 で高さ 40px 相当に寄せる。
            入力量に応じて自然に高さが伸びるように resize-none + auto rows は保つ。 */}
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={placeholder ?? "いまどうしてる？"}
          maxLength={MAX_LENGTH}
          rows={1}
          disabled={!currentProfile}
          className="min-h-10 w-full resize-none bg-transparent py-2 text-lg leading-6 text-fg placeholder:text-fg-subtle focus:outline-none disabled:opacity-50"
        />
        {uploaded.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {uploaded.map((m) => (
              <div key={m.id} className="relative">
                <img
                  src={m.url}
                  alt=""
                  className="h-24 w-24 rounded-md object-cover"
                />
                <button
                  type="button"
                  onClick={() => onRemoveMedia(m.id)}
                  className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-fg/80 text-surface hover:bg-fg"
                  aria-label="画像を外す"
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}
          </div>
        ) : null}
        <div className="flex items-center justify-between">
          <IconButton
            type="button"
            variant="ghost"
            size="sm"
            aria-label="画像を追加"
            disabled={uploaded.length >= MAX_MEDIA || uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            <ImagePlus className="size-4" />
          </IconButton>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_MIME_TYPES.join(",")}
            multiple
            className="hidden"
            onChange={onFileChange}
            disabled={uploaded.length >= MAX_MEDIA || uploading}
          />
          <div className="flex items-center gap-3 text-xs text-fg-muted">
            <span>
              {body.length}/{MAX_LENGTH}
            </span>
            <Button
              type="submit"
              className="rounded-full font-bold"
              disabled={disabled}
              loading={createTweet.isPending}
            >
              {submitLabel ?? "ポスト"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
