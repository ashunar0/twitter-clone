import { AtSign, Heart, MessageCircle, Repeat2, UserPlus } from "lucide-react";
import type { ComponentType, SVGProps } from "react";

// kind ごとの見た目メタ (icon / 色 / 文言)。suffix は actor 表示の直後に続く固定文言。
// schema.kind は string なので、未知 kind の時は default にフォールバックする使い方を想定。
export type KindMeta = {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  colorClass: string;
  suffix: string;
};

export const KIND_META: Record<string, KindMeta> = {
  follow: {
    icon: UserPlus,
    colorClass: "text-brand-blue",
    suffix: "にフォローされました",
  },
  like: {
    icon: Heart,
    colorClass: "text-pink-500",
    suffix: "があなたのツイートをいいねしました",
  },
  retweet: {
    icon: Repeat2,
    colorClass: "text-emerald-500",
    suffix: "があなたのツイートをリツイートしました",
  },
  reply: {
    icon: MessageCircle,
    colorClass: "text-brand-blue",
    suffix: "があなたのツイートに返信しました",
  },
  mention: {
    icon: AtSign,
    colorClass: "text-brand-blue",
    suffix: "があなたにメンションしました",
  },
};
