"use client";

import { ToggleGroup as ArkToggleGroup } from "@ark-ui/react/toggle-group";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

function Root({
  className,
  ...props
}: ComponentProps<typeof ArkToggleGroup.Root>) {
  return (
    <ArkToggleGroup.Root
      className={cn(
        "inline-flex w-fit items-center overflow-hidden rounded-md border border-border bg-surface",
        "data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

function Item({
  className,
  ...props
}: ComponentProps<typeof ArkToggleGroup.Item>) {
  return (
    <ArkToggleGroup.Item
      className={cn(
        "inline-flex h-9 items-center justify-center gap-1.5 border-l border-border px-3 text-sm font-medium text-fg-soft outline-none transition-colors first:border-l-0",
        "hover:bg-hover hover:text-fg",
        "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-fg/30",
        "data-[state=on]:bg-fg data-[state=on]:text-bg data-[state=on]:hover:bg-fg data-[state=on]:hover:text-bg",
        "data-disabled:cursor-not-allowed data-disabled:opacity-50 data-disabled:hover:bg-transparent data-disabled:hover:text-fg-soft",
        className,
      )}
      {...props}
    />
  );
}

const Context = ArkToggleGroup.Context;
const RootProvider = ArkToggleGroup.RootProvider;

export const ToggleGroup = {
  Root,
  RootProvider,
  Item,
  Context,
};
