"use client";

import {
  Listbox as ArkListbox,
  createListCollection,
  type CollectionItem,
} from "@ark-ui/react/listbox";
import { Check } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

function Root<T extends CollectionItem>({
  className,
  ...props
}: ArkListbox.RootProps<T>) {
  return (
    <ArkListbox.Root
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  );
}

function Label({
  className,
  ...props
}: ComponentProps<typeof ArkListbox.Label>) {
  return (
    <ArkListbox.Label
      className={cn("block text-sm font-medium text-fg-soft", className)}
      {...props}
    />
  );
}

function Input({
  className,
  ...props
}: ComponentProps<typeof ArkListbox.Input>) {
  return (
    <ArkListbox.Input
      className={cn(
        "flex h-9 w-full rounded-md border border-border bg-surface px-3 text-sm text-fg outline-none transition-colors",
        "focus:border-fg focus:ring-2 focus:ring-fg/20",
        className,
      )}
      {...props}
    />
  );
}

function Content({
  className,
  ...props
}: ComponentProps<typeof ArkListbox.Content>) {
  return (
    <ArkListbox.Content
      className={cn(
        "flex max-h-72 flex-col gap-0.5 overflow-auto rounded-md border border-border bg-surface p-1 outline-none",
        className,
      )}
      {...props}
    />
  );
}

function Empty({
  className,
  ...props
}: ComponentProps<typeof ArkListbox.Empty>) {
  return (
    <ArkListbox.Empty
      className={cn(
        "px-3 py-2 text-sm text-fg-muted",
        className,
      )}
      {...props}
    />
  );
}

function ItemGroup({
  className,
  ...props
}: ComponentProps<typeof ArkListbox.ItemGroup>) {
  return (
    <ArkListbox.ItemGroup
      className={cn("flex flex-col gap-0.5", className)}
      {...props}
    />
  );
}

function ItemGroupLabel({
  className,
  ...props
}: ComponentProps<typeof ArkListbox.ItemGroupLabel>) {
  return (
    <ArkListbox.ItemGroupLabel
      className={cn(
        "px-2 pt-2 pb-1 text-xs font-medium uppercase tracking-wide text-fg-muted",
        className,
      )}
      {...props}
    />
  );
}

function Item({
  className,
  ...props
}: ComponentProps<typeof ArkListbox.Item>) {
  return (
    <ArkListbox.Item
      className={cn(
        "flex cursor-pointer items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-sm text-fg-soft outline-none transition-colors",
        "data-highlighted:bg-hover data-highlighted:text-fg",
        "data-[state=checked]:text-fg",
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
}: ComponentProps<typeof ArkListbox.ItemText>) {
  return (
    <ArkListbox.ItemText
      className={cn("truncate", className)}
      {...props}
    />
  );
}

function ItemIndicator({
  className,
  children,
  ...props
}: ComponentProps<typeof ArkListbox.ItemIndicator>) {
  return (
    <ArkListbox.ItemIndicator
      className={cn("inline-flex size-4 items-center justify-center", className)}
      {...props}
    >
      {children ?? <Check className="size-3.5" strokeWidth={2.5} />}
    </ArkListbox.ItemIndicator>
  );
}

function ValueText({
  className,
  ...props
}: ComponentProps<typeof ArkListbox.ValueText>) {
  return (
    <ArkListbox.ValueText
      className={cn("text-sm text-fg-soft", className)}
      {...props}
    />
  );
}

const Context = ArkListbox.Context;
const ItemContext = ArkListbox.ItemContext;
const RootProvider = ArkListbox.RootProvider;

export const Listbox = {
  Root,
  RootProvider,
  Label,
  Input,
  Content,
  Empty,
  ItemGroup,
  ItemGroupLabel,
  Item,
  ItemText,
  ItemIndicator,
  ValueText,
  Context,
  ItemContext,
};

export { createListCollection };
