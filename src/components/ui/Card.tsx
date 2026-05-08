import * as React from "react";
import { cn } from "@/lib/utils/cn";

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "outline" | "muted";
};

export function Card({
  className,
  variant = "default",
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl",
        variant === "default" &&
          "bg-surface border border-line shadow-[0_1px_2px_rgb(12_26_35/0.04),0_8px_24px_-8px_rgb(12_26_35/0.08)]",
        variant === "outline" && "border border-line bg-surface",
        variant === "muted" && "bg-surface-2 border border-line/60",
        className,
      )}
      {...props}
    />
  );
}

export function CardBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6", className)} {...props} />;
}

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "px-6 py-5 border-b border-line flex items-center justify-between",
        className,
      )}
      {...props}
    />
  );
}
