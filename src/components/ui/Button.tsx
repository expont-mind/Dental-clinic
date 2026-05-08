import * as React from "react";
import { cn } from "@/lib/utils/cn";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-medium tracking-tight " +
  "transition-[background-color,color,border-color,transform] duration-150 " +
  "active:translate-y-[0.5px] disabled:pointer-events-none disabled:opacity-50";

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm rounded-[10px]",
  md: "h-11 px-5 text-[15px] rounded-xl",
  lg: "h-14 px-7 text-base rounded-2xl",
};

const variants: Record<Variant, string> = {
  primary:
    "bg-primary text-white hover:bg-primary-hover " +
    "shadow-[0_1px_0_rgb(255_255_255/0.15)_inset,0_8px_20px_-8px_rgb(13_110_114/0.6)]",
  secondary:
    "bg-ink text-white hover:bg-ink-2",
  outline:
    "border border-line-strong bg-surface text-ink hover:bg-surface-2 hover:border-ink/30",
  ghost:
    "text-ink hover:bg-surface-2",
  danger:
    "bg-danger text-white hover:opacity-90",
};

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  asChild?: boolean;
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  asChild = false,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(base, sizes[size], variants[variant], className);

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<{ className?: string }>;
    return React.cloneElement(child, {
      className: cn(classes, child.props.className),
    });
  }
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
