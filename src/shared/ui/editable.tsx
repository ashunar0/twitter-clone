"use client";

import { Editable as ArkEditable } from "@ark-ui/react/editable";
import { Check, Pencil, X } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

function Root({
  className,
  ...props
}: ComponentProps<typeof ArkEditable.Root>) {
  return (
    <ArkEditable.Root
      className={cn("flex flex-col gap-1.5", className)}
      {...props}
    />
  );
}

function Label({
  className,
  ...props
}: ComponentProps<typeof ArkEditable.Label>) {
  return (
    <ArkEditable.Label
      className={cn("text-sm font-medium text-fg-soft", className)}
      {...props}
    />
  );
}

function Area({
  className,
  ...props
}: ComponentProps<typeof ArkEditable.Area>) {
  return (
    <ArkEditable.Area
      className={cn("flex items-center", className)}
      {...props}
    />
  );
}

function Preview({
  className,
  ...props
}: ComponentProps<typeof ArkEditable.Preview>) {
  return (
    <ArkEditable.Preview
      className={cn(
        "inline-flex min-h-9 cursor-text items-center rounded-md px-2 py-1 text-sm text-fg outline-none transition-colors",
        "hover:bg-hover",
        "data-placeholder-shown:text-fg-subtle",
        className,
      )}
      {...props}
    />
  );
}

function Input({
  className,
  ...props
}: ComponentProps<typeof ArkEditable.Input>) {
  return (
    <ArkEditable.Input
      className={cn(
        "flex h-9 min-w-0 flex-1 rounded-md border border-border bg-surface px-2 text-sm text-fg outline-none transition-colors",
        "focus:border-fg focus:ring-2 focus:ring-fg/20",
        className,
      )}
      {...props}
    />
  );
}

function Control({
  className,
  ...props
}: ComponentProps<typeof ArkEditable.Control>) {
  return (
    <ArkEditable.Control
      className={cn("flex items-center gap-1", className)}
      {...props}
    />
  );
}

const triggerStyles = cn(
  "inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-fg-soft outline-none transition-colors",
  "hover:bg-hover hover:text-fg",
  "focus-visible:ring-2 focus-visible:ring-fg/30",
);

function EditTrigger({
  className,
  children,
  ...props
}: ComponentProps<typeof ArkEditable.EditTrigger>) {
  return (
    <ArkEditable.EditTrigger className={cn(triggerStyles, className)} {...props}>
      {children ?? <Pencil className="size-3.5" strokeWidth={2.25} />}
    </ArkEditable.EditTrigger>
  );
}

function SubmitTrigger({
  className,
  children,
  ...props
}: ComponentProps<typeof ArkEditable.SubmitTrigger>) {
  return (
    <ArkEditable.SubmitTrigger
      className={cn(triggerStyles, className)}
      {...props}
    >
      {children ?? <Check className="size-3.5" strokeWidth={2.5} />}
    </ArkEditable.SubmitTrigger>
  );
}

function CancelTrigger({
  className,
  children,
  ...props
}: ComponentProps<typeof ArkEditable.CancelTrigger>) {
  return (
    <ArkEditable.CancelTrigger
      className={cn(triggerStyles, className)}
      {...props}
    >
      {children ?? <X className="size-3.5" strokeWidth={2.25} />}
    </ArkEditable.CancelTrigger>
  );
}

const Context = ArkEditable.Context;
const RootProvider = ArkEditable.RootProvider;

export const Editable = {
  Root,
  RootProvider,
  Label,
  Area,
  Preview,
  Input,
  Control,
  EditTrigger,
  SubmitTrigger,
  CancelTrigger,
  Context,
};
