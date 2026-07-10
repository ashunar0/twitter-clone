"use client";

import { Fieldset as ArkFieldset } from "@ark-ui/react/fieldset";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

function Root({
  className,
  ...props
}: ComponentProps<typeof ArkFieldset.Root>) {
  return (
    <ArkFieldset.Root
      className={cn(
        "flex flex-col gap-4 rounded-md border border-border bg-surface p-4",
        "data-disabled:opacity-60",
        className,
      )}
      {...props}
    />
  );
}

function Legend({
  className,
  ...props
}: ComponentProps<typeof ArkFieldset.Legend>) {
  return (
    <ArkFieldset.Legend
      className={cn(
        "px-1 text-sm font-semibold tracking-tight text-fg",
        className,
      )}
      {...props}
    />
  );
}

function HelperText({
  className,
  ...props
}: ComponentProps<typeof ArkFieldset.HelperText>) {
  return (
    <ArkFieldset.HelperText
      className={cn("-mt-2 text-xs text-fg-muted", className)}
      {...props}
    />
  );
}

function ErrorText({
  className,
  ...props
}: ComponentProps<typeof ArkFieldset.ErrorText>) {
  return (
    <ArkFieldset.ErrorText
      className={cn("text-xs text-red-500", className)}
      {...props}
    />
  );
}

const Context = ArkFieldset.Context;
const RootProvider = ArkFieldset.RootProvider;

export const Fieldset = {
  Root,
  RootProvider,
  Legend,
  HelperText,
  ErrorText,
  Context,
};
