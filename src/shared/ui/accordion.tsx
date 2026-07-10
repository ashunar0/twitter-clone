"use client";

import { Accordion as ArkAccordion } from "@ark-ui/react/accordion";
import { ChevronDown } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

function Root({
  className,
  ...props
}: ComponentProps<typeof ArkAccordion.Root>) {
  return (
    <ArkAccordion.Root
      className={cn(
        "flex flex-col overflow-hidden rounded-md border border-border bg-surface",
        className,
      )}
      {...props}
    />
  );
}

function Item({
  className,
  ...props
}: ComponentProps<typeof ArkAccordion.Item>) {
  return (
    <ArkAccordion.Item
      className={cn("border-b border-border-muted last:border-b-0", className)}
      {...props}
    />
  );
}

function ItemTrigger({
  className,
  ...props
}: ComponentProps<typeof ArkAccordion.ItemTrigger>) {
  return (
    <ArkAccordion.ItemTrigger
      className={cn(
        "flex w-full cursor-pointer items-center justify-between gap-2 bg-transparent px-4 py-3 text-left text-sm font-medium text-fg outline-none transition-colors",
        "hover:bg-hover",
        "data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

function ItemIndicator({
  className,
  children,
  ...props
}: ComponentProps<typeof ArkAccordion.ItemIndicator>) {
  return (
    <ArkAccordion.ItemIndicator
      className={cn(
        "text-fg-muted transition-transform data-[state=open]:rotate-180",
        className,
      )}
      {...props}
    >
      {children ?? <ChevronDown className="size-4" />}
    </ArkAccordion.ItemIndicator>
  );
}

function ItemContent({
  className,
  children,
  ...props
}: ComponentProps<typeof ArkAccordion.ItemContent>) {
  return (
    <ArkAccordion.ItemContent
      className={cn(
        "overflow-hidden text-sm text-fg-soft",
        "data-[state=open]:animate-accordion-down",
        "data-[state=closed]:animate-accordion-up",
        className,
      )}
      {...props}
    >
      <div className="px-4 py-3">{children}</div>
    </ArkAccordion.ItemContent>
  );
}

const Context = ArkAccordion.Context;
const ItemContext = ArkAccordion.ItemContext;
const RootProvider = ArkAccordion.RootProvider;

export const Accordion = {
  Root,
  RootProvider,
  Item,
  ItemTrigger,
  ItemIndicator,
  ItemContent,
  Context,
  ItemContext,
};
