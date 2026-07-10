import type { Ref, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type TextareaVariant = "outline" | "subtle" | "flushed";
type TextareaSize = "xs" | "sm" | "md" | "lg";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  variant?: TextareaVariant;
  size?: TextareaSize;
  invalid?: boolean;
  ref?: Ref<HTMLTextAreaElement>;
};

const sizeClasses: Record<TextareaSize, string> = {
  xs: "min-h-16 text-xs",
  sm: "min-h-20 text-sm",
  md: "min-h-24 text-sm",
  lg: "min-h-32 text-base",
};

const paddingClasses: Record<TextareaVariant, Record<TextareaSize, string>> = {
  outline: { xs: "px-2", sm: "px-2.5", md: "px-3", lg: "px-4" },
  subtle: { xs: "px-2", sm: "px-2.5", md: "px-3", lg: "px-4" },
  flushed: { xs: "px-3", sm: "px-3", md: "px-3", lg: "px-3" },
};

const variantClasses: Record<TextareaVariant, string> = {
  outline:
    "rounded-sm border border-border bg-surface focus:ring-2 focus:ring-fg-subtle aria-invalid:border-danger-border aria-invalid:focus:ring-danger-border",
  subtle:
    "rounded-sm border border-transparent bg-hover focus:bg-surface focus:ring-2 focus:ring-fg-subtle aria-invalid:bg-danger-subtle aria-invalid:text-danger-fg",
  flushed:
    "rounded-none border-b border-border bg-transparent focus:border-fg-soft aria-invalid:border-danger-border",
};

function Textarea({
  variant = "outline",
  size = "md",
  invalid,
  className,
  ...props
}: TextareaProps) {
  return (
    <textarea
      aria-invalid={invalid || props["aria-invalid"]}
      className={cn(
        "flex w-full resize-y py-2 text-fg placeholder:text-fg-subtle focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        sizeClasses[size],
        paddingClasses[variant][size],
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
