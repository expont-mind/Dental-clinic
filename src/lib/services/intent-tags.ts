/**
 * Patient-language quick filters for /services.
 *
 * Each intent maps to a list of *parent* service slugs whose tree
 * (parent + all its children) is considered a match for that intent.
 *
 * The list is intentionally short and curated. Add new intents by appending
 * to INTENT_ORDER; remove an intent by deleting its entry — no schema
 * change required, only a code edit + redeploy.
 *
 * Order in INTENT_ORDER controls render order of the chip row.
 */

export type IntentKey =
  | "whiten"
  | "missing"
  | "pain"
  | "straighten"
  | "cleaning"
  | "kids";

export type IntentTag = {
  key: IntentKey;
  mn: string;
  en: string;
  parentSlugs: string[];
};

export const INTENT_ORDER: IntentKey[] = [
  "missing",
  "pain",
  "whiten",
  "straighten",
  "cleaning",
  "kids",
];

const INTENTS: Record<IntentKey, IntentTag> = {
  whiten: {
    key: "whiten",
    mn: "Шүд цайруулах",
    en: "Whitening",
    parentSlugs: ["cosmetic"],
  },
  missing: {
    key: "missing",
    mn: "Алдсан шүд",
    en: "Missing tooth",
    parentSlugs: ["implant", "fixed-prosthetics", "removable-prosthetics"],
  },
  pain: {
    key: "pain",
    mn: "Өвдөж байна",
    en: "Tooth pain",
    parentSlugs: ["adult-treatment", "oral-surgery", "restorative"],
  },
  straighten: {
    key: "straighten",
    mn: "Гажиг засах",
    en: "Straighten teeth",
    parentSlugs: ["orthodontics"],
  },
  cleaning: {
    key: "cleaning",
    mn: "Цэвэрлэгээ",
    en: "Cleaning",
    parentSlugs: ["preventive"],
  },
  kids: {
    key: "kids",
    mn: "Хүүхдийн",
    en: "Kids",
    parentSlugs: ["pediatric"],
  },
};

export const INTENT_TAGS: IntentTag[] = INTENT_ORDER.map((k) => INTENTS[k]);

export function getIntentBySlug(parentSlug: string): IntentKey[] {
  return INTENT_TAGS.filter((t) => t.parentSlugs.includes(parentSlug)).map(
    (t) => t.key,
  );
}
