"use client";

import { Field as ArkField } from "@ark-ui/react/field";
import { ChevronDown } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

function Root({ className, ...props }: ComponentProps<typeof ArkField.Root>) {
  return (
    <ArkField.Root
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  );
}

function Label({ className, ...props }: ComponentProps<typeof ArkField.Label>) {
  return (
    <ArkField.Label
      className={cn("text-sm font-medium text-fg-soft", className)}
      {...props}
    />
  );
}

function HelperText({
  className,
  ...props
}: ComponentProps<typeof ArkField.HelperText>) {
  return (
    <ArkField.HelperText
      className={cn("text-xs text-fg-muted", className)}
      {...props}
    />
  );
}

function ErrorText({
  className,
  ...props
}: ComponentProps<typeof ArkField.ErrorText>) {
  return (
    <ArkField.ErrorText
      className={cn("text-xs text-red-600 dark:text-red-400", className)}
      {...props}
    />
  );
}

function RequiredIndicator({
  className,
  children = "*",
  ...props
}: ComponentProps<typeof ArkField.RequiredIndicator>) {
  return (
    <ArkField.RequiredIndicator
      className={cn("ml-0.5 text-red-600 dark:text-red-400", className)}
      {...props}
    >
      {children}
    </ArkField.RequiredIndicator>
  );
}

const disabledCls =
  "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-surface-sunken data-disabled:cursor-not-allowed data-disabled:opacity-50 data-disabled:bg-surface-sunken";

function Input({ className, ...props }: ComponentProps<typeof ArkField.Input>) {
  return (
    <ArkField.Input
      className={cn(
        "flex h-10 w-full rounded-sm border border-border bg-surface px-3 py-2 text-sm text-fg placeholder:text-fg-subtle focus:outline-none focus:ring-2 focus:ring-fg-subtle",
        "aria-invalid:border-red-500 aria-invalid:focus:ring-red-500/30",
        disabledCls,
        className,
      )}
      {...props}
    />
  );
}

function Textarea({
  className,
  ...props
}: ComponentProps<typeof ArkField.Textarea>) {
  return (
    <ArkField.Textarea
      className={cn(
        "flex min-h-20 w-full rounded-sm border border-border bg-surface px-3 py-2 text-sm text-fg placeholder:text-fg-subtle focus:outline-none focus:ring-2 focus:ring-fg-subtle",
        "aria-invalid:border-red-500 aria-invalid:focus:ring-red-500/30",
        disabledCls,
        className,
      )}
      {...props}
    />
  );
}

function Select({
  className,
  children,
  ...props
}: ComponentProps<typeof ArkField.Select>) {
  return (
    <div className="relative w-full">
      <ArkField.Select
        className={cn(
          "flex h-10 w-full cursor-pointer appearance-none rounded-sm border border-border bg-surface py-2 pl-3 pr-9 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-fg-subtle",
          "aria-invalid:border-red-500",
          disabledCls,
          className,
        )}
        {...props}
      >
        {children}
      </ArkField.Select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-fg-muted" />
    </div>
  );
}

const Context = ArkField.Context;
const RootProvider = ArkField.RootProvider;
const Item = ArkField.Item;

export const Field = {
  Root,
  RootProvider,
  Label,
  HelperText,
  ErrorText,
  RequiredIndicator,
  Input,
  Textarea,
  Select,
  Item,
  Context,
};
