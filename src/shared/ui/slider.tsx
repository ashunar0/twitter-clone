"use client";

import { Slider as ArkSlider } from "@ark-ui/react/slider";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

function Root({
  className,
  ...props
}: ComponentProps<typeof ArkSlider.Root>) {
  return (
    <ArkSlider.Root
      className={cn(
        "flex flex-col gap-2 data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

function Label({
  className,
  ...props
}: ComponentProps<typeof ArkSlider.Label>) {
  return (
    <ArkSlider.Label
      className={cn("text-sm font-medium text-fg-soft", className)}
      {...props}
    />
  );
}

function ValueText({
  className,
  ...props
}: ComponentProps<typeof ArkSlider.ValueText>) {
  return (
    <ArkSlider.ValueText
      className={cn("text-xs tabular-nums text-fg-muted", className)}
      {...props}
    />
  );
}

function Control({
  className,
  ...props
}: ComponentProps<typeof ArkSlider.Control>) {
  return (
    <ArkSlider.Control
      className={cn("relative flex items-center py-1.5", className)}
      {...props}
    />
  );
}

function Track({
  className,
  ...props
}: ComponentProps<typeof ArkSlider.Track>) {
  return (
    <ArkSlider.Track
      className={cn(
        "h-2 w-full overflow-hidden rounded-full bg-surface-sunken",
        className,
      )}
      {...props}
    />
  );
}

function Range({
  className,
  ...props
}: ComponentProps<typeof ArkSlider.Range>) {
  return (
    <ArkSlider.Range
      className={cn("h-full bg-fg", className)}
      {...props}
    />
  );
}

function Thumb({
  className,
  children,
  ...props
}: ComponentProps<typeof ArkSlider.Thumb>) {
  return (
    <ArkSlider.Thumb
      className={cn(
        "block size-4 cursor-grab rounded-full border-2 border-fg bg-surface outline-none transition-shadow",
        "focus-visible:ring-2 focus-visible:ring-fg/30",
        "data-dragging:cursor-grabbing",
        className,
      )}
      {...props}
    >
      {children}
      <ArkSlider.HiddenInput />
    </ArkSlider.Thumb>
  );
}

function MarkerGroup({
  className,
  ...props
}: ComponentProps<typeof ArkSlider.MarkerGroup>) {
  return (
    <ArkSlider.MarkerGroup className={cn(className)} {...props} />
  );
}

function Marker({
  className,
  ...props
}: ComponentProps<typeof ArkSlider.Marker>) {
  return (
    <ArkSlider.Marker
      className={cn(
        "text-[10px] tabular-nums text-fg-muted",
        "data-[state=under-value]:text-fg-soft",
        className,
      )}
      {...props}
    />
  );
}

function DraggingIndicator({
  className,
  ...props
}: ComponentProps<typeof ArkSlider.DraggingIndicator>) {
  return (
    <ArkSlider.DraggingIndicator
      className={cn(
        "rounded-md bg-fg px-2 py-1 text-[11px] font-medium tabular-nums text-bg shadow-md",
        className,
      )}
      {...props}
    />
  );
}

const HiddenInput = ArkSlider.HiddenInput;
const Context = ArkSlider.Context;
const RootProvider = ArkSlider.RootProvider;

export const Slider = {
  Root,
  RootProvider,
  Label,
  ValueText,
  Control,
  Track,
  Range,
  Thumb,
  HiddenInput,
  MarkerGroup,
  Marker,
  DraggingIndicator,
  Context,
};
