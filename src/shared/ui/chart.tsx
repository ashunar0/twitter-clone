"use client";

import type { ComponentProps, HTMLAttributes, ReactElement } from "react";
import {
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  type TooltipContentProps,
} from "recharts";
import { cn } from "@/lib/utils";

type ContainerProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactElement;
  aspect?: number;
};

function Container({
  className,
  children,
  aspect = 16 / 9,
  ...props
}: ContainerProps) {
  return (
    <div className={cn("w-full text-sm", className)} {...props}>
      <ResponsiveContainer width="100%" aspect={aspect}>
        {children}
      </ResponsiveContainer>
    </div>
  );
}

function TooltipContent({ active, payload, label }: TooltipContentProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-border bg-surface px-3 py-2 shadow-md">
      {label !== undefined && label !== "" && (
        <div className="mb-1.5 font-medium text-fg-muted text-xs">{label}</div>
      )}
      <ul className="flex flex-col gap-1">
        {payload.map((item) => (
          <li
            key={`${item.dataKey}`}
            className="flex items-center gap-2 text-sm"
          >
            <span
              className="size-2 rounded-sm"
              style={{ background: item.color }}
            />
            <span className="text-fg-soft">{item.name}</span>
            <span className="ml-3 font-medium text-fg tabular-nums">
              {item.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Tooltip(props: ComponentProps<typeof RechartsTooltip>) {
  return (
    <RechartsTooltip
      cursor={{
        stroke: "var(--color-border)",
        strokeDasharray: "3 3",
        fill: "var(--color-fg)",
        fillOpacity: 0.04,
      }}
      content={TooltipContent}
      {...props}
    />
  );
}

export const Chart = {
  Container,
  Tooltip,
};
