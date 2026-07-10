"use client";

import { HoverCard as ArkHoverCard } from "@ark-ui/react/hover-card";
import { Portal } from "@ark-ui/react/portal";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

function Root({
  openDelay = 150,
  closeDelay = 150,
  ...props
}: ComponentProps<typeof ArkHoverCard.Root>) {
  return (
    <ArkHoverCard.Root
      openDelay={openDelay}
      closeDelay={closeDelay}
      {...props}
    />
  );
}

function Trigger(props: ComponentProps<typeof ArkHoverCard.Trigger>) {
  return <ArkHoverCard.Trigger {...props} />;
}

function Positioner({
  className,
  ...props
}: ComponentProps<typeof ArkHoverCard.Positioner>) {
  return <ArkHoverCard.Positioner className={cn("z-50!", className)} {...props} />;
}

function Content({
  className,
  ...props
}: ComponentProps<typeof ArkHoverCard.Content>) {
  return (
    <Portal>
      <Positioner>
        <ArkHoverCard.Content
          className={cn(
            "rounded-md border border-border bg-surface p-4 focus:outline-none",
            "drop-shadow-[0_1px_0_rgba(0,0,0,0.04)] drop-shadow-[0_8px_24px_rgba(0,0,0,0.08)] drop-shadow-[0_0_4px_rgba(0,0,0,0.03)]",
            "dark:drop-shadow-[0_1px_0_rgba(0,0,0,0.4)] dark:drop-shadow-[0_8px_24px_rgba(0,0,0,0.4)] dark:drop-shadow-[0_0_4px_rgba(0,0,0,0.2)]",
            "data-[state=open]:animate-menu-open",
            className,
          )}
          {...props}
        />
      </Positioner>
    </Portal>
  );
}

function Arrow({
  className,
  ...props
}: ComponentProps<typeof ArkHoverCard.Arrow>) {
  return (
    <ArkHoverCard.Arrow
      className={cn(
        "[--arrow-size:8px] [--arrow-background:var(--color-surface)]",
        className,
      )}
      {...props}
    />
  );
}

function ArrowTip({
  className,
  ...props
}: ComponentProps<typeof ArkHoverCard.ArrowTip>) {
  return (
    <ArkHoverCard.ArrowTip
      className={cn("border-t border-l border-border", className)}
      {...props}
    />
  );
}

const Context = ArkHoverCard.Context;
const RootProvider = ArkHoverCard.RootProvider;

export const HoverCard = {
  Root,
  RootProvider,
  Trigger,
  Positioner,
  Content,
  Arrow,
  ArrowTip,
  Context,
};
