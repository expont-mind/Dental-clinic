import * as React from "react";
import { cn } from "@/lib/utils/cn";

type Tone = "neutral" | "primary" | "success" | "warn" | "danger" | "accent";

const tones: Record<Tone, string> = {
  neutral: "bg-surface-2 text-ink-2 border-line",
  primary: "bg-primary-soft text-primary-ink border-primary/15",
  success: "bg-success/10 text-success border-success/20",
  warn: "bg-warn/10 text-warn border-warn/20",
  danger: "bg-danger/10 text-danger border-danger/20",
  accent: "bg-accent-soft text-accent border-accent/20",
};

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: Tone;
};

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5",
        "text-xs font-medium tracking-tight",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
