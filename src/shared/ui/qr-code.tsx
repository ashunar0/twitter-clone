"use client";

import { QrCode as ArkQrCode } from "@ark-ui/react/qr-code";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

function Root({
  className,
  ...props
}: ComponentProps<typeof ArkQrCode.Root>) {
  return (
    <ArkQrCode.Root
      className={cn(
        "inline-flex w-fit flex-col items-center gap-3 rounded-lg border border-border bg-surface p-4",
        className,
      )}
      {...props}
    />
  );
}

function Center({
  className,
  ...props
}: ComponentProps<"div">) {
  return <div className={cn("relative", className)} {...props} />;
}

function Frame({
  className,
  ...props
}: ComponentProps<typeof ArkQrCode.Frame>) {
  return (
    <ArkQrCode.Frame
      className={cn("size-48 text-fg", className)}
      {...props}
    />
  );
}

function Pattern({
  className,
  ...props
}: ComponentProps<typeof ArkQrCode.Pattern>) {
  return (
    <ArkQrCode.Pattern
      className={cn("fill-current", className)}
      {...props}
    />
  );
}

function Overlay({
  className,
  ...props
}: ComponentProps<typeof ArkQrCode.Overlay>) {
  return (
    <ArkQrCode.Overlay
      className={cn(
        "flex items-center justify-center rounded-md border border-border bg-surface p-1",
        className,
      )}
      {...props}
    />
  );
}

function DownloadTrigger(
  props: ComponentProps<typeof ArkQrCode.DownloadTrigger>,
) {
  return <ArkQrCode.DownloadTrigger {...props} />;
}

const Context = ArkQrCode.Context;
const RootProvider = ArkQrCode.RootProvider;

export const QrCode = {
  Root,
  RootProvider,
  Center,
  Frame,
  Pattern,
  Overlay,
  DownloadTrigger,
  Context,
};
