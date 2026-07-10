import type { CSSProperties, HTMLAttributes, SVGAttributes } from "react";
import { cn } from "@/lib/utils";

type ProgressState = "loading" | "complete" | "indeterminate";

type RootProps = HTMLAttributes<HTMLDivElement> & {
  value: number | null;
  min?: number;
  max?: number;
};

function Root({
  value,
  min = 0,
  max = 100,
  className,
  style,
  ...props
}: RootProps) {
  const percent =
    value === null ? 0 : ((value - min) / (max - min)) * 100;
  const state: ProgressState =
    value === null
      ? "indeterminate"
      : percent >= 100
        ? "complete"
        : "loading";
  return (
    <div
      data-state={state}
      style={{ ...style, "--progress": percent } as CSSProperties}
      className={cn("group/progress flex flex-col gap-1.5", className)}
      {...props}
    />
  );
}

function Label({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn("text-xs font-medium text-fg-soft", className)}
      {...props}
    />
  );
}

function ValueText({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn("text-xs tabular-nums text-fg-muted", className)}
      {...props}
    />
  );
}

function Track({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "h-2 w-full overflow-hidden rounded-full bg-surface-sunken",
        className,
      )}
      {...props}
    />
  );
}

function Range({ className, style, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      style={{ width: "calc(var(--progress) * 1%)", ...style }}
      className={cn(
        "h-full bg-fg transition-[width] duration-300 ease-out",
        "group-data-[state=indeterminate]/progress:!w-1/3 group-data-[state=indeterminate]/progress:bg-fg-muted group-data-[state=indeterminate]/progress:animate-pulse",
        className,
      )}
      {...props}
    />
  );
}

type CircleProps = SVGAttributes<SVGSVGElement> & {
  size?: number;
  thickness?: number;
};

function Circle({
  size = 48,
  thickness = 4,
  className,
  style,
  children,
  ...props
}: CircleProps) {
  const cx = size / 2;
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={
        {
          "--cx": cx,
          "--r": r,
          "--c": c,
          "--thickness": thickness,
          ...style,
        } as CSSProperties
      }
      className={cn("-rotate-90", className)}
      {...props}
    >
      {children}
    </svg>
  );
}

const CIRCLE_GEOM: CSSProperties = {
  cx: "var(--cx)",
  cy: "var(--cx)",
  r: "var(--r)",
  fill: "none",
  strokeWidth: "var(--thickness)",
};

function CircleTrack({
  className,
  style,
  ...props
}: SVGAttributes<SVGCircleElement>) {
  return (
    <circle
      style={{ ...CIRCLE_GEOM, ...style }}
      className={cn("stroke-surface-sunken", className)}
      {...props}
    />
  );
}

function CircleRange({
  className,
  style,
  ...props
}: SVGAttributes<SVGCircleElement>) {
  return (
    <circle
      style={
        {
          ...CIRCLE_GEOM,
          strokeDasharray: "var(--c)",
          strokeDashoffset: "calc(var(--c) * (1 - var(--progress) / 100))",
          strokeLinecap: "round",
          transition: "stroke-dashoffset 300ms ease-out",
          ...style,
        } as CSSProperties
      }
      className={cn(
        "stroke-fg",
        "group-data-[state=indeterminate]/progress:stroke-fg-muted",
        className,
      )}
      {...props}
    />
  );
}

export const Progress = {
  Root,
  Label,
  ValueText,
  Track,
  Range,
  Circle,
  CircleTrack,
  CircleRange,
};
