"use client";

import { Splitter as ArkSplitter } from "@ark-ui/react/splitter";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

function Root({
  className,
  ...props
}: ComponentProps<typeof ArkSplitter.Root>) {
  return (
    <ArkSplitter.Root
      className={cn(
        "flex overflow-hidden rounded-md border border-border bg-surface",
        "data-[orientation=horizontal]:flex-row data-[orientation=vertical]:flex-col",
        className,
      )}
      {...props}
    />
  );
}

function Panel({
  className,
  ...props
}: ComponentProps<typeof ArkSplitter.Panel>) {
  return (
    <ArkSplitter.Panel
      className={cn("overflow-auto", className)}
      {...props}
    />
  );
}

function ResizeTrigger({
  className,
  ...props
}: ComponentProps<typeof ArkSplitter.ResizeTrigger>) {
  return (
    <ArkSplitter.ResizeTrigger
      className={cn(
        "group relative flex items-center justify-center bg-border outline-none transition-colors",
        "hover:bg-fg-muted data-dragging:bg-fg",
        "focus-visible:bg-fg",
        "data-[orientation=horizontal]:w-px data-[orientation=horizontal]:cursor-col-resize",
        "data-[orientation=vertical]:h-px data-[orientation=vertical]:cursor-row-resize",
        "data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

function ResizeTriggerIndicator({
  className,
  ...props
}: ComponentProps<typeof ArkSplitter.ResizeTriggerIndicator>) {
  return (
    <ArkSplitter.ResizeTriggerIndicator
      className={cn(
        "absolute rounded-full bg-fg-muted opacity-0 transition-opacity",
        "group-hover:opacity-100 group-data-dragging:opacity-100",
        "data-[orientation=horizontal]:h-6 data-[orientation=horizontal]:w-1",
        "data-[orientation=vertical]:h-1 data-[orientation=vertical]:w-6",
        className,
      )}
      {...props}
    />
  );
}

const Context = ArkSplitter.Context;
const RootProvider = ArkSplitter.RootProvider;

export const Splitter = {
  Root,
  RootProvider,
  Panel,
  ResizeTrigger,
  ResizeTriggerIndicator,
  Context,
};
