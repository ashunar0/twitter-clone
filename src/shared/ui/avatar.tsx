import type { HTMLAttributes, ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
type AvatarShape = "circle" | "rounded" | "square";

const sizeClasses: Record<AvatarSize, string> = {
  xs: "size-6 text-[10px]",
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-12 text-base",
  xl: "size-16 text-xl",
  "2xl": "size-20 text-2xl",
};

const shapeClasses: Record<AvatarShape, string> = {
  circle: "rounded-full",
  rounded: "rounded-md",
  square: "rounded-none",
};

type RootProps = HTMLAttributes<HTMLSpanElement> & {
  size?: AvatarSize;
  shape?: AvatarShape;
};

function Root({
  size = "md",
  shape = "circle",
  className,
  ...props
}: RootProps) {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden bg-active font-medium text-fg-soft select-none",
        sizeClasses[size],
        shapeClasses[shape],
        className,
      )}
      {...props}
    />
  );
}

function Image({
  className,
  alt = "",
  ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      alt={alt}
      className={cn(
        "absolute inset-0 size-full object-cover",
        className,
      )}
      {...props}
    />
  );
}

type FallbackProps = HTMLAttributes<HTMLSpanElement> & {
  name?: string;
};

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((word) => word[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function Fallback({ name, children, className, ...props }: FallbackProps) {
  return (
    <span
      className={cn(
        "absolute inset-0 flex items-center justify-center",
        className,
      )}
      {...props}
    >
      {children ?? (name ? getInitials(name) : null)}
    </span>
  );
}

export const Avatar = {
  Root,
  Image,
  Fallback,
};
