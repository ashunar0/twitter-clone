"use client";

import {
  TreeView as ArkTreeView,
  type TreeNode,
} from "@ark-ui/react/tree-view";
import { Check, ChevronRight, Minus } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

function Root<T extends TreeNode>({
  className,
  ...props
}: ArkTreeView.RootProps<T>) {
  return (
    <ArkTreeView.Root
      className={cn("flex flex-col gap-1.5", className)}
      {...props}
    />
  );
}

function Label({
  className,
  ...props
}: ComponentProps<typeof ArkTreeView.Label>) {
  return (
    <ArkTreeView.Label
      className={cn("text-sm font-medium text-fg-soft", className)}
      {...props}
    />
  );
}

function Tree({
  className,
  ...props
}: ComponentProps<typeof ArkTreeView.Tree>) {
  return (
    <ArkTreeView.Tree
      className={cn(
        "flex flex-col gap-0.5 rounded-md border border-border bg-surface p-2",
        className,
      )}
      {...props}
    />
  );
}

const rowStyles = cn(
  "flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-fg-soft outline-none transition-colors",
  "hover:bg-hover hover:text-fg",
  "focus-visible:ring-2 focus-visible:ring-fg/30",
  "data-selected:bg-surface-sunken data-selected:text-fg",
  "data-disabled:cursor-not-allowed data-disabled:opacity-50 data-disabled:hover:bg-transparent",
);

function BranchControl({
  className,
  ...props
}: ComponentProps<typeof ArkTreeView.BranchControl>) {
  return (
    <ArkTreeView.BranchControl
      className={cn(rowStyles, "cursor-pointer", className)}
      {...props}
    />
  );
}

function BranchIndicator({
  className,
  children,
  ...props
}: ComponentProps<typeof ArkTreeView.BranchIndicator>) {
  return (
    <ArkTreeView.BranchIndicator
      className={cn(
        "inline-flex size-4 shrink-0 items-center justify-center text-fg-muted transition-transform duration-150",
        "data-[state=open]:rotate-90",
        className,
      )}
      {...props}
    >
      {children ?? <ChevronRight className="size-3.5" strokeWidth={2.25} />}
    </ArkTreeView.BranchIndicator>
  );
}

function BranchText({
  className,
  ...props
}: ComponentProps<typeof ArkTreeView.BranchText>) {
  return (
    <ArkTreeView.BranchText
      className={cn("truncate", className)}
      {...props}
    />
  );
}

function BranchContent({
  className,
  ...props
}: ComponentProps<typeof ArkTreeView.BranchContent>) {
  return (
    <ArkTreeView.BranchContent
      className={cn("relative flex flex-col gap-0.5 pl-4", className)}
      {...props}
    />
  );
}

function BranchIndentGuide({
  className,
  ...props
}: ComponentProps<typeof ArkTreeView.BranchIndentGuide>) {
  return (
    <ArkTreeView.BranchIndentGuide
      className={cn(
        "absolute top-0 bottom-0 left-2 w-px bg-border",
        className,
      )}
      {...props}
    />
  );
}

function Item({
  className,
  ...props
}: ComponentProps<typeof ArkTreeView.Item>) {
  return (
    <ArkTreeView.Item
      className={cn(rowStyles, "cursor-pointer pl-[1.875rem]", className)}
      {...props}
    />
  );
}

function ItemText({
  className,
  ...props
}: ComponentProps<typeof ArkTreeView.ItemText>) {
  return (
    <ArkTreeView.ItemText className={cn("truncate", className)} {...props} />
  );
}

function ItemIndicator({
  className,
  ...props
}: ComponentProps<typeof ArkTreeView.ItemIndicator>) {
  return (
    <ArkTreeView.ItemIndicator
      className={cn(
        "inline-flex size-1.5 shrink-0 rounded-full bg-fg",
        className,
      )}
      {...props}
    />
  );
}

function BranchTrigger({
  className,
  ...props
}: ComponentProps<typeof ArkTreeView.BranchTrigger>) {
  return (
    <ArkTreeView.BranchTrigger
      className={cn(
        "inline-flex cursor-pointer items-center justify-center rounded outline-none",
        "focus-visible:ring-2 focus-visible:ring-fg/30",
        className,
      )}
      {...props}
    />
  );
}

function NodeCheckbox({
  className,
  children,
  ...props
}: ComponentProps<typeof ArkTreeView.NodeCheckbox>) {
  return (
    <ArkTreeView.NodeCheckbox
      className={cn(
        "group inline-flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-sm border border-border bg-surface text-bg outline-none transition-colors",
        "hover:border-fg-muted",
        "focus-visible:ring-2 focus-visible:ring-fg/30",
        "data-[state=checked]:border-fg data-[state=checked]:bg-fg",
        "data-[state=indeterminate]:border-fg data-[state=indeterminate]:bg-fg",
        "data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children ?? <NodeCheckboxIndicator />}
    </ArkTreeView.NodeCheckbox>
  );
}

function NodeCheckboxIndicator({
  className,
  ...props
}: ComponentProps<typeof ArkTreeView.NodeCheckboxIndicator>) {
  return (
    <ArkTreeView.NodeCheckboxIndicator
      className={cn("inline-flex items-center justify-center", className)}
      {...props}
    >
      <Check
        className="hidden size-3 group-data-[state=checked]:block"
        strokeWidth={3}
      />
      <Minus
        className="hidden size-3 group-data-[state=indeterminate]:block"
        strokeWidth={3}
      />
    </ArkTreeView.NodeCheckboxIndicator>
  );
}

const Branch = ArkTreeView.Branch;
const NodeProvider = ArkTreeView.NodeProvider;
const NodeContext = ArkTreeView.NodeContext;
const NodeRenameInput = ArkTreeView.NodeRenameInput;
const Context = ArkTreeView.Context;
const RootProvider = ArkTreeView.RootProvider;

export const TreeView = {
  Root,
  RootProvider,
  Label,
  Tree,
  Branch,
  BranchControl,
  BranchTrigger,
  BranchIndicator,
  BranchText,
  BranchContent,
  BranchIndentGuide,
  Item,
  ItemText,
  ItemIndicator,
  NodeProvider,
  NodeContext,
  NodeCheckbox,
  NodeCheckboxIndicator,
  NodeRenameInput,
  Context,
};
