"use client";

import { FileUpload as ArkFileUpload } from "@ark-ui/react/file-upload";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const Root = ArkFileUpload.Root;
const RootProvider = ArkFileUpload.RootProvider;
const HiddenInput = ArkFileUpload.HiddenInput;
const Label = ArkFileUpload.Label;
const Context = ArkFileUpload.Context;
const ClearTrigger = ArkFileUpload.ClearTrigger;
const ItemGroup = ArkFileUpload.ItemGroup;
const Item = ArkFileUpload.Item;
const ItemName = ArkFileUpload.ItemName;
const ItemPreview = ArkFileUpload.ItemPreview;
const ItemPreviewImage = ArkFileUpload.ItemPreviewImage;
const ItemSizeText = ArkFileUpload.ItemSizeText;
const ItemDeleteTrigger = ArkFileUpload.ItemDeleteTrigger;

function Trigger({
  className,
  ...props
}: ComponentProps<typeof ArkFileUpload.Trigger>) {
  return <ArkFileUpload.Trigger className={cn(className)} {...props} />;
}

function Dropzone({
  className,
  ...props
}: ComponentProps<typeof ArkFileUpload.Dropzone>) {
  return (
    <ArkFileUpload.Dropzone
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-border bg-surface p-6 text-sm text-fg-muted transition-colors",
        "hover:bg-hover",
        "data-dragging:border-fg data-dragging:bg-hover",
        className,
      )}
      {...props}
    />
  );
}

export const FileUpload = {
  Root,
  RootProvider,
  HiddenInput,
  Trigger,
  Dropzone,
  Label,
  Context,
  ClearTrigger,
  ItemGroup,
  Item,
  ItemName,
  ItemPreview,
  ItemPreviewImage,
  ItemSizeText,
  ItemDeleteTrigger,
};
