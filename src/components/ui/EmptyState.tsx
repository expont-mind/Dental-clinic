import * as React from "react";
import { cn } from "@/lib/utils/cn";

type EmptyStateProps = {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        "rounded-2xl border border-dashed border-line bg-surface/50 px-6 py-12",
        className,
      )}
    >
      {icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary-ink">
          {icon}
        </div>
      )}
      <h3 className="font-display text-xl font-medium text-ink">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm leading-6 text-muted">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
