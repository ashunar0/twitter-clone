"use client";

import { Carousel as ArkCarousel } from "@ark-ui/react/carousel";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

function Root({
  className,
  ...props
}: ComponentProps<typeof ArkCarousel.Root>) {
  return (
    <ArkCarousel.Root
      className={cn(
        "relative overflow-hidden rounded-lg border border-border bg-surface",
        className,
      )}
      {...props}
    />
  );
}

function ItemGroup({
  className,
  ...props
}: ComponentProps<typeof ArkCarousel.ItemGroup>) {
  return (
    <ArkCarousel.ItemGroup
      className={cn(
        "flex",
        "data-[orientation=horizontal]:flex-row",
        "data-[orientation=vertical]:flex-col",
        className,
      )}
      {...props}
    />
  );
}

function Item({
  className,
  ...props
}: ComponentProps<typeof ArkCarousel.Item>) {
  return (
    <ArkCarousel.Item
      className={cn("min-w-0 shrink-0 grow-0 basis-full", className)}
      {...props}
    />
  );
}

function Control({
  className,
  ...props
}: ComponentProps<typeof ArkCarousel.Control>) {
  return (
    <ArkCarousel.Control
      className={cn(
        "pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-between px-3",
        className,
      )}
      {...props}
    />
  );
}

const triggerStyles = cn(
  "pointer-events-auto inline-flex size-9 cursor-pointer items-center justify-center rounded-full border border-border bg-surface/90 text-fg shadow-[0_1px_0_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.08)] outline-none backdrop-blur transition-colors",
  "hover:bg-surface",
  "focus-visible:ring-2 focus-visible:ring-fg/30",
  "data-disabled:cursor-not-allowed data-disabled:opacity-40",
);

function PrevTrigger({
  className,
  children,
  ...props
}: ComponentProps<typeof ArkCarousel.PrevTrigger>) {
  return (
    <ArkCarousel.PrevTrigger
      className={cn(triggerStyles, className)}
      {...props}
    >
      {children ?? <ChevronLeft className="size-4" strokeWidth={2.25} />}
    </ArkCarousel.PrevTrigger>
  );
}

function NextTrigger({
  className,
  children,
  ...props
}: ComponentProps<typeof ArkCarousel.NextTrigger>) {
  return (
    <ArkCarousel.NextTrigger
      className={cn(triggerStyles, className)}
      {...props}
    >
      {children ?? <ChevronRight className="size-4" strokeWidth={2.25} />}
    </ArkCarousel.NextTrigger>
  );
}

function IndicatorGroup({
  className,
  ...props
}: ComponentProps<typeof ArkCarousel.IndicatorGroup>) {
  return (
    <ArkCarousel.IndicatorGroup
      className={cn(
        "absolute bottom-3 left-0 right-0 flex items-center justify-center gap-1.5",
        className,
      )}
      {...props}
    />
  );
}

function Indicator({
  className,
  ...props
}: ComponentProps<typeof ArkCarousel.Indicator>) {
  return (
    <ArkCarousel.Indicator
      className={cn(
        "size-2 cursor-pointer rounded-full bg-fg-subtle/70 outline-none transition-all",
        "hover:bg-fg-muted",
        "focus-visible:ring-2 focus-visible:ring-fg/30 focus-visible:ring-offset-2",
        "data-current:w-6 data-current:bg-fg",
        className,
      )}
      {...props}
    />
  );
}

function AutoplayTrigger({
  className,
  children,
  ...props
}: ComponentProps<typeof ArkCarousel.AutoplayTrigger>) {
  return (
    <ArkCarousel.AutoplayTrigger
      className={cn(
        "inline-flex size-8 cursor-pointer items-center justify-center rounded-full border border-border bg-surface/90 text-fg outline-none backdrop-blur transition-colors",
        "hover:bg-surface",
        "focus-visible:ring-2 focus-visible:ring-fg/30",
        className,
      )}
      {...props}
    >
      {children ?? <Carousel.AutoplayIndicator />}
    </ArkCarousel.AutoplayTrigger>
  );
}

function AutoplayIndicator({
  className,
  fallback,
  ...props
}: ComponentProps<typeof ArkCarousel.AutoplayIndicator>) {
  return (
    <ArkCarousel.AutoplayIndicator
      className={cn("inline-flex items-center justify-center", className)}
      fallback={fallback ?? <Play className="size-3.5" strokeWidth={2.25} />}
      {...props}
    >
      <Pause className="size-3.5" strokeWidth={2.25} />
    </ArkCarousel.AutoplayIndicator>
  );
}

function ProgressText({
  className,
  ...props
}: ComponentProps<typeof ArkCarousel.ProgressText>) {
  return (
    <ArkCarousel.ProgressText
      className={cn("text-xs tabular-nums text-fg-muted", className)}
      {...props}
    />
  );
}

const Context = ArkCarousel.Context;
const RootProvider = ArkCarousel.RootProvider;

export const Carousel = {
  Root,
  RootProvider,
  ItemGroup,
  Item,
  Control,
  PrevTrigger,
  NextTrigger,
  IndicatorGroup,
  Indicator,
  AutoplayTrigger,
  AutoplayIndicator,
  ProgressText,
  Context,
};
