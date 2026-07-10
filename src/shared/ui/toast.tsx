"use client";

import {
  Toast as ArkToast,
  Toaster as ArkToaster,
  createToaster,
} from "@ark-ui/react/toast";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  Loader2,
  X,
} from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export const toaster = createToaster({
  placement: "bottom-end",
  max: 3,
});

function Root({
  className,
  ...props
}: ComponentProps<typeof ArkToast.Root>) {
  return (
    <ArkToast.Root
      className={cn(
        "flex w-80 gap-3 rounded-md border border-border bg-surface p-4",
        "shadow-[0_1px_0_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.08),0_0_4px_rgba(0,0,0,0.03)]",
        "[translate:var(--x)_var(--y)] opacity-[var(--opacity)]",
        "transition-[opacity,translate,scale] duration-200 ease-out",
        className,
      )}
      {...props}
    />
  );
}

function Title({
  className,
  ...props
}: ComponentProps<typeof ArkToast.Title>) {
  return (
    <ArkToast.Title
      className={cn("text-sm font-medium text-fg", className)}
      {...props}
    />
  );
}

function Description({
  className,
  ...props
}: ComponentProps<typeof ArkToast.Description>) {
  return (
    <ArkToast.Description
      className={cn("text-xs text-fg-muted", className)}
      {...props}
    />
  );
}

function ActionTrigger({
  className,
  ...props
}: ComponentProps<typeof ArkToast.ActionTrigger>) {
  return (
    <ArkToast.ActionTrigger
      className={cn(
        "shrink-0 cursor-pointer self-center rounded-sm px-2 py-1 text-xs font-medium text-fg outline-none transition-colors",
        "hover:bg-hover focus-visible:ring-2 focus-visible:ring-fg/30",
        className,
      )}
      {...props}
    />
  );
}

function CloseTrigger({
  className,
  ...props
}: ComponentProps<typeof ArkToast.CloseTrigger>) {
  return (
    <ArkToast.CloseTrigger
      className={cn(
        "shrink-0 cursor-pointer self-center rounded-sm text-fg-muted transition-colors hover:text-fg",
        className,
      )}
      {...props}
    >
      <X className="size-4" />
    </ArkToast.CloseTrigger>
  );
}

const Context = ArkToast.Context;

export const Toast = {
  Root,
  Title,
  Description,
  ActionTrigger,
  CloseTrigger,
  Context,
};

const iconByType = {
  success: <CheckCircle2 className="size-4 text-success-fg" />,
  error: <AlertCircle className="size-4 text-danger-fg" />,
  warning: <AlertTriangle className="size-4 text-warning-fg" />,
  info: <Info className="size-4 text-info-fg" />,
  loading: <Loader2 className="size-4 animate-spin text-fg-muted" />,
} as const;

type ToastType = keyof typeof iconByType;

export function Toaster() {
  return (
    <ArkToaster toaster={toaster}>
      {(toast) => {
        const icon =
          toast.type && toast.type in iconByType
            ? iconByType[toast.type as ToastType]
            : null;
        return (
          <Toast.Root>
            {icon ? <div className="pt-0.5">{icon}</div> : null}
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              {toast.title ? <Toast.Title>{toast.title}</Toast.Title> : null}
              {toast.description ? (
                <Toast.Description>{toast.description}</Toast.Description>
              ) : null}
            </div>
            {toast.action ? (
              <Toast.ActionTrigger>{toast.action.label}</Toast.ActionTrigger>
            ) : null}
            <Toast.CloseTrigger />
          </Toast.Root>
        );
      }}
    </ArkToaster>
  );
}
