import { cn } from "@/lib/utils/cn";

type Props = {
  current: 1 | 2 | 3 | 4;
  labels: [string, string, string, string];
  stepWord: string;
  ofWord: string;
};

export function StepIndicator({ current, labels, stepWord, ofWord }: Props) {
  return (
    <div className="border-b border-line bg-surface/60 backdrop-blur">
      <div className="mx-auto flex max-w-4xl flex-col gap-3 px-5 py-5 sm:px-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs uppercase tracking-[0.22em] text-muted">
          {stepWord} {current} {ofWord} 4
        </p>
        <ol className="flex items-center gap-2">
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
                    "grid h-6 w-6 place-items-center rounded-full text-[11px] font-medium transition-colors",
                    isActive && "bg-primary text-white",
                    isDone && "bg-ink text-white",
                    !isActive && !isDone && "bg-surface-2 text-muted-2",
                  )}
                >
                  {isDone ? "✓" : idx}
                </span>
                <span
                  className={cn(
                    "hidden text-sm sm:inline",
                    isActive ? "text-ink font-medium" : "text-muted",
                  )}
                >
                  {label}
                </span>
                {idx < 4 && (
                  <span className="ml-1 hidden h-px w-6 bg-line sm:block" />
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
