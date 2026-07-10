"use client";

import { Portal } from "@ark-ui/react/portal";
import { Tooltip as ArkTooltip } from "@ark-ui/react/tooltip";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

function Root({
  openDelay = 400,
  closeDelay = 100,
  ...props
}: ComponentProps<typeof ArkTooltip.Root>) {
  return (
    <ArkTooltip.Root openDelay={openDelay} closeDelay={closeDelay} {...props} />
  );
}

function Trigger(props: ComponentProps<typeof ArkTooltip.Trigger>) {
  return <ArkTooltip.Trigger {...props} />;
}

function Positioner({
  className,
  ...props
}: ComponentProps<typeof ArkTooltip.Positioner>) {
  return <ArkTooltip.Positioner className={cn("z-50!", className)} {...props} />;
}

function Content({
  className,
  ...props
}: ComponentProps<typeof ArkTooltip.Content>) {
  return (
    <Portal>
      <Positioner>
        <ArkTooltip.Content
          className={cn(
            "rounded-md bg-fg px-2 py-1 text-xs font-medium text-bg shadow-md",
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
}: ComponentProps<typeof ArkTooltip.Arrow>) {
  return (
    <ArkTooltip.Arrow
      className={cn(
        "[--arrow-size:6px] [--arrow-background:var(--color-fg)]",
        className,
      )}
      {...props}
    />
  );
}

function ArrowTip({
  className,
  ...props
}: ComponentProps<typeof ArkTooltip.ArrowTip>) {
  return <ArkTooltip.ArrowTip className={cn(className)} {...props} />;
}

const Context = ArkTooltip.Context;
const RootProvider = ArkTooltip.RootProvider;

export const Tooltip = {
  Root,
  RootProvider,
  Trigger,
  Positioner,
  Content,
  Arrow,
  ArrowTip,
  Context,
};
