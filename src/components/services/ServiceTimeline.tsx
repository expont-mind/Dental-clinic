import type { LucideIcon } from "lucide-react";
import {
  Stethoscope,
  Sparkles,
  CalendarCheck,
  ShieldCheck,
  Smile,
  ClipboardList,
  HeartPulse,
  HandHeart,
} from "lucide-react";

type Step = { title: string; body: string; icon?: string };

const ICON_BY_KEY: Record<string, LucideIcon> = {
  stethoscope: Stethoscope,
  sparkles: Sparkles,
  calendar: CalendarCheck,
  shield: ShieldCheck,
  smile: Smile,
  clipboard: ClipboardList,
  heart: HeartPulse,
  hand: HandHeart,
};

const DEFAULTS: LucideIcon[] = [
  ClipboardList,
  Stethoscope,
  Sparkles,
  CalendarCheck,
  ShieldCheck,
  Smile,
];

function iconFor(step: Step, index: number): LucideIcon {
  if (step.icon && ICON_BY_KEY[step.icon.toLowerCase()]) {
    return ICON_BY_KEY[step.icon.toLowerCase()];
  }
  return DEFAULTS[index % DEFAULTS.length];
}

export function ServiceTimeline({
  steps,
  title,
  eyebrow,
  lede,
}: {
  steps: Step[];
  title: string;
  eyebrow: string;
  lede?: string;
}) {
  if (steps.length === 0) return null;

  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-[24px] font-extrabold uppercase leading-tight tracking-tight text-ink sm:text-[30px]">
        {title}
      </h2>
      {lede && (
        <p className="mt-2 max-w-xl text-[14px] leading-7 text-muted">{lede}</p>
      )}

      {/* Desktop: horizontal */}
      <ol className="mt-10 hidden gap-6 lg:grid lg:grid-cols-4">
        {steps.map((step, i) => {
          const Icon = iconFor(step, i);
          return (
            <li key={`${step.title}-${i}`} className="relative">
              {i < steps.length - 1 && (
                <span
                  aria-hidden
                  className="absolute left-12 top-6 hidden h-px w-[calc(100%-3rem)] bg-line lg:block"
                />
              )}
              <div className="relative flex flex-col">
                <div className="relative z-10 grid h-12 w-12 place-items-center rounded-full bg-primary text-white shadow-[0_8px_20px_-8px_rgba(26,132,120,0.5)]">
                  <Icon className="h-5 w-5" strokeWidth={2.25} />
                </div>
                <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.18em] text-muted-2">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-1 font-display text-[17px] font-bold leading-tight tracking-tight text-ink">
                  {step.title}
                </h3>
                <p className="mt-2 text-[13px] leading-6 text-muted">
                  {step.body}
                </p>
              </div>
            </li>
          );
        })}
      </ol>

      {/* Mobile / tablet: vertical with rail */}
      <ol className="relative mt-8 space-y-6 lg:hidden">
        <span
          aria-hidden
          className="absolute left-6 top-2 bottom-2 w-px bg-line"
        />
        {steps.map((step, i) => {
          const Icon = iconFor(step, i);
          return (
            <li key={`${step.title}-${i}`} className="relative flex gap-4 pl-0">
              <div className="relative z-10 grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary text-white shadow-[0_8px_20px_-8px_rgba(26,132,120,0.5)]">
                <Icon className="h-5 w-5" strokeWidth={2.25} />
              </div>
              <div className="min-w-0 pt-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-2">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-0.5 font-display text-[16px] font-bold leading-tight tracking-tight text-ink">
                  {step.title}
                </h3>
                <p className="mt-1.5 text-[13px] leading-6 text-muted">
                  {step.body}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
