"use client";

import { NumberInput as ArkNumberInput } from "@ark-ui/react/number-input";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

function Root({
  className,
  ...props
}: ComponentProps<typeof ArkNumberInput.Root>) {
  return (
    <ArkNumberInput.Root
      className={cn("flex flex-col gap-1.5", className)}
      {...props}
    />
  );
}

function Label({
  className,
  ...props
}: ComponentProps<typeof ArkNumberInput.Label>) {
  return (
    <ArkNumberInput.Label
      className={cn("text-sm font-medium text-fg-soft", className)}
      {...props}
    />
  );
}

function Control({
  className,
  ...props
}: ComponentProps<typeof ArkNumberInput.Control>) {
  return (
    <ArkNumberInput.Control
      className={cn(
        "inline-flex h-9 w-32 items-stretch overflow-hidden rounded-md border border-border bg-surface transition-colors",
        "focus-within:ring-2 focus-within:ring-fg/20",
        "data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

function Input({
  className,
  ...props
}: ComponentProps<typeof ArkNumberInput.Input>) {
  return (
    <ArkNumberInput.Input
      className={cn(
        "h-full min-w-0 flex-1 bg-transparent px-3 text-sm tabular-nums text-fg placeholder:text-fg-subtle focus:outline-none",
        className,
      )}
      {...props}
    />
  );
}

function IncrementTrigger({
  className,
  ...props
}: ComponentProps<typeof ArkNumberInput.IncrementTrigger>) {
  return (
    <ArkNumberInput.IncrementTrigger
      className={cn(
        "flex cursor-pointer items-center justify-center text-fg-muted hover:bg-hover hover:text-fg",
        "data-disabled:cursor-not-allowed data-disabled:hover:bg-transparent data-disabled:hover:text-fg-muted",
        className,
      )}
      {...props}
    />
  );
}

function DecrementTrigger({
  className,
  ...props
}: ComponentProps<typeof ArkNumberInput.DecrementTrigger>) {
  return (
    <ArkNumberInput.DecrementTrigger
      className={cn(
        "flex cursor-pointer items-center justify-center text-fg-muted hover:bg-hover hover:text-fg",
        "data-disabled:cursor-not-allowed data-disabled:hover:bg-transparent data-disabled:hover:text-fg-muted",
        className,
      )}
      {...props}
    />
  );
}

function Scrubber({
  className,
  ...props
}: ComponentProps<typeof ArkNumberInput.Scrubber>) {
  return (
    <ArkNumberInput.Scrubber
      className={cn("cursor-ew-resize select-none", className)}
      {...props}
    />
  );
}

function ValueText({
  className,
  ...props
}: ComponentProps<typeof ArkNumberInput.ValueText>) {
  return (
    <ArkNumberInput.ValueText
      className={cn("text-sm tabular-nums text-fg", className)}
      {...props}
    />
  );
}

function Stepper({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex w-6 shrink-0 flex-col border-l border-border-muted",
        className,
      )}
    >
      <IncrementTrigger className="flex-1">
        <ChevronUp className="size-3" />
      </IncrementTrigger>
      <DecrementTrigger className="flex-1">
        <ChevronDown className="size-3" />
      </DecrementTrigger>
    </div>
  );
}

const Context = ArkNumberInput.Context;
const RootProvider = ArkNumberInput.RootProvider;

export const NumberInput = {
  Root,
  RootProvider,
  Label,
  Control,
  Input,
  IncrementTrigger,
  DecrementTrigger,
  Stepper,
  Scrubber,
  ValueText,
  Context,
};
