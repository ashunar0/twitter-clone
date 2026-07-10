"use client";

import { Switch as ArkSwitch } from "@ark-ui/react/switch";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

function Root({
  className,
  children,
  ...props
}: ComponentProps<typeof ArkSwitch.Root>) {
  return (
    <ArkSwitch.Root
      className={cn(
        "relative inline-flex cursor-pointer items-center gap-2",
        "data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <ArkSwitch.HiddenInput />
      {children}
    </ArkSwitch.Root>
  );
}

function Control({
  className,
  ...props
}: ComponentProps<typeof ArkSwitch.Control>) {
  return (
    <ArkSwitch.Control
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors",
        "bg-surface-sunken data-[state=checked]:bg-fg",
        className,
      )}
      {...props}
    />
  );
}

function Thumb({
  className,
  ...props
}: ComponentProps<typeof ArkSwitch.Thumb>) {
  return (
    <ArkSwitch.Thumb
      className={cn(
        "block size-4 translate-x-0.5 rounded-full bg-bg shadow transition-transform",
        "data-[state=checked]:translate-x-[18px]",
        className,
      )}
      {...props}
    />
  );
}

function Label({
  className,
  ...props
}: ComponentProps<typeof ArkSwitch.Label>) {
  return (
    <ArkSwitch.Label
      className={cn("font-medium text-fg-soft text-sm", className)}
      {...props}
    />
  );
}

const HiddenInput = ArkSwitch.HiddenInput;
const Context = ArkSwitch.Context;
const RootProvider = ArkSwitch.RootProvider;

export const Switch = {
  Root,
  RootProvider,
  Control,
  Thumb,
  Label,
  HiddenInput,
  Context,
};
