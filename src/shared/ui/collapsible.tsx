"use client";

import { Collapsible as ArkCollapsible } from "@ark-ui/react/collapsible";
import { ChevronDown } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

function Root({
  className,
  ...props
}: ComponentProps<typeof ArkCollapsible.Root>) {
  return (
    <ArkCollapsible.Root
      className={cn("flex flex-col", className)}
      {...props}
    />
  );
}

function Trigger({
  className,
  ...props
}: ComponentProps<typeof ArkCollapsible.Trigger>) {
  return (
    <ArkCollapsible.Trigger
      className={cn(
        "inline-flex w-fit cursor-pointer items-center gap-1.5 bg-transparent text-sm font-medium text-fg outline-none transition-colors",
        "hover:text-fg-soft",
        "focus-visible:ring-2 focus-visible:ring-fg/30 focus-visible:ring-offset-2 focus-visible:rounded-sm",
        "data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

function Indicator({
  className,
  children,
  ...props
}: ComponentProps<typeof ArkCollapsible.Indicator>) {
  return (
    <ArkCollapsible.Indicator
      className={cn(
        "inline-flex size-4 items-center justify-center text-fg-muted transition-transform duration-150",
        "data-[state=open]:rotate-180",
        className,
      )}
      {...props}
    >
      {children ?? <ChevronDown className="size-3.5" strokeWidth={2.25} />}
    </ArkCollapsible.Indicator>
  );
}

function Content({
  className,
  ...props
}: ComponentProps<typeof ArkCollapsible.Content>) {
  return (
    <ArkCollapsible.Content
      className={cn(
        "overflow-hidden",
        "data-[state=open]:animate-accordion-down",
        "data-[state=closed]:animate-accordion-up",
        className,
      )}
      {...props}
    />
  );
}

const Context = ArkCollapsible.Context;
const RootProvider = ArkCollapsible.RootProvider;

export const Collapsible = {
  Root,
  RootProvider,
  Trigger,
  Indicator,
  Content,
  Context,
};
