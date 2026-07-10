"use client";

import { Toggle as ArkToggle } from "@ark-ui/react/toggle";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

function Root({
  className,
  ...props
}: ComponentProps<typeof ArkToggle.Root>) {
  return (
    <ArkToggle.Root
      className={cn(
        "inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-border bg-surface px-3 text-sm font-medium text-fg-soft outline-none transition-colors",
        "hover:bg-hover hover:text-fg",
        "focus-visible:ring-2 focus-visible:ring-fg/30",
        "data-[state=on]:border-fg data-[state=on]:bg-fg data-[state=on]:text-bg",
        "data-disabled:cursor-not-allowed data-disabled:opacity-50 data-disabled:hover:bg-surface data-disabled:hover:text-fg-soft",
        className,
      )}
      {...props}
    />
  );
}

function Indicator({
  className,
  ...props
}: ComponentProps<typeof ArkToggle.Indicator>) {
  return (
    <ArkToggle.Indicator
      className={cn("inline-flex items-center justify-center", className)}
      {...props}
    />
  );
}

const Context = ArkToggle.Context;

export const Toggle = {
  Root,
  Indicator,
  Context,
};
