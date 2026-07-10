"use client";

import { ScrollArea as ArkScrollArea } from "@ark-ui/react/scroll-area";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

function Root({
  className,
  ...props
}: ComponentProps<typeof ArkScrollArea.Root>) {
  return (
    <ArkScrollArea.Root
      className={cn("relative overflow-hidden", className)}
      {...props}
    />
  );
}

function Viewport({
  ref,
  className,
  ...props
}: ComponentProps<typeof ArkScrollArea.Viewport>) {
  return (
    <ArkScrollArea.Viewport
      ref={ref}
      className={cn(
        "h-full w-full [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
      {...props}
    />
  );
}

function Scrollbar({
  orientation = "vertical",
  className,
  ...props
}: ComponentProps<typeof ArkScrollArea.Scrollbar>) {
  return (
    <ArkScrollArea.Scrollbar
      orientation={orientation}
      className={cn(
        "flex touch-none select-none p-0.5 opacity-0 transition-opacity duration-150",
        "data-scrolling:opacity-100 data-hover:opacity-100",
        orientation === "vertical" && "h-full w-2",
        orientation === "horizontal" && "h-2 w-full flex-col",
        className,
      )}
      {...props}
    />
  );
}

function Thumb({
  className,
  ...props
}: ComponentProps<typeof ArkScrollArea.Thumb>) {
  return (
    <ArkScrollArea.Thumb
      className={cn(
        "relative flex-1 rounded-full bg-fg-muted/30 transition-colors hover:bg-fg-muted/50",
        "data-hover:bg-fg-muted/50 data-dragging:bg-fg-muted/60",
        className,
      )}
      {...props}
    />
  );
}

function Content({
  className,
  ...props
}: ComponentProps<typeof ArkScrollArea.Content>) {
  return <ArkScrollArea.Content className={cn(className)} {...props} />;
}

function Corner({
  className,
  ...props
}: ComponentProps<typeof ArkScrollArea.Corner>) {
  return (
    <ArkScrollArea.Corner
      className={cn("bg-surface-sunken", className)}
      {...props}
    />
  );
}

const Context = ArkScrollArea.Context;
const RootProvider = ArkScrollArea.RootProvider;

export const ScrollArea = {
  Root,
  RootProvider,
  Viewport,
  Content,
  Scrollbar,
  Thumb,
  Corner,
  Context,
};
