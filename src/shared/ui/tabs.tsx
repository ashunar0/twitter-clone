"use client";

import { Tabs as ArkTabs } from "@ark-ui/react/tabs";
import { type ComponentProps, createContext, useContext } from "react";
import { cn } from "@/lib/utils";

type TabsVariant = "enclosed" | "line";

const TabsContext = createContext<{ variant: TabsVariant }>({
  variant: "enclosed",
});
const useTabsContext = () => useContext(TabsContext);

type RootProps = ComponentProps<typeof ArkTabs.Root> & {
  variant?: TabsVariant;
};

function Root({ variant = "enclosed", ...props }: RootProps) {
  return (
    <TabsContext.Provider value={{ variant }}>
      <ArkTabs.Root {...props} />
    </TabsContext.Provider>
  );
}

const listVariantClasses: Record<TabsVariant, string> = {
  enclosed: "rounded-lg bg-surface-sunken p-1 gap-1",
  line: "border-b border-border gap-4",
};

function List({ className, ...props }: ComponentProps<typeof ArkTabs.List>) {
  const { variant } = useTabsContext();
  return (
    <ArkTabs.List
      className={cn(
        "relative inline-flex items-center",
        listVariantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}

const indicatorVariantClasses: Record<TabsVariant, string> = {
  enclosed:
    "top-[var(--top)] left-[var(--left)] h-[var(--height)] w-[var(--width)] rounded-md bg-surface " +
    "shadow-[0_1px_0_rgba(0,0,0,0.04),0_4px_8px_rgba(0,0,0,0.06),0_0_4px_rgba(0,0,0,0.03)] " +
    "dark:shadow-[0_1px_0_rgba(0,0,0,0.4),0_4px_8px_rgba(0,0,0,0.4),0_0_4px_rgba(0,0,0,0.2)]",
  line: "bottom-[-1px] left-[var(--left)] h-0.5 w-[var(--width)] bg-fg",
};

function Indicator({
  className,
  ...props
}: ComponentProps<typeof ArkTabs.Indicator>) {
  const { variant } = useTabsContext();
  return (
    <ArkTabs.Indicator
      className={cn(
        "absolute transition-[left,top,width,height] duration-200 ease-out",
        indicatorVariantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}

const triggerVariantClasses: Record<TabsVariant, string> = {
  enclosed: "rounded-md px-3 py-1.5 hover:text-fg-soft data-selected:text-fg",
  line: "rounded-none px-1 py-2 hover:text-fg-soft data-selected:text-fg",
};

function Trigger({
  className,
  ...props
}: ComponentProps<typeof ArkTabs.Trigger>) {
  const { variant } = useTabsContext();
  return (
    <ArkTabs.Trigger
      className={cn(
        "relative z-10 inline-flex items-center justify-center gap-1.5 text-sm font-medium text-fg-muted outline-none transition-colors",
        "focus-visible:ring-2 focus-visible:ring-fg/20",
        "data-disabled:cursor-not-allowed data-disabled:opacity-50",
        triggerVariantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}

function Content({
  className,
  ...props
}: ComponentProps<typeof ArkTabs.Content>) {
  return (
    <ArkTabs.Content
      className={cn("focus-visible:outline-none", className)}
      {...props}
    />
  );
}

const Context = ArkTabs.Context;
const RootProvider = ArkTabs.RootProvider;

export const Tabs = {
  Root,
  RootProvider,
  List,
  Indicator,
  Trigger,
  Content,
  Context,
};
