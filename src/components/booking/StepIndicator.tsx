import { cn } from "@/lib/utils/cn";

type Props = {
  current: 1 | 2 | 3 | 4;
  labels: [string, string, string, string];
  stepWord: string;
  ofWord: string;
  variant?: "default" | "onSoft";
};

export function StepIndicator({
  current,
  labels,
  stepWord,
  ofWord,
  variant = "default",
}: Props) {
  const wrapper =
    variant === "onSoft"
      ? "border-y border-primary/15 bg-primary-soft/60"
      : "border-b border-line bg-surface";

  return (
    <div className={wrapper}>
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-5 pt-16 pb-5 sm:flex-row sm:justify-center sm:gap-5 sm:px-8 sm:pt-20 sm:pb-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary">
          {stepWord} {current} / 4
        </p>
        <span aria-hidden className="hidden h-3 w-px bg-primary/30 sm:block" />
        <ol className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
          {labels.map((label, i) => {
            const idx = (i + 1) as 1 | 2 | 3 | 4;
            const isActive = idx === current;
            const isDone = idx < current;
            return (
              <li
                key={label}
                aria-current={isActive ? "step" : undefined}
                className="flex items-center gap-2"
              >
                <span
                  className={cn(
                    "grid h-6 w-6 place-items-center rounded-full text-[10px] font-bold transition-colors",
                    isActive && "bg-primary text-white shadow-sm",
                    isDone && "bg-primary text-white",
                    !isActive && !isDone && "bg-surface text-muted ring-1 ring-line",
                  )}
                >
                  {isDone ? "✓" : idx}
                </span>
                <span
                  className={cn(
                    "hidden text-[12px] font-semibold sm:inline",
                    isActive
                      ? "text-ink"
                      : isDone
                        ? "text-ink-2"
                        : "text-muted",
                  )}
                >
                  {label}
                </span>
                {idx < 4 && (
                  <span
                    className={cn(
                      "ml-1 hidden h-px w-5 sm:block",
                      isDone ? "bg-primary" : "bg-line",
                    )}
                  />
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
