"use client";

import { RadioGroup as ArkRadioGroup } from "@ark-ui/react/radio-group";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

function Root({
  className,
  ...props
}: ComponentProps<typeof ArkRadioGroup.Root>) {
  return (
    <ArkRadioGroup.Root
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  );
}

function Label({
  className,
  ...props
}: ComponentProps<typeof ArkRadioGroup.Label>) {
  return (
    <ArkRadioGroup.Label
      className={cn("text-sm font-medium text-fg-soft", className)}
      {...props}
    />
  );
}

function Indicator({
  className,
  ...props
}: ComponentProps<typeof ArkRadioGroup.Indicator>) {
  return (
    <ArkRadioGroup.Indicator
      className={cn(
        "absolute top-[var(--top)] left-[var(--left)] h-[var(--height)] w-[var(--width)] rounded-md bg-surface",
        "shadow-[0_1px_0_rgba(0,0,0,0.04),0_4px_8px_rgba(0,0,0,0.06),0_0_4px_rgba(0,0,0,0.03)]",
        "dark:shadow-[0_1px_0_rgba(0,0,0,0.4),0_4px_8px_rgba(0,0,0,0.4),0_0_4px_rgba(0,0,0,0.2)]",
        "transition-[left,top,width,height] duration-200 ease-out",
        className,
      )}
      {...props}
    />
  );
}

function Item({
  className,
  children,
  ...props
}: ComponentProps<typeof ArkRadioGroup.Item>) {
  return (
    <ArkRadioGroup.Item
      className={cn(
        "relative inline-flex cursor-pointer items-center gap-2 data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
      <ArkRadioGroup.ItemHiddenInput />
    </ArkRadioGroup.Item>
  );
}

function ItemControl({
  className,
  ...props
}: ComponentProps<typeof ArkRadioGroup.ItemControl>) {
  return (
    <ArkRadioGroup.ItemControl
      className={cn(
        "flex size-4 items-center justify-center rounded-full border border-border bg-surface transition-colors",
        "data-[state=checked]:border-fg data-[state=checked]:bg-fg",
        "*:transition-opacity *:opacity-0 data-[state=checked]:*:opacity-100",
        className,
      )}
      {...props}
    >
      <span className="size-1.5 rounded-full bg-bg" />
    </ArkRadioGroup.ItemControl>
  );
}

function ItemText({
  className,
  ...props
}: ComponentProps<typeof ArkRadioGroup.ItemText>) {
  return (
    <ArkRadioGroup.ItemText
      className={cn("text-sm text-fg", className)}
      {...props}
    />
  );
}

const ItemHiddenInput = ArkRadioGroup.ItemHiddenInput;
const Context = ArkRadioGroup.Context;
const ItemContext = ArkRadioGroup.ItemContext;
const RootProvider = ArkRadioGroup.RootProvider;

export const RadioGroup = {
  Root,
  RootProvider,
  Label,
  Indicator,
  Item,
  ItemControl,
  ItemText,
  ItemHiddenInput,
  Context,
  ItemContext,
};
