import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type AlertVariant = "neutral" | "success" | "danger" | "warning" | "info";

const VARIANT_CLASSES: Record<AlertVariant, string> = {
  neutral:
    "border-border bg-surface text-fg [&_[data-alert-icon]]:text-fg-muted",
  success:
    "border-success-border bg-success-subtle text-success-fg [&_[data-alert-icon]]:text-success-fg",
  danger:
    "border-danger-border bg-danger-subtle text-danger-fg [&_[data-alert-icon]]:text-danger-fg",
  warning:
    "border-warning-border bg-warning-subtle text-warning-fg [&_[data-alert-icon]]:text-warning-fg",
  info:
    "border-info-border bg-info-subtle text-info-fg [&_[data-alert-icon]]:text-info-fg",
};

type RootProps = HTMLAttributes<HTMLDivElement> & {
  variant?: AlertVariant;
};

function Root({ variant = "neutral", className, ...props }: RootProps) {
  return (
    <div
      role="alert"
      className={cn(
        "grid grid-cols-[1.25rem_1fr] items-start gap-x-3 gap-y-1 rounded-md border p-4 text-sm",
        VARIANT_CLASSES[variant],
        className,
      )}
      {...props}
    />
  );
}

function Icon({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      data-alert-icon
      className={cn(
        "col-start-1 row-start-1 flex size-5 items-center justify-center [&>svg]:size-5",
        className,
      )}
      {...props}
    />
  );
}

function Title({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "col-start-2 font-medium leading-5 tracking-tight",
        className,
      )}
      {...props}
    />
  );
}

function Description({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("col-start-2 text-sm leading-5 opacity-90", className)}
      {...props}
    />
  );
}

function Actions({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "col-start-2 mt-2 flex flex-wrap items-center gap-2",
        className,
      )}
      {...props}
    />
  );
}

export const Alert = { Root, Icon, Title, Description, Actions };
