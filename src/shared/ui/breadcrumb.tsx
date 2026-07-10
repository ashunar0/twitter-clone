import { ChevronRight, MoreHorizontal } from "lucide-react";
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  HTMLAttributes,
  LiHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";

type NavProps = HTMLAttributes<HTMLElement>;
type OlProps = HTMLAttributes<HTMLOListElement>;
type LiProps = LiHTMLAttributes<HTMLLIElement>;
type AnchorProps = AnchorHTMLAttributes<HTMLAnchorElement>;
type SpanProps = HTMLAttributes<HTMLSpanElement>;
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

function Root({ className, ...props }: NavProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("text-sm", className)}
      {...props}
    />
  );
}

function List({ className, ...props }: OlProps) {
  return (
    <ol
      className={cn("flex flex-wrap items-center gap-1.5", className)}
      {...props}
    />
  );
}

function Item({ className, ...props }: LiProps) {
  return (
    <li
      className={cn("inline-flex items-center gap-1.5", className)}
      {...props}
    />
  );
}

function Link({ className, ...props }: AnchorProps) {
  return (
    <a
      className={cn("text-fg-muted transition-colors hover:text-fg", className)}
      {...props}
    />
  );
}

function CurrentLink({ className, ...props }: SpanProps) {
  return (
    <span
      aria-current="page"
      className={cn("font-medium text-fg", className)}
      {...props}
    />
  );
}

function Separator({ className, children, ...props }: SpanProps) {
  return (
    <span
      role="presentation"
      className={cn("text-fg-subtle", className)}
      {...props}
    >
      {children ?? <ChevronRight className="size-3.5" />}
    </span>
  );
}

function Ellipsis({ className, children, ...props }: ButtonProps) {
  return (
    <button
      type="button"
      aria-label="More breadcrumbs"
      className={cn(
        "inline-flex size-5 items-center justify-center rounded text-fg-muted hover:bg-hover hover:text-fg",
        className,
      )}
      {...props}
    >
      {children ?? <MoreHorizontal className="size-3.5" />}
    </button>
  );
}

export const Breadcrumb = {
  Root,
  List,
  Item,
  Link,
  CurrentLink,
  Separator,
  Ellipsis,
};
