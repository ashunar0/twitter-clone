import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Direction = "row" | "column" | "row-reverse" | "column-reverse";
type Gap = "none" | "xs" | "sm" | "md" | "lg" | "xl";
type Align = "start" | "center" | "end" | "stretch" | "baseline";
type Justify =
  | "start"
  | "center"
  | "end"
  | "between"
  | "around"
  | "evenly";

type StackProps = HTMLAttributes<HTMLDivElement> & {
  direction?: Direction;
  gap?: Gap;
  align?: Align;
  justify?: Justify;
  wrap?: boolean;
};

const directionClasses: Record<Direction, string> = {
  row: "flex-row",
  column: "flex-col",
  "row-reverse": "flex-row-reverse",
  "column-reverse": "flex-col-reverse",
};

const gapClasses: Record<Gap, string> = {
  none: "gap-0",
  xs: "gap-1",
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
  xl: "gap-8",
};

const alignClasses: Record<Align, string> = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
  baseline: "items-baseline",
};

const justifyClasses: Record<Justify, string> = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
  around: "justify-around",
  evenly: "justify-evenly",
};

function Stack({
  direction = "column",
  gap = "md",
  align,
  justify,
  wrap,
  className,
  ...props
}: StackProps) {
  return (
    <div
      className={cn(
        "flex",
        directionClasses[direction],
        gapClasses[gap],
        align && alignClasses[align],
        justify && justifyClasses[justify],
        wrap && "flex-wrap",
        className,
      )}
      {...props}
    />
  );
}

export { Stack };
