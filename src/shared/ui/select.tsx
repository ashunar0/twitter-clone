"use client";

import { Portal } from "@ark-ui/react/portal";
import {
  Select as ArkSelect,
  createListCollection,
  type CollectionItem,
} from "@ark-ui/react/select";
import { type ComponentProps, createContext, useContext } from "react";
import { cn } from "@/lib/utils";

type SelectSize = "xs" | "sm" | "md" | "lg";

const SelectSizeContext = createContext<SelectSize>("md");
const useSelectSize = () => useContext(SelectSizeContext);

type RootProps<T extends CollectionItem> = ArkSelect.RootProps<T> & {
  size?: SelectSize;
};

function Root<T extends CollectionItem>({
  size = "md",
  className,
  ...props
}: RootProps<T>) {
  return (
    <SelectSizeContext.Provider value={size}>
      <ArkSelect.Root
        className={cn("flex flex-col gap-2", className)}
        {...props}
      />
    </SelectSizeContext.Provider>
  );
}

function Label({
  className,
  ...props
}: ComponentProps<typeof ArkSelect.Label>) {
  return (
    <ArkSelect.Label
      className={cn("block text-sm font-medium text-fg", className)}
      {...props}
    />
  );
}

function Control({
  className,
  ...props
}: ComponentProps<typeof ArkSelect.Control>) {
  return (
    <ArkSelect.Control
      className={cn("relative inline-flex items-center", className)}
      {...props}
    />
  );
}

const triggerSizeClasses: Record<SelectSize, string> = {
  xs: "h-7 px-2 text-xs",
  sm: "h-8 px-2.5 text-sm",
  md: "h-10 px-3 text-sm",
  lg: "h-12 px-4 text-base",
};

function Trigger({
  className,
  ...props
}: ComponentProps<typeof ArkSelect.Trigger>) {
  const size = useSelectSize();
  return (
    <ArkSelect.Trigger
      className={cn(
        "inline-flex cursor-pointer items-center justify-between gap-2 rounded-md border border-border bg-surface text-fg outline-none transition-colors",
        "hover:bg-hover",
        "focus-visible:ring-2 focus-visible:ring-fg/20",
        "data-disabled:cursor-not-allowed data-disabled:opacity-50",
        "data-placeholder-shown:text-fg-muted",
        triggerSizeClasses[size],
        className,
      )}
      {...props}
    />
  );
}

function ValueText({
  className,
  ...props
}: ComponentProps<typeof ArkSelect.ValueText>) {
  return (
    <ArkSelect.ValueText className={cn("truncate", className)} {...props} />
  );
}

function Indicator({
  className,
  ...props
}: ComponentProps<typeof ArkSelect.Indicator>) {
  return (
    <ArkSelect.Indicator
      className={cn(
        "text-fg-muted transition-transform data-[state=open]:rotate-180",
        className,
      )}
      {...props}
    />
  );
}

function ClearTrigger({
  className,
  ...props
}: ComponentProps<typeof ArkSelect.ClearTrigger>) {
  return (
    <ArkSelect.ClearTrigger
      className={cn(
        "inline-flex size-5 cursor-pointer items-center justify-center rounded text-fg-muted hover:bg-hover hover:text-fg",
        className,
      )}
      {...props}
    />
  );
}

function Positioner({
  className,
  ...props
}: ComponentProps<typeof ArkSelect.Positioner>) {
  return (
    <ArkSelect.Positioner className={cn("z-50!", className)} {...props} />
  );
}

function Content({
  className,
  ...props
}: ComponentProps<typeof ArkSelect.Content>) {
  return (
    <Portal>
      <ArkSelect.Positioner className="z-50!">
        <ArkSelect.Content
          className={cn(
            "min-w-32 rounded-md border border-border bg-surface p-1 shadow-md focus:outline-none",
            "data-[state=open]:animate-menu-open",
            className,
          )}
          {...props}
        />
      </ArkSelect.Positioner>
    </Portal>
  );
}

function List({
  className,
  ...props
}: ComponentProps<typeof ArkSelect.List>) {
  return (
    <ArkSelect.List
      className={cn("flex flex-col gap-0.5", className)}
      {...props}
    />
  );
}

function ItemGroup({
  className,
  ...props
}: ComponentProps<typeof ArkSelect.ItemGroup>) {
  return (
    <ArkSelect.ItemGroup
      className={cn("flex flex-col gap-0.5", className)}
      {...props}
    />
  );
}

function ItemGroupLabel({
  className,
  ...props
}: ComponentProps<typeof ArkSelect.ItemGroupLabel>) {
  return (
    <ArkSelect.ItemGroupLabel
      className={cn(
        "px-2 pt-1.5 pb-1 text-[11px] font-medium tracking-wide text-fg-muted uppercase",
        className,
      )}
      {...props}
    />
  );
}

function Item({ className, ...props }: ComponentProps<typeof ArkSelect.Item>) {
  return (
    <ArkSelect.Item
      className={cn(
        "flex cursor-pointer items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-sm text-fg-soft outline-none data-highlighted:bg-hover data-highlighted:text-fg data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

function ItemText({
  className,
  ...props
}: ComponentProps<typeof ArkSelect.ItemText>) {
  return (
    <ArkSelect.ItemText className={cn("truncate", className)} {...props} />
  );
}

const ItemIndicator = ArkSelect.ItemIndicator;
const HiddenSelect = ArkSelect.HiddenSelect;
const Context = ArkSelect.Context;
const ItemContext = ArkSelect.ItemContext;
const RootProvider = ArkSelect.RootProvider;

export const Select = {
  Root,
  RootProvider,
  Label,
  Control,
  Trigger,
  ValueText,
  Indicator,
  ClearTrigger,
  Positioner,
  Content,
  List,
  ItemGroup,
  ItemGroupLabel,
  Item,
  ItemText,
  ItemIndicator,
  HiddenSelect,
  Context,
  ItemContext,
};

export { createListCollection };
