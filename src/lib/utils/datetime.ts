const TZ = "Asia/Ulaanbaatar";

const formatters = {
  mn: {
    date: new Intl.DateTimeFormat("mn-MN", {
      timeZone: TZ,
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    weekday: new Intl.DateTimeFormat("mn-MN", {
      timeZone: TZ,
      weekday: "short",
    }),
    time: new Intl.DateTimeFormat("mn-MN", {
      timeZone: TZ,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
    full: new Intl.DateTimeFormat("mn-MN", {
      timeZone: TZ,
      dateStyle: "full",
      timeStyle: "short",
    }),
  },
  en: {
    date: new Intl.DateTimeFormat("en-US", {
      timeZone: TZ,
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    weekday: new Intl.DateTimeFormat("en-US", {
      timeZone: TZ,
      weekday: "short",
    }),
    time: new Intl.DateTimeFormat("en-US", {
      timeZone: TZ,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
    full: new Intl.DateTimeFormat("en-US", {
      timeZone: TZ,
      dateStyle: "full",
      timeStyle: "short",
    }),
  },
} as const;

export type Locale = "mn" | "en";

export function formatDate(input: string | Date, locale: Locale = "mn") {
  const d = typeof input === "string" ? new Date(input) : input;
  return formatters[locale].date.format(d);
}

export function formatTime(input: string | Date, locale: Locale = "mn") {
  const d = typeof input === "string" ? new Date(input) : input;
  return formatters[locale].time.format(d);
}

export function formatWeekday(input: string | Date, locale: Locale = "mn") {
  const d = typeof input === "string" ? new Date(input) : input;
  return formatters[locale].weekday.format(d);
}

export function formatFull(input: string | Date, locale: Locale = "mn") {
  const d = typeof input === "string" ? new Date(input) : input;
  return formatters[locale].full.format(d);
}

/**
 * Compare two ISO timestamps by their UB-local calendar day.
 * Server runs in UTC; without an explicit TZ this gives wrong groupings.
 */
export function isSameDayUB(a: string | Date, b: string | Date) {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const da = typeof a === "string" ? new Date(a) : a;
  const db = typeof b === "string" ? new Date(b) : b;
  return fmt.format(da) === fmt.format(db);
}

export function ubDateKey(input: string | Date) {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const d = typeof input === "string" ? new Date(input) : input;
  return fmt.format(d);
}
