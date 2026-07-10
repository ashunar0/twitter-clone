import type { ComponentProps, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Separator } from "./separator";

type Orientation = "horizontal" | "vertical";

type RootProps = HTMLAttributes<HTMLDivElement> & {
  orientation?: Orientation;
};

function Root({
  orientation = "horizontal",
  className,
  ...props
}: RootProps) {
  return (
    <div
      role="toolbar"
      aria-orientation={orientation}
      className={cn(
        "inline-flex items-center gap-1 rounded-md border border-border bg-surface p-1",
        orientation === "vertical" && "flex-col items-stretch",
        className,
      )}
      {...props}
    />
  );
}

type ToolbarSeparatorProps = Omit<
  ComponentProps<typeof Separator>,
  "orientation"
>;

function ToolbarSeparator({ className, ...props }: ToolbarSeparatorProps) {
  return (
    <Separator
      orientation="vertical"
      className={cn("mx-1 h-5", className)}
      {...props}
    />
  );
}

export const Toolbar = { Root, Separator: ToolbarSeparator };
