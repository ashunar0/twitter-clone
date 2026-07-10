"use client";

import { Drawer as ArkDrawer } from "@ark-ui/react/drawer";
import { Portal } from "@ark-ui/react/portal";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

function Root({
  swipeDirection = "end",
  ...props
}: ComponentProps<typeof ArkDrawer.Root>) {
  return <ArkDrawer.Root swipeDirection={swipeDirection} {...props} />;
}

function Trigger(props: ComponentProps<typeof ArkDrawer.Trigger>) {
  return <ArkDrawer.Trigger {...props} />;
}

function CloseTrigger(props: ComponentProps<typeof ArkDrawer.CloseTrigger>) {
  return <ArkDrawer.CloseTrigger {...props} />;
}

function Backdrop({
  className,
  ...props
}: ComponentProps<typeof ArkDrawer.Backdrop>) {
  return (
    <ArkDrawer.Backdrop
      className={cn(
        "fixed inset-0 z-40 bg-black/40",
        "data-[state=open]:animate-fade-in",
        "data-[state=closed]:animate-fade-out",
        className,
      )}
      {...props}
    />
  );
}

function Positioner({
  className,
  ...props
}: ComponentProps<typeof ArkDrawer.Positioner>) {
  return (
    <ArkDrawer.Positioner
      className={cn("fixed inset-0 z-50", className)}
      {...props}
    />
  );
}

function Content({
  className,
  children,
  ...props
}: ComponentProps<typeof ArkDrawer.Content>) {
  return (
    <Portal>
      <Backdrop />
      <Positioner>
        <ArkDrawer.Content
          className={cn(
            "fixed flex flex-col border border-border bg-surface shadow-[0_1px_0_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.12),0_0_4px_rgba(0,0,0,0.03)] focus:outline-none",
            "data-[swipe-direction=right]:right-0 data-[swipe-direction=right]:inset-y-0 data-[swipe-direction=right]:w-96 data-[swipe-direction=right]:border-r-0",
            "data-[swipe-direction=right]:data-[state=open]:animate-slide-in-right data-[swipe-direction=right]:data-[state=closed]:animate-slide-out-right",
            "data-[swipe-direction=left]:left-0 data-[swipe-direction=left]:inset-y-0 data-[swipe-direction=left]:w-96 data-[swipe-direction=left]:border-l-0",
            "data-[swipe-direction=left]:data-[state=open]:animate-slide-in-left data-[swipe-direction=left]:data-[state=closed]:animate-slide-out-left",
            "data-[swipe-direction=up]:bottom-0 data-[swipe-direction=up]:inset-x-0 data-[swipe-direction=up]:h-[60vh] data-[swipe-direction=up]:rounded-t-xl data-[swipe-direction=up]:border-b-0",
            "data-[swipe-direction=up]:data-[state=open]:animate-slide-in-up data-[swipe-direction=up]:data-[state=closed]:animate-slide-out-down",
            "data-[swipe-direction=down]:top-0 data-[swipe-direction=down]:inset-x-0 data-[swipe-direction=down]:h-[60vh] data-[swipe-direction=down]:rounded-b-xl data-[swipe-direction=down]:border-t-0",
            "data-[swipe-direction=down]:data-[state=open]:animate-slide-in-down data-[swipe-direction=down]:data-[state=closed]:animate-slide-out-up",
            className,
          )}
          {...props}
        >
          {children}
        </ArkDrawer.Content>
      </Positioner>
    </Portal>
  );
}

function Title({
  className,
  ...props
}: ComponentProps<typeof ArkDrawer.Title>) {
  return (
    <ArkDrawer.Title
      className={cn("text-base font-semibold text-fg", className)}
      {...props}
    />
  );
}

function Description({
  className,
  ...props
}: ComponentProps<typeof ArkDrawer.Description>) {
  return (
    <ArkDrawer.Description
      className={cn("text-sm text-fg-soft", className)}
      {...props}
    />
  );
}

function Grabber({
  className,
  ...props
}: ComponentProps<typeof ArkDrawer.Grabber>) {
  return (
    <ArkDrawer.Grabber
      className={cn(
        "mx-auto flex h-5 cursor-grab items-center justify-center",
        "data-dragging:cursor-grabbing",
        className,
      )}
      {...props}
    />
  );
}

function GrabberIndicator({
  className,
  ...props
}: ComponentProps<typeof ArkDrawer.GrabberIndicator>) {
  return (
    <ArkDrawer.GrabberIndicator
      className={cn("h-1.5 w-12 rounded-full bg-fg-subtle", className)}
      {...props}
    />
  );
}

const Context = ArkDrawer.Context;
const RootProvider = ArkDrawer.RootProvider;

export const Drawer = {
  Root,
  RootProvider,
  Trigger,
  Backdrop,
  Positioner,
  Content,
  Title,
  Description,
  Grabber,
  GrabberIndicator,
  CloseTrigger,
  Context,
};
