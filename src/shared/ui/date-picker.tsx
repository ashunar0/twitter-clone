"use client";

import { DatePicker as ArkDatePicker } from "@ark-ui/react/date-picker";
import { Portal } from "@ark-ui/react/portal";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

function Root({
  className,
  ...props
}: ComponentProps<typeof ArkDatePicker.Root>) {
  return (
    <ArkDatePicker.Root
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  );
}

function Label({
  className,
  ...props
}: ComponentProps<typeof ArkDatePicker.Label>) {
  return (
    <ArkDatePicker.Label
      className={cn("text-sm font-medium text-fg-soft", className)}
      {...props}
    />
  );
}

function Control({
  className,
  ...props
}: ComponentProps<typeof ArkDatePicker.Control>) {
  return (
    <ArkDatePicker.Control
      className={cn("flex items-center gap-2", className)}
      {...props}
    />
  );
}

function Input({
  className,
  ...props
}: ComponentProps<typeof ArkDatePicker.Input>) {
  return (
    <ArkDatePicker.Input
      className={cn(
        "flex h-10 min-w-0 flex-1 rounded-sm border border-border bg-surface px-3 py-2 text-sm text-fg placeholder:text-fg-subtle focus:outline-none focus:ring-2 focus:ring-fg-subtle",
        className,
      )}
      {...props}
    />
  );
}

function Trigger({
  className,
  ...props
}: ComponentProps<typeof ArkDatePicker.Trigger>) {
  return (
    <ArkDatePicker.Trigger
      className={cn(
        "inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-sm border border-border bg-surface text-fg-soft transition-colors hover:bg-hover hover:text-fg",
        className,
      )}
      {...props}
    />
  );
}

function Content({
  className,
  ...props
}: ComponentProps<typeof ArkDatePicker.Content>) {
  return (
    <Portal>
      <ArkDatePicker.Positioner className="z-50!">
        <ArkDatePicker.Content
          className={cn(
            "rounded-md border border-border bg-surface p-3 shadow-[0_1px_0_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.08),0_0_4px_rgba(0,0,0,0.03)] focus:outline-none",
            "data-[state=open]:animate-menu-open",
            className,
          )}
          {...props}
        />
      </ArkDatePicker.Positioner>
    </Portal>
  );
}

const navTriggerCls =
  "inline-flex size-7 cursor-pointer items-center justify-center rounded-md text-fg-soft hover:bg-hover";
const viewTriggerCls =
  "cursor-pointer rounded-md px-2 py-1 text-sm font-semibold text-fg hover:bg-hover";
const dayCellCls = cn(
  "group mx-auto flex size-9 cursor-pointer items-center justify-center text-sm",
  "focus:outline-none",
);
const dayCellInnerCls = cn(
  "flex size-8 items-center justify-center rounded-full text-fg-soft transition-colors",
  "group-hover:bg-hover",
  "group-data-selected:bg-fg group-data-selected:font-medium group-data-selected:text-bg",
  "group-data-today:ring-2 group-data-today:ring-fg/20",
  "group-data-outside-range:text-fg-subtle",
  "group-data-unavailable:cursor-not-allowed group-data-unavailable:opacity-40",
  "group-focus-visible:ring-2 group-focus-visible:ring-fg/20",
);
const gridCellCls = cn(
  "mx-auto flex h-10 w-16 cursor-pointer items-center justify-center rounded-md text-sm text-fg-soft transition-colors",
  "hover:bg-hover",
  "data-selected:bg-fg data-selected:font-medium data-selected:text-bg",
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-fg/20",
);

function ViewHeader() {
  return (
    <ArkDatePicker.ViewControl className="flex items-center justify-between">
      <ArkDatePicker.PrevTrigger className={navTriggerCls}>
        <ChevronLeft className="size-4" />
      </ArkDatePicker.PrevTrigger>
      <ArkDatePicker.ViewTrigger className={viewTriggerCls}>
        <ArkDatePicker.RangeText />
      </ArkDatePicker.ViewTrigger>
      <ArkDatePicker.NextTrigger className={navTriggerCls}>
        <ChevronRight className="size-4" />
      </ArkDatePicker.NextTrigger>
    </ArkDatePicker.ViewControl>
  );
}

function DayView() {
  return (
    <ArkDatePicker.View view="day" className="flex flex-col gap-3">
      <ViewHeader />
      <ArkDatePicker.Table className="border-collapse">
        <ArkDatePicker.TableHead>
          <ArkDatePicker.TableRow>
            <ArkDatePicker.Context>
              {(api) =>
                api.weekDays.map((day) => (
                  <ArkDatePicker.TableHeader
                    key={day.short}
                    className="py-1 text-center text-xs font-medium text-fg-muted"
                  >
                    {day.narrow}
                  </ArkDatePicker.TableHeader>
                ))
              }
            </ArkDatePicker.Context>
          </ArkDatePicker.TableRow>
        </ArkDatePicker.TableHead>
        <ArkDatePicker.TableBody>
          <ArkDatePicker.Context>
            {(api) =>
              api.weeks.map((week, i) => (
                <ArkDatePicker.TableRow key={i}>
                  {week.map((day, j) => (
                    <ArkDatePicker.TableCell
                      key={j}
                      value={day}
                      className="p-0"
                    >
                      <ArkDatePicker.TableCellTrigger className={dayCellCls}>
                        <span className={dayCellInnerCls}>{day.day}</span>
                      </ArkDatePicker.TableCellTrigger>
                    </ArkDatePicker.TableCell>
                  ))}
                </ArkDatePicker.TableRow>
              ))
            }
          </ArkDatePicker.Context>
        </ArkDatePicker.TableBody>
      </ArkDatePicker.Table>
    </ArkDatePicker.View>
  );
}

function MonthView() {
  return (
    <ArkDatePicker.View view="month" className="flex flex-col gap-3">
      <ViewHeader />
      <ArkDatePicker.Table className="border-collapse">
        <ArkDatePicker.TableBody>
          <ArkDatePicker.Context>
            {(api) =>
              api
                .getMonthsGrid({ columns: 4, format: "short" })
                .map((months, i) => (
                  <ArkDatePicker.TableRow key={i}>
                    {months.map((month, j) => (
                      <ArkDatePicker.TableCell
                        key={j}
                        value={month.value}
                        className="p-0"
                      >
                        <ArkDatePicker.TableCellTrigger
                          className={gridCellCls}
                        >
                          {month.label}
                        </ArkDatePicker.TableCellTrigger>
                      </ArkDatePicker.TableCell>
                    ))}
                  </ArkDatePicker.TableRow>
                ))
            }
          </ArkDatePicker.Context>
        </ArkDatePicker.TableBody>
      </ArkDatePicker.Table>
    </ArkDatePicker.View>
  );
}

function YearView() {
  return (
    <ArkDatePicker.View view="year" className="flex flex-col gap-3">
      <ViewHeader />
      <ArkDatePicker.Table className="border-collapse">
        <ArkDatePicker.TableBody>
          <ArkDatePicker.Context>
            {(api) =>
              api.getYearsGrid({ columns: 4 }).map((years, i) => (
                <ArkDatePicker.TableRow key={i}>
                  {years.map((year, j) => (
                    <ArkDatePicker.TableCell
                      key={j}
                      value={year.value}
                      className="p-0"
                    >
                      <ArkDatePicker.TableCellTrigger className={gridCellCls}>
                        {year.label}
                      </ArkDatePicker.TableCellTrigger>
                    </ArkDatePicker.TableCell>
                  ))}
                </ArkDatePicker.TableRow>
              ))
            }
          </ArkDatePicker.Context>
        </ArkDatePicker.TableBody>
      </ArkDatePicker.Table>
    </ArkDatePicker.View>
  );
}

function Calendar() {
  return (
    <>
      <DayView />
      <MonthView />
      <YearView />
    </>
  );
}

function ClearTrigger({
  className,
  ...props
}: ComponentProps<typeof ArkDatePicker.ClearTrigger>) {
  return (
    <ArkDatePicker.ClearTrigger
      className={cn(
        "inline-flex size-5 cursor-pointer items-center justify-center rounded text-fg-muted hover:bg-hover hover:text-fg",
        className,
      )}
      {...props}
    />
  );
}

function PresetTrigger({
  className,
  ...props
}: ComponentProps<typeof ArkDatePicker.PresetTrigger>) {
  return (
    <ArkDatePicker.PresetTrigger
      className={cn(
        "cursor-pointer rounded-md px-2 py-1 text-left text-sm text-fg-soft hover:bg-hover hover:text-fg",
        className,
      )}
      {...props}
    />
  );
}

function ValueText({
  className,
  ...props
}: ComponentProps<typeof ArkDatePicker.ValueText>) {
  return (
    <ArkDatePicker.ValueText
      className={cn("text-sm text-fg", className)}
      {...props}
    />
  );
}

const Context = ArkDatePicker.Context;
const RootProvider = ArkDatePicker.RootProvider;
const Positioner = ArkDatePicker.Positioner;
const View = ArkDatePicker.View;
const ViewControl = ArkDatePicker.ViewControl;
const ViewTrigger = ArkDatePicker.ViewTrigger;
const NextTrigger = ArkDatePicker.NextTrigger;
const PrevTrigger = ArkDatePicker.PrevTrigger;
const RangeText = ArkDatePicker.RangeText;
const Table = ArkDatePicker.Table;
const TableHead = ArkDatePicker.TableHead;
const TableHeader = ArkDatePicker.TableHeader;
const TableBody = ArkDatePicker.TableBody;
const TableRow = ArkDatePicker.TableRow;
const TableCell = ArkDatePicker.TableCell;
const TableCellTrigger = ArkDatePicker.TableCellTrigger;
const MonthSelect = ArkDatePicker.MonthSelect;
const YearSelect = ArkDatePicker.YearSelect;
const WeekNumberHeaderCell = ArkDatePicker.WeekNumberHeaderCell;
const WeekNumberCell = ArkDatePicker.WeekNumberCell;

export const DatePicker = {
  Root,
  RootProvider,
  Label,
  Control,
  Input,
  Trigger,
  ClearTrigger,
  PresetTrigger,
  ValueText,
  Positioner,
  Content,
  Calendar,
  View,
  ViewControl,
  ViewTrigger,
  PrevTrigger,
  NextTrigger,
  RangeText,
  Table,
  TableHead,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableCellTrigger,
  MonthSelect,
  YearSelect,
  WeekNumberHeaderCell,
  WeekNumberCell,
  Context,
};
