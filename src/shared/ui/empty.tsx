import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

function Root({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-md border border-dashed border-border bg-surface p-12 text-center",
        className,
      )}
      {...props}
    />
  );
}

function Icon({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex size-12 items-center justify-center rounded-full bg-surface-sunken text-fg-muted [&>svg]:size-6",
        className,
      )}
      {...props}
    />
  );
}

function Title({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "text-base font-semibold tracking-tight text-fg",
        className,
      )}
      {...props}
    />
  );
}

function Description({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("max-w-sm text-sm text-fg-muted", className)}
      {...props}
    />
  );
}

function Actions({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "mt-2 flex flex-wrap items-center justify-center gap-2",
        className,
      )}
      {...props}
    />
  );
}

export const Empty = { Root, Icon, Title, Description, Actions };
