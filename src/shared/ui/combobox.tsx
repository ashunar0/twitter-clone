"use client";

import {
  Combobox as ArkCombobox,
  useListCollection,
} from "@ark-ui/react/combobox";
import { Portal } from "@ark-ui/react/portal";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const Root = ArkCombobox.Root;

function Label({
  className,
  ...props
}: ComponentProps<typeof ArkCombobox.Label>) {
  return (
    <ArkCombobox.Label
      className={cn("block text-sm font-medium text-fg-soft", className)}
      {...props}
    />
  );
}

function Control({
  className,
  ...props
}: ComponentProps<typeof ArkCombobox.Control>) {
  return (
    <ArkCombobox.Control
      className={cn(
        "relative mt-1.5 inline-flex h-9 w-full items-center rounded-md border border-border bg-surface transition-colors",
        "focus-within:ring-2 focus-within:ring-fg/20",
        "data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

function Input({
  className,
  ...props
}: ComponentProps<typeof ArkCombobox.Input>) {
  return (
    <ArkCombobox.Input
      className={cn(
        "h-full flex-1 bg-transparent px-3 text-sm text-fg placeholder:text-fg-subtle focus:outline-none",
        className,
      )}
      {...props}
    />
  );
}

function Trigger({
  className,
  ...props
}: ComponentProps<typeof ArkCombobox.Trigger>) {
  return (
    <ArkCombobox.Trigger
      className={cn(
        "flex h-full w-9 cursor-pointer items-center justify-center text-fg-muted hover:text-fg",
        "[&_svg]:transition-transform data-[state=open]:[&_svg]:rotate-180",
        className,
      )}
      {...props}
    />
  );
}

function ClearTrigger({
  className,
  ...props
}: ComponentProps<typeof ArkCombobox.ClearTrigger>) {
  return (
    <ArkCombobox.ClearTrigger
      className={cn(
        "flex h-full w-7 cursor-pointer items-center justify-center text-fg-muted hover:text-fg",
        className,
      )}
      {...props}
    />
  );
}

function Positioner({
  className,
  ...props
}: ComponentProps<typeof ArkCombobox.Positioner>) {
  return <ArkCombobox.Positioner className={cn("z-50!", className)} {...props} />;
}

function Content({
  className,
  ...props
}: ComponentProps<typeof ArkCombobox.Content>) {
  return (
    <Portal>
      <Positioner>
        <ArkCombobox.Content
          className={cn(
            "max-h-72 min-w-[var(--reference-width)] overflow-auto rounded-md border border-border bg-surface p-1 shadow-[0_1px_0_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.08),0_0_4px_rgba(0,0,0,0.03)] focus:outline-none",
            "data-[state=open]:animate-menu-open",
            className,
          )}
          {...props}
        />
      </Positioner>
    </Portal>
  );
}

function List({
  className,
  ...props
}: ComponentProps<typeof ArkCombobox.List>) {
  return <ArkCombobox.List className={cn(className)} {...props} />;
}

function Empty({
  className,
  ...props
}: ComponentProps<typeof ArkCombobox.Empty>) {
  return (
    <ArkCombobox.Empty
      className={cn("px-2 py-3 text-center text-xs text-fg-muted", className)}
      {...props}
    />
  );
}

function Item({
  className,
  ...props
}: ComponentProps<typeof ArkCombobox.Item>) {
  return (
    <ArkCombobox.Item
      className={cn(
        "flex cursor-pointer items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-sm text-fg-soft outline-none",
        "data-highlighted:bg-hover data-highlighted:text-fg",
        "data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

function ItemText({
  className,
  ...props
}: ComponentProps<typeof ArkCombobox.ItemText>) {
  return <ArkCombobox.ItemText className={cn(className)} {...props} />;
}

function ItemIndicator({
  className,
  ...props
}: ComponentProps<typeof ArkCombobox.ItemIndicator>) {
  return (
    <ArkCombobox.ItemIndicator
      className={cn("text-fg", className)}
      {...props}
    />
  );
}

function ItemGroup({
  className,
  ...props
}: ComponentProps<typeof ArkCombobox.ItemGroup>) {
  return (
    <ArkCombobox.ItemGroup
      className={cn(
        "flex flex-col [&:not(:first-child)]:mt-1 [&:not(:first-child)]:border-t [&:not(:first-child)]:border-border-muted [&:not(:first-child)]:pt-1",
        className,
      )}
      {...props}
    />
  );
}

function ItemGroupLabel({
  className,
  ...props
}: ComponentProps<typeof ArkCombobox.ItemGroupLabel>) {
  return (
    <ArkCombobox.ItemGroupLabel
      className={cn(
        "px-2 py-1 text-[11px] font-medium uppercase tracking-wider text-fg-muted",
        className,
      )}
      {...props}
    />
  );
}

const Context = ArkCombobox.Context;
const ItemContext = ArkCombobox.ItemContext;
const RootProvider = ArkCombobox.RootProvider;

export const Combobox = {
  Root,
  RootProvider,
  Label,
  Control,
  Input,
  Trigger,
  ClearTrigger,
  Positioner,
  Content,
  List,
  Empty,
  Item,
  ItemText,
  ItemIndicator,
  ItemGroup,
  ItemGroupLabel,
  Context,
  ItemContext,
};

export { useListCollection };
