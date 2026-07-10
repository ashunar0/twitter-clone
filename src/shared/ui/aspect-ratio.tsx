import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type AspectRatioProps = HTMLAttributes<HTMLDivElement> & {
  ratio?: number;
};

function AspectRatio({
  ratio = 1,
  className,
  style,
  ...props
}: AspectRatioProps) {
  return (
    <div
      className={cn("relative w-full overflow-hidden", className)}
      style={{ aspectRatio: ratio, ...style }}
      {...props}
    />
  );
}

export { AspectRatio };
