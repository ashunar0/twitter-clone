"use client";

import { RatingGroup as ArkRatingGroup } from "@ark-ui/react/rating-group";
import { Star } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

function Root({
  className,
  ...props
}: ComponentProps<typeof ArkRatingGroup.Root>) {
  return (
    <ArkRatingGroup.Root
      className={cn("flex flex-col gap-1.5", className)}
      {...props}
    />
  );
}

function Label({
  className,
  ...props
}: ComponentProps<typeof ArkRatingGroup.Label>) {
  return (
    <ArkRatingGroup.Label
      className={cn("text-sm font-medium text-fg-soft", className)}
      {...props}
    />
  );
}

function Control({
  className,
  ...props
}: ComponentProps<typeof ArkRatingGroup.Control>) {
  return (
    <ArkRatingGroup.Control
      className={cn(
        "flex w-fit items-center gap-1",
        "data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

function Item({
  className,
  ...props
}: ComponentProps<typeof ArkRatingGroup.Item>) {
  return (
    <ArkRatingGroup.Item
      className={cn(
        "group relative inline-flex cursor-pointer text-fg-subtle outline-none",
        "focus-visible:ring-2 focus-visible:ring-fg/30 focus-visible:ring-offset-2",
        "data-disabled:cursor-not-allowed",
        "data-readonly:cursor-default",
        className,
      )}
      {...props}
    >
      <Star className="size-6" strokeWidth={1.5} />
      <Star
        className={cn(
          "absolute inset-0 size-6 fill-fg text-fg opacity-0 transition-opacity duration-300 ease-out",
          "group-data-highlighted:opacity-100",
          "group-data-half:[clip-path:inset(0_50%_0_0)]",
        )}
        strokeWidth={1.5}
      />
    </ArkRatingGroup.Item>
  );
}

const Context = ArkRatingGroup.Context;
const ItemContext = ArkRatingGroup.ItemContext;
const RootProvider = ArkRatingGroup.RootProvider;
const HiddenInput = ArkRatingGroup.HiddenInput;

export const RatingGroup = {
  Root,
  RootProvider,
  Label,
  Control,
  Item,
  Context,
  ItemContext,
  HiddenInput,
};
