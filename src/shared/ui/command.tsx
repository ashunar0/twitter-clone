import { Search } from "lucide-react";
import type { ComponentProps, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Dialog } from "./dialog";
import { Listbox, createListCollection } from "./listbox";

const Root = Listbox.Root;
const RootProvider = Listbox.RootProvider;
const Group = Listbox.ItemGroup;
const GroupLabel = Listbox.ItemGroupLabel;
const ItemText = Listbox.ItemText;
const ItemIndicator = Listbox.ItemIndicator;
const Context = Listbox.Context;
const ItemContext = Listbox.ItemContext;

function Item({
  className,
  ...props
}: ComponentProps<typeof Listbox.Item>) {
  return (
    <Listbox.Item
      className={cn("justify-start gap-2 px-2 py-2", className)}
      {...props}
    />
  );
}

function Empty({
  className,
  ...props
}: ComponentProps<typeof Listbox.Empty>) {
  return (
    <Listbox.Empty
      className={cn("py-6 text-center text-sm text-fg-muted", className)}
      {...props}
    />
  );
}

function Input({
  className,
  ...props
}: ComponentProps<typeof Listbox.Input>) {
  return (
    <div className="flex items-center gap-2 border-b border-border px-3">
      <Search className="size-4 shrink-0 text-fg-muted" />
      <Listbox.Input
        className={cn(
          "h-11 flex-1 rounded-none border-0 bg-transparent px-0 text-sm text-fg outline-none placeholder:text-fg-muted focus:border-0 focus:ring-0",
          className,
        )}
        {...props}
      />
    </div>
  );
}

function List({
  className,
  ...props
}: ComponentProps<typeof Listbox.Content>) {
  return (
    <Listbox.Content
      className={cn(
        "max-h-80 rounded-none border-0 bg-transparent p-2",
        className,
      )}
      {...props}
    />
  );
}

function Shortcut({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "ml-auto flex items-center gap-1 text-xs text-fg-muted",
        className,
      )}
      {...props}
    />
  );
}

function DialogContent({
  className,
  children,
  ...props
}: ComponentProps<typeof Dialog.Content>) {
  return (
    <Dialog.Content
      className={cn("max-w-lg overflow-hidden p-0", className)}
      {...props}
    >
      {children}
    </Dialog.Content>
  );
}

export const Command = {
  Root,
  RootProvider,
  Input,
  List,
  Empty,
  Group,
  GroupLabel,
  Item,
  ItemText,
  ItemIndicator,
  Shortcut,
  Dialog: Dialog.Root,
  DialogTrigger: Dialog.Trigger,
  DialogContent,
  DialogCloseTrigger: Dialog.CloseTrigger,
  Context,
  ItemContext,
};

export { createListCollection };
