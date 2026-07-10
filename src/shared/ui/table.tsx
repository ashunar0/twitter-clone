"use client";

import { ChevronDown, ChevronsUpDown, ChevronUp } from "lucide-react";
import {
  createContext,
  type HTMLAttributes,
  type TdHTMLAttributes,
  type ThHTMLAttributes,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { cn } from "@/lib/utils";

export type TableVariant = "line" | "outline" | "striped";
export type TableSize = "sm" | "md" | "lg";

type TableContextValue = {
  variant: TableVariant;
  size: TableSize;
  stickyHeader: boolean;
  interactive: boolean;
};

const TableContext = createContext<TableContextValue>({
  variant: "line",
  size: "md",
  stickyHeader: false,
  interactive: true,
});

const useTableContext = () => useContext(TableContext);

const cellPadding: Record<TableSize, string> = {
  sm: "px-3 py-2",
  md: "px-4 py-3",
  lg: "px-5 py-4",
};

const headPadding: Record<TableSize, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-xs",
  lg: "h-12 px-5 text-sm",
};

type RootProps = HTMLAttributes<HTMLTableElement> & {
  variant?: TableVariant;
  size?: TableSize;
  stickyHeader?: boolean;
  interactive?: boolean;
};

function Root({
  variant = "line",
  size = "md",
  stickyHeader = false,
  interactive = true,
  className,
  ...props
}: RootProps) {
  return (
    <TableContext.Provider
      value={{ variant, size, stickyHeader, interactive }}
    >
      <div
        className={cn(
          "w-full overflow-x-auto",
          variant === "outline" && "rounded-lg border border-border",
        )}
      >
        <table className={cn("w-full text-sm", className)} {...props} />
      </div>
    </TableContext.Provider>
  );
}

function Header({
  className,
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  const { variant, stickyHeader } = useTableContext();
  return (
    <thead
      className={cn(
        "[&_tr:hover]:bg-transparent",
        variant !== "striped" && "border-b border-border",
        variant === "striped" && "bg-surface-sunken",
        stickyHeader && "sticky top-0 z-10 bg-surface",
        className,
      )}
      {...props}
    />
  );
}

function Body({
  className,
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  const { variant } = useTableContext();
  return (
    <tbody
      className={cn(
        variant === "line" && "divide-y divide-border-muted",
        variant === "outline" && "divide-y divide-border",
        className,
      )}
      {...props}
    />
  );
}

function Footer({
  className,
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tfoot
      className={cn(
        "border-t border-border bg-surface-sunken font-medium [&_tr:hover]:bg-transparent",
        className,
      )}
      {...props}
    />
  );
}

function Row({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) {
  const { variant, interactive } = useTableContext();
  return (
    <tr
      className={cn(
        "transition-[background-color]",
        interactive && "hover:bg-hover",
        variant === "striped" && "even:bg-surface-sunken/50",
        className,
      )}
      {...props}
    />
  );
}

function Head({
  className,
  ...props
}: ThHTMLAttributes<HTMLTableCellElement>) {
  const { size } = useTableContext();
  return (
    <th
      className={cn(
        "text-left font-medium text-fg-muted",
        headPadding[size],
        className,
      )}
      {...props}
    />
  );
}

function Cell({
  className,
  ...props
}: TdHTMLAttributes<HTMLTableCellElement>) {
  const { size } = useTableContext();
  return (
    <td
      className={cn("text-fg", cellPadding[size], className)}
      {...props}
    />
  );
}

export type SortDirection = "asc" | "desc";

type SortableHeadProps = ThHTMLAttributes<HTMLTableCellElement> & {
  active?: boolean;
  direction?: SortDirection;
  onToggle?: () => void;
};

function SortableHead({
  active = false,
  direction = "asc",
  onToggle,
  className,
  children,
  ...props
}: SortableHeadProps) {
  const { size } = useTableContext();
  const Icon = active
    ? direction === "asc"
      ? ChevronUp
      : ChevronDown
    : ChevronsUpDown;
  return (
    <th
      className={cn(
        "text-left font-medium text-fg-muted",
        headPadding[size],
        className,
      )}
      {...props}
    >
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "-mx-2 inline-flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 transition-colors hover:bg-hover",
          active && "text-fg",
        )}
      >
        {children}
        <Icon className="size-3" />
      </button>
    </th>
  );
}

type Accessor<T> = (row: T) => string | number;

type UseTableSortOptions<T, K extends string> = {
  accessors: Record<K, Accessor<T>>;
  defaultKey?: NoInfer<K>;
  defaultDirection?: SortDirection;
};

export function useTableSort<T, K extends string>(
  rows: T[],
  options: UseTableSortOptions<T, K>,
) {
  const [sortKey, setSortKey] = useState<K | undefined>(options.defaultKey);
  const [direction, setDirection] = useState<SortDirection>(
    options.defaultDirection ?? "asc",
  );

  const toggle = useCallback(
    (key: K) => {
      if (sortKey === key) {
        setDirection((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortKey(key);
        setDirection("asc");
      }
    },
    [sortKey],
  );

  const sortedRows = useMemo(() => {
    if (!sortKey) return rows;
    const accessor = options.accessors[sortKey];
    const factor = direction === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      const av = accessor(a);
      const bv = accessor(b);
      if (av < bv) return -1 * factor;
      if (av > bv) return 1 * factor;
      return 0;
    });
  }, [rows, sortKey, direction, options.accessors]);

  return { sortKey, direction, toggle, sortedRows };
}

export const Table = {
  Root,
  Header,
  Body,
  Footer,
  Row,
  Head,
  SortableHead,
  Cell,
};
