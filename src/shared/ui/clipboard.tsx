"use client";

import { Clipboard as ArkClipboard } from "@ark-ui/react/clipboard";
import { Check, Copy } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

function Root({
  className,
  ...props
}: ComponentProps<typeof ArkClipboard.Root>) {
  return (
    <ArkClipboard.Root
      className={cn("flex flex-col gap-1.5", className)}
      {...props}
    />
  );
}

function Label({
  className,
  ...props
}: ComponentProps<typeof ArkClipboard.Label>) {
  return (
    <ArkClipboard.Label
      className={cn("text-sm font-medium text-fg-soft", className)}
      {...props}
    />
  );
}

function Control({
  className,
  ...props
}: ComponentProps<typeof ArkClipboard.Control>) {
  return (
    <ArkClipboard.Control
      className={cn("flex items-center gap-2", className)}
      {...props}
    />
  );
}

function Input({
  className,
  ...props
}: ComponentProps<typeof ArkClipboard.Input>) {
  return (
    <ArkClipboard.Input
      className={cn(
        "flex h-9 min-w-0 flex-1 rounded-md border border-border bg-surface px-3 text-sm text-fg outline-none transition-colors",
        "focus:border-fg focus:ring-2 focus:ring-fg/20",
        "data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

function Trigger({
  className,
  ...props
}: ComponentProps<typeof ArkClipboard.Trigger>) {
  return (
    <ArkClipboard.Trigger
      className={cn(
        "inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-md border border-border bg-surface text-fg-soft outline-none transition-colors",
        "hover:bg-hover hover:text-fg",
        "focus-visible:ring-2 focus-visible:ring-fg/30",
        "data-disabled:cursor-not-allowed data-disabled:opacity-50 data-disabled:hover:bg-surface data-disabled:hover:text-fg-soft",
        className,
      )}
      {...props}
    />
  );
}

function Indicator({
  className,
  copied,
  children,
  ...props
}: ComponentProps<typeof ArkClipboard.Indicator>) {
  return (
    <ArkClipboard.Indicator
      className={cn("inline-flex items-center justify-center", className)}
      copied={copied ?? <Check className="size-4" strokeWidth={2.5} />}
      {...props}
    >
      {children ?? <Copy className="size-4" strokeWidth={2} />}
    </ArkClipboard.Indicator>
  );
}

function ValueText({
  className,
  ...props
}: ComponentProps<typeof ArkClipboard.ValueText>) {
  return (
    <ArkClipboard.ValueText
      className={cn(
        "font-mono text-sm text-fg-soft",
        className,
      )}
      {...props}
    />
  );
}

const Context = ArkClipboard.Context;
const RootProvider = ArkClipboard.RootProvider;

export const Clipboard = {
  Root,
  RootProvider,
  Label,
  Control,
  Input,
  Trigger,
  Indicator,
  ValueText,
  Context,
};
