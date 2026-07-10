"use client";

import { PasswordInput as ArkPasswordInput } from "@ark-ui/react/password-input";
import { Eye, EyeOff } from "lucide-react";
import { createContext, useContext, type ComponentProps } from "react";
import { cn } from "@/lib/utils";

type InputVariant = "outline" | "subtle" | "flushed";
type InputSize = "xs" | "sm" | "md" | "lg";

const PasswordInputContext = createContext<{
  variant: InputVariant;
  size: InputSize;
}>({ variant: "outline", size: "md" });

type RootProps = ComponentProps<typeof ArkPasswordInput.Root> & {
  variant?: InputVariant;
  size?: InputSize;
};

function Root({
  variant = "outline",
  size = "md",
  className,
  ...props
}: RootProps) {
  return (
    <PasswordInputContext.Provider value={{ variant, size }}>
      <ArkPasswordInput.Root
        className={cn("flex w-full flex-col gap-2", className)}
        {...props}
      />
    </PasswordInputContext.Provider>
  );
}

function Label({
  className,
  ...props
}: ComponentProps<typeof ArkPasswordInput.Label>) {
  return (
    <ArkPasswordInput.Label
      className={cn("block text-sm font-medium text-fg-soft", className)}
      {...props}
    />
  );
}

function Control({
  className,
  ...props
}: ComponentProps<typeof ArkPasswordInput.Control>) {
  return (
    <ArkPasswordInput.Control
      className={cn("relative w-full", className)}
      {...props}
    />
  );
}

const sizeClasses: Record<InputSize, string> = {
  xs: "h-7 text-xs",
  sm: "h-8 text-sm",
  md: "h-10 text-sm",
  lg: "h-12 text-base",
};

const paddingClasses: Record<InputVariant, Record<InputSize, string>> = {
  outline: { xs: "pr-7 pl-2", sm: "pr-8 pl-2.5", md: "pr-10 pl-3", lg: "pr-12 pl-4" },
  subtle: { xs: "pr-7 pl-2", sm: "pr-8 pl-2.5", md: "pr-10 pl-3", lg: "pr-12 pl-4" },
  flushed: { xs: "pr-7 pl-3", sm: "pr-8 pl-3", md: "pr-10 pl-3", lg: "pr-12 pl-3" },
};

const variantClasses: Record<InputVariant, string> = {
  outline:
    "rounded-sm border border-border bg-surface focus:ring-2 focus:ring-fg-subtle aria-invalid:border-danger-border aria-invalid:focus:ring-danger-border",
  subtle:
    "rounded-sm border border-transparent bg-hover focus:bg-surface focus:ring-2 focus:ring-fg-subtle aria-invalid:bg-danger-subtle aria-invalid:text-danger-fg",
  flushed:
    "rounded-none border-b border-border bg-transparent focus:border-fg-soft aria-invalid:border-danger-border",
};

function Input({
  className,
  ...props
}: ComponentProps<typeof ArkPasswordInput.Input>) {
  const { variant, size } = useContext(PasswordInputContext);
  return (
    <ArkPasswordInput.Input
      className={cn(
        "flex w-full py-2 text-fg placeholder:text-fg-subtle focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        sizeClasses[size],
        paddingClasses[variant][size],
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}

function VisibilityTrigger({
  className,
  children,
  ...props
}: ComponentProps<typeof ArkPasswordInput.VisibilityTrigger>) {
  return (
    <ArkPasswordInput.VisibilityTrigger
      className={cn(
        "absolute inset-y-0 right-0 flex cursor-pointer items-center px-3 text-fg-subtle hover:text-fg-soft",
        className,
      )}
      {...props}
    >
      {children ?? (
        <ArkPasswordInput.Indicator fallback={<Eye className="size-4" />}>
          <EyeOff className="size-4" />
        </ArkPasswordInput.Indicator>
      )}
    </ArkPasswordInput.VisibilityTrigger>
  );
}

const Indicator = ArkPasswordInput.Indicator;
const Context = ArkPasswordInput.Context;
const RootProvider = ArkPasswordInput.RootProvider;

export const PasswordInput = {
  Root,
  RootProvider,
  Label,
  Control,
  Input,
  VisibilityTrigger,
  Indicator,
  Context,
};
