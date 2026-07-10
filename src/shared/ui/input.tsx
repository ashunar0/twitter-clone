import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type InputVariant = "outline" | "subtle" | "flushed";
type InputSize = "xs" | "sm" | "md" | "lg";

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  variant?: InputVariant;
  size?: InputSize;
  invalid?: boolean;
};

const sizeClasses: Record<InputSize, string> = {
  xs: "h-7 text-xs",
  sm: "h-8 text-sm",
  md: "h-10 text-sm",
  lg: "h-12 text-base",
};

const paddingClasses: Record<InputVariant, Record<InputSize, string>> = {
  outline: { xs: "px-2", sm: "px-2.5", md: "px-3", lg: "px-4" },
  subtle: { xs: "px-2", sm: "px-2.5", md: "px-3", lg: "px-4" },
  flushed: { xs: "px-3", sm: "px-3", md: "px-3", lg: "px-3" },
};

const variantClasses: Record<InputVariant, string> = {
  outline:
    "rounded-sm border border-border bg-surface focus:ring-2 focus:ring-fg-subtle aria-invalid:border-danger-border aria-invalid:focus:ring-danger-border",
  subtle:
    "rounded-sm border border-transparent bg-hover focus:bg-surface focus:ring-2 focus:ring-fg-subtle aria-invalid:bg-danger-subtle aria-invalid:text-danger-fg",
  flushed:
    "rounded-none border-b border-border bg-transparent focus:border-fg-soft aria-invalid:border-danger-border",
};

function Input({
  variant = "outline",
  size = "md",
  invalid,
  className,
  ...props
}: InputProps) {
  return (
    <input
      aria-invalid={invalid || props["aria-invalid"]}
      className={cn(
        "flex w-full py-2 text-fg placeholder:text-fg-subtle focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        sizeClasses[size],
        paddingClasses[variant][size],
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}

export { Input };
