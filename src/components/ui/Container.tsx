import * as React from "react";
import { cn } from "@/lib/utils/cn";

type Size = "sm" | "md" | "lg" | "xl";

const sizes: Record<Size, string> = {
  sm: "max-w-lg",
  md: "max-w-2xl",
  lg: "max-w-3xl",
  xl: "max-w-5xl",
};

type ContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  size?: Size;
};

/**
 * The one page-shell wrapper: centers content and applies the single
 * horizontal-padding rhythm (`px-5 sm:px-8`) used across the site, so screens
 * stop hand-rolling their own paddings. Vertical padding stays per-page.
 */
export function Container({ className, size = "lg", ...props }: ContainerProps) {
  return (
    <div
      className={cn("mx-auto w-full px-5 sm:px-8", sizes[size], className)}
      {...props}
    />
  );
}
