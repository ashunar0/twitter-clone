import type { ElementType, HTMLAttributes, OlHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ListVariant = "marker" | "plain";

type ListRootProps = OlHTMLAttributes<HTMLOListElement> & {
  variant?: ListVariant;
  as?: "ul" | "ol";
};

function Root({
  variant = "marker",
  as = "ul",
  className,
  ...props
}: ListRootProps) {
  const Tag = as as ElementType;
  const marker =
    variant === "plain"
      ? "list-none space-y-1"
      : as === "ol"
        ? "list-decimal pl-5 space-y-1 marker:text-fg-muted"
        : "list-disc pl-5 space-y-1 marker:text-fg-muted";
  return (
    <Tag
      className={cn("text-sm text-fg", marker, className)}
      {...props}
    />
  );
}

function Item({ className, ...props }: HTMLAttributes<HTMLLIElement>) {
  return (
    <li
      className={cn(
        "leading-relaxed",
        "has-[>[data-list-indicator]]:flex has-[>[data-list-indicator]]:items-start has-[>[data-list-indicator]]:gap-2",
        className,
      )}
      {...props}
    />
  );
}

function Indicator({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      data-list-indicator=""
      className={cn(
        "mt-0.5 inline-flex shrink-0 items-center justify-center text-fg-muted [&>svg]:size-4",
        className,
      )}
      {...props}
    />
  );
}

export const List = { Root, Item, Indicator };
