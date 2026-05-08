import "server-only";

const dictionaries = {
  mn: () => import("./dictionaries/mn.json").then((m) => m.default),
  en: () => import("./dictionaries/en.json").then((m) => m.default),
} as const;

export type Locale = keyof typeof dictionaries;
export const LOCALES: readonly Locale[] = ["mn", "en"] as const;
export const DEFAULT_LOCALE: Locale = "mn";

export const hasLocale = (value: string): value is Locale =>
  value in dictionaries;

export const getDictionary = async (locale: Locale) => dictionaries[locale]();

export type Dictionary = Awaited<ReturnType<typeof getDictionary>>;
