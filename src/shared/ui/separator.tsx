import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Orientation = "horizontal" | "vertical";

type SeparatorProps = HTMLAttributes<HTMLDivElement> & {
  orientation?: Orientation;
  decorative?: boolean;
};

function Separator({
  orientation = "horizontal",
  decorative = true,
  className,
  ...props
}: SeparatorProps) {
  const a11yProps = decorative
    ? { role: "none" as const }
    : {
        role: "separator" as const,
        "aria-orientation": orientation,
      };

  return (
    <div
      {...a11yProps}
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className,
      )}
      {...props}
    />
  );
}

export { Separator };
