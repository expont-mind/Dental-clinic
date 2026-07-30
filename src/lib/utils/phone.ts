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

/** The bare 8 digits, e.g. "88112233" — the form stored in pending_bookings. */
export function phoneToDigits8(value: string): string | null {
  const normalized = normalizeMongolianPhone(value);
  return normalized ? normalized.slice(4) : null;
}

/**
 * Map a phone number to the synthetic email used as its Supabase Auth identity.
 * Customers log in with phone + password; under the hood we key the account on
 * `<8 digits>@phone.dentaris.mn`. No mail is ever sent to this address — it only
 * exists so we can reuse Supabase's email+password auth without an SMS provider.
 * A real-looking domain is used because Supabase rejects `.local` as invalid.
 */
export function phoneToAuthEmail(value: string): string | null {
  const digits = phoneToDigits8(value);
  return digits ? `${digits}@phone.dentaris.mn` : null;
}
