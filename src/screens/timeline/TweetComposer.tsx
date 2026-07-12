import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
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
} from "@features/media/schema";
import { toaster } from "@/shared/ui/toast";

const MAX_LENGTH = 280;
const MAX_MEDIA = 4;

// composer 内で 1 個の添付を管理する軽量エントリ。
// - localKey: React key 用の一意 id (upload 前でも安定)
// - previewUrl: URL.createObjectURL(file) の blob:...、即描画に使う
// - status: uploading → done で mediaId を持つ、error なら状態表示
type Attachment = {
  localKey: string;
  file: File;
  previewUrl: string;
} & (
  | { status: "uploading" }
  | { status: "done"; mediaId: string }
  | { status: "error"; message: string }
);

// timeline / reply の投稿フォーム (Twitter 風レイアウト)。
// - 左: current user の avatar
// - 右: 見出しなしの textarea + media プレビュー + action row (画像ボタン / count / Post)
// media は選択直後に blob URL で即プレビュー (server URL を待たない = Vite dev の race や propagation 遅延を回避)、
// upload は裏で走らせて mediaId を後から埋める。投稿は全 attachment が done になってから許可する。
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
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploading = attachments.some((a) => a.status === "uploading");
  const hasError = attachments.some((a) => a.status === "error");

  const disabled =
    !currentProfile ||
    createTweet.isPending ||
    uploading ||
    hasError ||
    (body.trim().length === 0 && attachments.length === 0);

  // localKey で対象を特定して 1 個だけ書き換える。他エントリの参照は保つ (プレビュー img の再ロードを防ぐ)。
  const patchAttachment = (localKey: string, patch: Partial<Attachment>) =>
    setAttachments((prev) =>
      prev.map((a) => (a.localKey === localKey ? ({ ...a, ...patch } as Attachment) : a)),
    );

  // file 選択時: 最大数まで足す。それぞれ即 blob URL を作って表示、upload は個別に非同期で走らせる。
  const onFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;
    const room = MAX_MEDIA - attachments.length;
    const target = files.slice(0, room);

    const validated: Attachment[] = [];
    for (const f of target) {
      // format / size を先に弾く、通ったら uploading エントリとして表示に載せる。
      if (
        !ACCEPTED_MIME_TYPES.includes(
          f.type as (typeof ACCEPTED_MIME_TYPES)[number],
        )
      ) {
        toaster.create({
          type: "error",
          title: "画像アップロードに失敗しました",
          description: "対応外の形式です (jpg/png/webp/gif)",
        });
        continue;
      }
      if (f.size > MAX_MEDIA_BYTES) {
        toaster.create({
          type: "error",
          title: "画像アップロードに失敗しました",
          description: "ファイルが大きすぎます (5MB まで)",
        });
        continue;
      }
      validated.push({
        localKey: cryptoRandomId(),
        file: f,
        previewUrl: URL.createObjectURL(f),
        status: "uploading",
      });
    }
    if (validated.length === 0) return;
    setAttachments((prev) => [...prev, ...validated]);

    // 個別 upload。complete したら mediaId を埋める、失敗したら error 状態に。
    for (const entry of validated) {
      mediaRpc
        .upload(entry.file)
        .then((wire) =>
          patchAttachment(entry.localKey, { status: "done", mediaId: wire.id }),
        )
        .catch((err) => {
          patchAttachment(entry.localKey, {
            status: "error",
            message: err instanceof Error ? err.message : "upload failed",
          });
          toaster.create({
            type: "error",
            title: "画像アップロードに失敗しました",
            description: err instanceof Error ? err.message : undefined,
          });
        });
    }
  };

  const onRemoveAttachment = (localKey: string) => {
    setAttachments((prev) => {
      const target = prev.find((a) => a.localKey === localKey);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((a) => a.localKey !== localKey);
    });
  };

  // unmount 時に残った blob URL を全て解放する (メモリリーク防止)。
  useEffect(() => {
    return () => {
      setAttachments((prev) => {
        for (const a of prev) URL.revokeObjectURL(a.previewUrl);
        return prev;
      });
    };
  }, []);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (disabled || !currentProfile) return;
    const mediaIds = attachments
      .filter((a): a is Attachment & { status: "done"; mediaId: string } => a.status === "done")
      .map((a) => a.mediaId);
    createTweet.mutate(
      {
        body: body.trim(),
        parentId: parentId ?? null,
        mediaIds,
      },
      {
        onSuccess: () => {
          setBody("");
          // blob URL は全て解放してから attachments を空にする。
          for (const a of attachments) URL.revokeObjectURL(a.previewUrl);
          setAttachments([]);
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
          <Avatar.Image
            src={currentProfile.avatarUrl}
            alt={currentProfile.name}
          />
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
        {attachments.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {attachments.map((a) => (
              <div key={a.localKey} className="relative">
                <img
                  src={a.previewUrl}
                  alt=""
                  className={`h-24 w-24 rounded-md object-cover ${a.status === "uploading" ? "opacity-70" : ""} ${a.status === "error" ? "opacity-50 outline outline-red-500" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => onRemoveAttachment(a.localKey)}
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
            disabled={attachments.length >= MAX_MEDIA}
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
            disabled={attachments.length >= MAX_MEDIA}
          />
          <div className="flex items-center gap-3 text-xs text-fg-muted">
            <span>
              {body.length}/{MAX_LENGTH}
            </span>
            <Button
              type="submit"
              className="rounded-full bg-brand-blue font-bold text-white hover:bg-brand-blue-dark"
              disabled={disabled}
              loading={createTweet.isPending}
            >
              {submitLabel ?? "ツイートする"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}

// crypto.randomUUID が使える環境なら使う、fallback は timestamp + random (React key 用の一意性で十分)。
function cryptoRandomId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
