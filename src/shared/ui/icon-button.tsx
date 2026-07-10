import type { ButtonHTMLAttributes } from "react";
import {
  buttonStyles,
  type ButtonColorPalette,
  type ButtonVariant,
} from "@/shared/ui/button";
import { Spinner } from "@/shared/ui/spinner";
import { Slot } from "@/lib/slot";
import { cn } from "@/lib/utils";

type Size = "xs" | "sm" | "md" | "lg";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  "aria-label": string;
  variant?: ButtonVariant;
  colorPalette?: ButtonColorPalette;
  size?: Size;
  loading?: boolean;
  asChild?: boolean;
};

const sizeClasses: Record<Size, string> = {
  xs: "size-6 text-xs",
  sm: "size-7 text-sm",
  md: "size-8 text-sm",
  lg: "size-10 text-base",
};

export function IconButton({
  variant = "ghost",
  colorPalette = "neutral",
  size = "md",
  loading = false,
  asChild = false,
  disabled,
  className,
  type,
  children,
  ...props
}: IconButtonProps) {
  const Comp = asChild ? Slot : "button";
  const isDisabled = disabled || loading;
  return (
    <Comp
      className={cn(
        "inline-flex cursor-pointer items-center justify-center rounded-md transition-colors disabled:pointer-events-none disabled:opacity-50",
        sizeClasses[size],
        buttonStyles[variant][colorPalette],
        className,
      )}
      data-loading={loading || undefined}
      aria-busy={loading || undefined}
      disabled={isDisabled}
      {...(asChild ? {} : { type: type ?? "button" })}
      {...props}
    >
      {loading ? <Spinner className="size-4" /> : children}
    </Comp>
  );
}
