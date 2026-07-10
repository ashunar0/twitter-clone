"use client";

import { Checkbox as ArkCheckbox } from "@ark-ui/react/checkbox";
import { Check, Minus } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

function Root({
  className,
  children,
  ...props
}: ComponentProps<typeof ArkCheckbox.Root>) {
  return (
    <ArkCheckbox.Root
      className={cn(
        "relative inline-flex cursor-pointer items-center gap-2 align-middle data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
      <ArkCheckbox.HiddenInput />
    </ArkCheckbox.Root>
  );
}

function Control({
  className,
  children,
  ...props
}: ComponentProps<typeof ArkCheckbox.Control>) {
  return (
    <ArkCheckbox.Control
      className={cn(
        "flex size-4 items-center justify-center rounded-sm border border-border bg-surface transition-colors",
        "data-[state=checked]:border-fg data-[state=checked]:bg-fg data-[state=checked]:text-bg",
        "data-[state=indeterminate]:border-fg data-[state=indeterminate]:bg-fg data-[state=indeterminate]:text-bg",
        className,
      )}
      {...props}
    >
      {children ?? (
        <>
          <ArkCheckbox.Indicator>
            <Check className="size-3" strokeWidth={3} />
          </ArkCheckbox.Indicator>
          <ArkCheckbox.Indicator indeterminate>
            <Minus className="size-3" strokeWidth={3} />
          </ArkCheckbox.Indicator>
        </>
      )}
    </ArkCheckbox.Control>
  );
}

function Label({
  className,
  ...props
}: ComponentProps<typeof ArkCheckbox.Label>) {
  return (
    <ArkCheckbox.Label
      className={cn("text-sm text-fg", className)}
      {...props}
    />
  );
}

function Group({
  className,
  ...props
}: ComponentProps<typeof ArkCheckbox.Group>) {
  return (
    <ArkCheckbox.Group
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  );
}

const Indicator = ArkCheckbox.Indicator;
const HiddenInput = ArkCheckbox.HiddenInput;
const Context = ArkCheckbox.Context;
const RootProvider = ArkCheckbox.RootProvider;
const GroupProvider = ArkCheckbox.GroupProvider;

export const Checkbox = {
  Root,
  RootProvider,
  Group,
  GroupProvider,
  Control,
  Indicator,
  Label,
  HiddenInput,
  Context,
};
