export const SCHEMA_VERSION = "1";

export function getClinicSlug(): string {
  return process.env.CLINIC_SLUG ?? "dentaris";
}

export function getSharedSecret(): string | null {
  const v = process.env.DENTEXGO_SHARED_SECRET;
  return v && v.length > 0 ? v : null;
}

export function getWebhookBaseUrl(): string {
  return process.env.DENTEXGO_WEBHOOK_BASE_URL ?? "https://dentexgo.com";
}

/**
 * Outbound base URL for the clinic-facing public API
 * (us → Dentexgo: FAQ management, bot config).
 * Intentionally separate from getWebhookBaseUrl — the docs use a
 * different host (dentexgo.mn) for the public REST API.
 */
export function getApiBaseUrl(): string {
  return process.env.DENTEXGO_API_BASE_URL ?? "https://dentexgo.mn";
}

export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001";
}
