"use client";

import { TagsInput as ArkTagsInput } from "@ark-ui/react/tags-input";
import { X } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

function Root({
  className,
  ...props
}: ComponentProps<typeof ArkTagsInput.Root>) {
  return (
    <ArkTagsInput.Root
      className={cn("flex flex-col gap-1.5", className)}
      {...props}
    />
  );
}

function Label({
  className,
  ...props
}: ComponentProps<typeof ArkTagsInput.Label>) {
  return (
    <ArkTagsInput.Label
      className={cn("text-sm font-medium text-fg-soft", className)}
      {...props}
    />
  );
}

function Control({
  className,
  ...props
}: ComponentProps<typeof ArkTagsInput.Control>) {
  return (
    <ArkTagsInput.Control
      className={cn(
        "flex min-h-9 flex-wrap items-center gap-1.5 rounded-md border border-border bg-surface p-1.5 transition-colors",
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
}: ComponentProps<typeof ArkTagsInput.Input>) {
  return (
    <ArkTagsInput.Input
      className={cn(
        "min-w-24 flex-1 bg-transparent px-1 text-sm text-fg placeholder:text-fg-subtle focus:outline-none",
        className,
      )}
      {...props}
    />
  );
}

function Item({
  className,
  ...props
}: ComponentProps<typeof ArkTagsInput.Item>) {
  return (
    <ArkTagsInput.Item
      className={cn(
        "inline-flex items-center rounded-sm bg-surface-sunken text-xs text-fg transition-colors data-highlighted:bg-active",
        className,
      )}
      {...props}
    />
  );
}

function ItemPreview({
  className,
  ...props
}: ComponentProps<typeof ArkTagsInput.ItemPreview>) {
  return (
    <ArkTagsInput.ItemPreview
      className={cn("flex items-center gap-1 px-2 py-0.5", className)}
      {...props}
    />
  );
}

function ItemText({
  className,
  ...props
}: ComponentProps<typeof ArkTagsInput.ItemText>) {
  return <ArkTagsInput.ItemText className={cn(className)} {...props} />;
}

function ItemDeleteTrigger({
  className,
  ...props
}: ComponentProps<typeof ArkTagsInput.ItemDeleteTrigger>) {
  return (
    <ArkTagsInput.ItemDeleteTrigger
      className={cn(
        "flex size-3.5 cursor-pointer items-center justify-center rounded-full text-fg-muted hover:bg-active hover:text-fg",
        className,
      )}
      {...props}
    >
      <X className="size-2.5" strokeWidth={2.5} />
    </ArkTagsInput.ItemDeleteTrigger>
  );
}

function ItemInput({
  className,
  ...props
}: ComponentProps<typeof ArkTagsInput.ItemInput>) {
  return (
    <ArkTagsInput.ItemInput
      className={cn("bg-transparent px-2 py-0.5 text-xs focus:outline-none", className)}
      {...props}
    />
  );
}

function ClearTrigger({
  className,
  ...props
}: ComponentProps<typeof ArkTagsInput.ClearTrigger>) {
  return (
    <ArkTagsInput.ClearTrigger
      className={cn(
        "inline-flex h-7 cursor-pointer items-center gap-1 rounded-md px-2 text-xs font-medium text-fg-muted outline-none transition-colors",
        "hover:bg-hover hover:text-fg",
        "focus-visible:ring-2 focus-visible:ring-fg/30",
        "data-disabled:cursor-not-allowed data-disabled:opacity-50 data-disabled:hover:bg-transparent data-disabled:hover:text-fg-muted",
        className,
      )}
      {...props}
    />
  );
}

const Context = ArkTagsInput.Context;
const ItemContext = ArkTagsInput.ItemContext;
const RootProvider = ArkTagsInput.RootProvider;
const HiddenInput = ArkTagsInput.HiddenInput;

export const TagsInput = {
  Root,
  RootProvider,
  Label,
  Control,
  Input,
  Item,
  ItemPreview,
  ItemText,
  ItemDeleteTrigger,
  ItemInput,
  ClearTrigger,
  HiddenInput,
  Context,
  ItemContext,
};
