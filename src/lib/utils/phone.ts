/** Mongolian mobile number: +976 followed by 8 digits. */
const MN_PHONE = /^(\+?976)?[\s-]?(\d{4})[\s-]?(\d{4})$/;

export function isValidMongolianPhone(value: string): boolean {
  return MN_PHONE.test(value.trim());
}

export function normalizeMongolianPhone(value: string): string | null {
  const m = value.trim().match(MN_PHONE);
  if (!m) return null;
  return `+976${m[2]}${m[3]}`;
}

export function formatMongolianPhone(value: string): string {
  const normalized = normalizeMongolianPhone(value);
  if (!normalized) return value;
  return `+976 ${normalized.slice(4, 8)} ${normalized.slice(8)}`;
}
