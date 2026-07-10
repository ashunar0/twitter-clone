"use client";

import { ColorPicker as ArkColorPicker } from "@ark-ui/react/color-picker";
import { Portal } from "@ark-ui/react/portal";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

function Root({
  className,
  ...props
}: ComponentProps<typeof ArkColorPicker.Root>) {
  return (
    <ArkColorPicker.Root
      className={cn("flex flex-col gap-1.5", className)}
      {...props}
    />
  );
}

function Label({
  className,
  ...props
}: ComponentProps<typeof ArkColorPicker.Label>) {
  return (
    <ArkColorPicker.Label
      className={cn("text-sm font-medium text-fg-soft", className)}
      {...props}
    />
  );
}

function Control({
  className,
  ...props
}: ComponentProps<typeof ArkColorPicker.Control>) {
  return (
    <ArkColorPicker.Control
      className={cn("flex items-center gap-2", className)}
      {...props}
    />
  );
}

function ChannelInput({
  className,
  ...props
}: ComponentProps<typeof ArkColorPicker.ChannelInput>) {
  return (
    <ArkColorPicker.ChannelInput
      className={cn(
        "flex h-9 min-w-0 flex-1 rounded-md border border-border bg-surface px-3 font-mono text-sm text-fg outline-none transition-colors",
        "focus:border-fg focus:ring-2 focus:ring-fg/20",
        className,
      )}
      {...props}
    />
  );
}

function Trigger({
  className,
  ...props
}: ComponentProps<typeof ArkColorPicker.Trigger>) {
  return (
    <ArkColorPicker.Trigger
      className={cn(
        "inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-md border border-border bg-surface p-0.5 outline-none transition-colors",
        "hover:bg-hover",
        "focus-visible:ring-2 focus-visible:ring-fg/30",
        className,
      )}
      {...props}
    />
  );
}

function ValueSwatch({
  className,
  ...props
}: ComponentProps<typeof ArkColorPicker.ValueSwatch>) {
  return (
    <ArkColorPicker.ValueSwatch
      className={cn("size-full rounded-sm", className)}
      {...props}
    />
  );
}

function Positioner({
  className,
  ...props
}: ComponentProps<typeof ArkColorPicker.Positioner>) {
  return (
    <Portal>
      <ArkColorPicker.Positioner
        className={cn("z-50!", className)}
        {...props}
      />
    </Portal>
  );
}

function Content({
  className,
  ...props
}: ComponentProps<typeof ArkColorPicker.Content>) {
  return (
    <ArkColorPicker.Content
      className={cn(
        "z-50 flex w-64 flex-col gap-3 rounded-md border border-border bg-surface p-3 outline-none",
        "shadow-[0_1px_0_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.08),0_0_4px_rgba(0,0,0,0.03)]",
        "data-[state=open]:animate-menu-open",
        className,
      )}
      {...props}
    />
  );
}

function Area({
  className,
  ...props
}: ComponentProps<typeof ArkColorPicker.Area>) {
  return (
    <ArkColorPicker.Area
      className={cn(
        "relative h-40 w-full overflow-hidden rounded-md border border-border",
        className,
      )}
      {...props}
    />
  );
}

function AreaBackground(
  props: ComponentProps<typeof ArkColorPicker.AreaBackground>,
) {
  return <ArkColorPicker.AreaBackground className="size-full" {...props} />;
}

function AreaThumb({
  className,
  ...props
}: ComponentProps<typeof ArkColorPicker.AreaThumb>) {
  return (
    <ArkColorPicker.AreaThumb
      className={cn(
        "size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.4)] outline-none",
        "focus-visible:ring-2 focus-visible:ring-fg/30",
        className,
      )}
      {...props}
    />
  );
}

function EyeDropperTrigger({
  className,
  ...props
}: ComponentProps<typeof ArkColorPicker.EyeDropperTrigger>) {
  return (
    <ArkColorPicker.EyeDropperTrigger
      className={cn(
        "inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-fg-soft outline-none transition-colors",
        "hover:bg-hover hover:text-fg",
        "focus-visible:ring-2 focus-visible:ring-fg/30",
        className,
      )}
      {...props}
    />
  );
}

function ChannelSlider({
  className,
  ...props
}: ComponentProps<typeof ArkColorPicker.ChannelSlider>) {
  return (
    <ArkColorPicker.ChannelSlider
      className={cn("flex flex-col gap-1.5", className)}
      {...props}
    />
  );
}

function ChannelSliderTrack({
  className,
  ...props
}: ComponentProps<typeof ArkColorPicker.ChannelSliderTrack>) {
  return (
    <ArkColorPicker.ChannelSliderTrack
      className={cn(
        "relative h-3 w-full rounded-full border border-border",
        className,
      )}
      {...props}
    />
  );
}

function ChannelSliderThumb({
  className,
  ...props
}: ComponentProps<typeof ArkColorPicker.ChannelSliderThumb>) {
  return (
    <ArkColorPicker.ChannelSliderThumb
      className={cn(
        "size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.4)] outline-none",
        "focus-visible:ring-2 focus-visible:ring-fg/30",
        className,
      )}
      {...props}
    />
  );
}

function ChannelSliderLabel({
  className,
  ...props
}: ComponentProps<typeof ArkColorPicker.ChannelSliderLabel>) {
  return (
    <ArkColorPicker.ChannelSliderLabel
      className={cn("text-xs text-fg-soft", className)}
      {...props}
    />
  );
}

function ChannelSliderValueText({
  className,
  ...props
}: ComponentProps<typeof ArkColorPicker.ChannelSliderValueText>) {
  return (
    <ArkColorPicker.ChannelSliderValueText
      className={cn("font-mono text-xs tabular-nums text-fg-muted", className)}
      {...props}
    />
  );
}

function TransparencyGrid({
  className,
  ...props
}: ComponentProps<typeof ArkColorPicker.TransparencyGrid>) {
  return (
    <ArkColorPicker.TransparencyGrid
      className={cn("rounded-full", className)}
      {...props}
    />
  );
}

function ValueText({
  className,
  ...props
}: ComponentProps<typeof ArkColorPicker.ValueText>) {
  return (
    <ArkColorPicker.ValueText
      className={cn("font-mono text-sm text-fg", className)}
      {...props}
    />
  );
}

function View(props: ComponentProps<typeof ArkColorPicker.View>) {
  return <ArkColorPicker.View {...props} />;
}

function FormatTrigger({
  className,
  ...props
}: ComponentProps<typeof ArkColorPicker.FormatTrigger>) {
  return (
    <ArkColorPicker.FormatTrigger
      className={cn(
        "inline-flex h-7 cursor-pointer items-center gap-1 rounded-md px-2 text-xs font-medium text-fg-soft outline-none transition-colors",
        "hover:bg-hover hover:text-fg",
        "focus-visible:ring-2 focus-visible:ring-fg/30",
        className,
      )}
      {...props}
    />
  );
}

function FormatSelect({
  className,
  ...props
}: ComponentProps<typeof ArkColorPicker.FormatSelect>) {
  return (
    <ArkColorPicker.FormatSelect
      className={cn(
        "h-7 cursor-pointer rounded-md border border-border bg-surface px-2 text-xs text-fg outline-none transition-colors",
        "focus-visible:ring-2 focus-visible:ring-fg/30",
        className,
      )}
      {...props}
    />
  );
}

function SwatchGroup({
  className,
  ...props
}: ComponentProps<typeof ArkColorPicker.SwatchGroup>) {
  return (
    <ArkColorPicker.SwatchGroup
      className={cn("flex flex-wrap gap-1.5", className)}
      {...props}
    />
  );
}

function SwatchTrigger({
  className,
  ...props
}: ComponentProps<typeof ArkColorPicker.SwatchTrigger>) {
  return (
    <ArkColorPicker.SwatchTrigger
      className={cn(
        "relative inline-flex size-6 cursor-pointer items-center justify-center rounded-md outline-none transition-transform",
        "hover:scale-110",
        "focus-visible:ring-2 focus-visible:ring-fg/30 focus-visible:ring-offset-2",
        "data-[state=checked]:ring-2 data-[state=checked]:ring-fg data-[state=checked]:ring-offset-2",
        className,
      )}
      {...props}
    />
  );
}

function SwatchIndicator({
  className,
  ...props
}: ComponentProps<typeof ArkColorPicker.SwatchIndicator>) {
  return (
    <ArkColorPicker.SwatchIndicator
      className={cn(
        "absolute inset-0 flex items-center justify-center text-white drop-shadow-[0_0_2px_rgba(0,0,0,0.6)]",
        className,
      )}
      {...props}
    />
  );
}

function Swatch({
  className,
  ...props
}: ComponentProps<typeof ArkColorPicker.Swatch>) {
  return (
    <ArkColorPicker.Swatch
      className={cn(
        "relative size-full rounded-md border border-border/40",
        className,
      )}
      {...props}
    />
  );
}

const HiddenInput = ArkColorPicker.HiddenInput;
const Context = ArkColorPicker.Context;
const RootProvider = ArkColorPicker.RootProvider;

export const ColorPicker = {
  Root,
  RootProvider,
  Label,
  Control,
  ChannelInput,
  Trigger,
  ValueSwatch,
  ValueText,
  Positioner,
  Content,
  View,
  Area,
  AreaBackground,
  AreaThumb,
  EyeDropperTrigger,
  ChannelSlider,
  ChannelSliderTrack,
  ChannelSliderThumb,
  ChannelSliderLabel,
  ChannelSliderValueText,
  TransparencyGrid,
  FormatTrigger,
  FormatSelect,
  SwatchGroup,
  SwatchTrigger,
  SwatchIndicator,
  Swatch,
  HiddenInput,
  Context,
};
