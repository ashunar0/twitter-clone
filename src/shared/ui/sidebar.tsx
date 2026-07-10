"use client";

import { PanelLeft } from "lucide-react";
import {
  createContext,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
  useContext,
  useState,
  useSyncExternalStore,
} from "react";
import { IconButton } from "@/shared/ui/icon-button";
import { Slot } from "@/lib/slot";
import { cn } from "@/lib/utils";

const SIDEBAR_MEDIA_QUERY = "(min-width: 1024px)";

// 「explicit に user が toggle した state」 と 「viewport で決まる default」 を分離。
// SSR では explicit=null → CSS の lg: responsive variant で default 表示が決まり、
// JS / viewport を読む必要が無いので hydration mismatch / flash どちらも起きない。
// user が toggle した瞬間 explicit が boolean になり CSS responsive を上書きする。
type SidebarContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
  /** explicit override が無い (auto) かどうか。 Root の class 分岐用 */
  isAuto: boolean;
};

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) {
    throw new Error("useSidebar must be used within Sidebar.Provider");
  }
  return ctx;
}

type ProviderProps = {
  children: ReactNode;
};

function subscribeMedia(callback: () => void) {
  const mq = window.matchMedia(SIDEBAR_MEDIA_QUERY);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getMediaSnapshot() {
  return window.matchMedia(SIDEBAR_MEDIA_QUERY).matches;
}

function Provider({ children }: ProviderProps) {
  const [explicit, setExplicit] = useState<boolean | null>(null);
  // viewport は useSyncExternalStore で外部購読。 server snapshot は true (desktop)。
  // visual は CSS responsive で決まるので server/client 差は無害。
  const isDesktop = useSyncExternalStore(
    subscribeMedia,
    getMediaSnapshot,
    () => true,
  );
  const open = explicit ?? isDesktop;
  const setOpen = (next: boolean) => setExplicit(next);
  const toggle = () => setExplicit(!open);
  return (
    <SidebarContext.Provider
      value={{ open, setOpen, toggle, isAuto: explicit === null }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

function Root({ className, style, ...props }: HTMLAttributes<HTMLElement>) {
  const { open, isAuto } = useSidebar();
  return (
    <aside
      style={{ "--sidebar-w": "16rem", ...style } as CSSProperties}
      className={cn(
        "flex w-(--sidebar-w) flex-col border-r border-border bg-surface-muted",
        "transition-[margin-left] duration-200 ease-out",
        isAuto
          ? // auto: mobile 閉じ / desktop 開きを CSS で制御
            "-ml-(--sidebar-w) lg:ml-0"
          : !open && "-ml-(--sidebar-w)",
        className,
      )}
      {...props}
    />
  );
}

function Trigger(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { open, toggle } = useSidebar();
  return (
    <IconButton
      {...props}
      onClick={toggle}
      aria-label={open ? "サイドバーを閉じる" : "サイドバーを開く"}
    >
      <PanelLeft className="size-4" />
    </IconButton>
  );
}

function Header({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <header className={cn("p-3", className)} {...props} />;
}

function Content({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <nav
      className={cn("flex min-h-0 flex-1 flex-col gap-4 p-4", className)}
      {...props}
    />
  );
}

function Footer({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <footer className={cn("p-3", className)} {...props} />;
}

type GroupProps = HTMLAttributes<HTMLDivElement> & {
  label?: ReactNode;
};

function Group({ label, className, children, ...props }: GroupProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)} {...props}>
      {label && (
        <h2 className="px-3 pb-1 text-xs font-medium text-fg-muted">{label}</h2>
      )}
      {children}
    </div>
  );
}

type MenuButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  active?: boolean;
  asChild?: boolean;
};

function MenuButton({
  active = false,
  asChild = false,
  className,
  ...props
}: MenuButtonProps) {
  const Comp = asChild ? Slot : "a";
  return (
    <Comp
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm",
        active
          ? "bg-surface-sunken font-semibold text-fg [&_svg]:stroke-[2.5]"
          : "text-fg-soft hover:bg-hover",
        className,
      )}
      {...props}
    />
  );
}

function MenuItem({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("group/menu-item relative", className)} {...props} />
  );
}

type MenuActionProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
};

function MenuAction({
  asChild = false,
  className,
  type = "button",
  ...props
}: MenuActionProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      type={asChild ? undefined : type}
      className={cn(
        "-translate-y-1/2 absolute top-1/2 right-1 inline-flex size-7 cursor-pointer items-center justify-center rounded-md text-fg-soft opacity-0 transition-opacity",
        "hover:bg-hover",
        "group-hover/menu-item:opacity-100 group-focus-within/menu-item:opacity-100",
        "data-[state=open]:opacity-100",
        className,
      )}
      {...props}
    />
  );
}

export const Sidebar = {
  Provider,
  Root,
  Trigger,
  Header,
  Content,
  Footer,
  Group,
  MenuItem,
  MenuButton,
  MenuAction,
};
