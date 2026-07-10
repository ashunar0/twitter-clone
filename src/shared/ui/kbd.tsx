import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

function Kbd({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <kbd
      className={cn(
        "inline-flex h-5 min-w-5 select-none items-center justify-center rounded border border-border bg-surface px-1.5 font-sans text-[11px] font-medium leading-none text-fg-soft shadow-[0_1px_0_var(--color-border)]",
        className,
      )}
      {...props}
    />
  );
}

export { Kbd };
