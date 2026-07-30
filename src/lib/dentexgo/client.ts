import "server-only";
import {
  getApiBaseUrl,
  getClinicSlug,
  getSharedSecret,
} from "./constants";

// ---------- Types (mirrors docs/dentexgo-admin-api-contract.md) ----------

export type BotTone = "formal" | "friendly" | "casual";

export type PhoneInRepliesPolicy = "always" | "never" | "when_uncertain";

export interface Bilingual {
  mn?: string;
  en?: string;
}

export interface OffHoursConfig {
  greeting?: Bilingual;
  closer?: Bilingual;
  emergency_phone?: string;
}

export interface BotPersona {
  tone?: BotTone;
  greeting?: Bilingual;
  ai_disclosure?: Bilingual;
  off_hours?: OffHoursConfig;
  fallback_message?: Bilingual;
  featured_services?: string[];
  phone_in_replies?: PhoneInRepliesPolicy;
  show_duration_in_cards?: boolean;
  custom_rules?: string[];
}

export interface BotConfig {
  persona: BotPersona;
  commentToDmEnabled: boolean;
}

export type BotPersonaUpdate = BotPersona;

export interface Faq {
  source_id: string;
  q_mn: string;
  a_mn: string;
  q_en: string;
  a_en: string;
}

export interface FaqInput {
  rowId?: string;
  qMn: string;
  aMn: string;
  qEn?: string;
  aEn?: string;
}

export interface FaqUpdate {
  qMn?: string;
  aMn?: string;
  qEn?: string;
  aEn?: string;
}

export interface WhoamiResult {
  clinic: { id: string; slug: string; name: string };
  apiVersion: string;
}

// ---------- Error ----------

export class DentexgoError extends Error {
  constructor(
    public status: number,
    message: string,
    public code: string = "INTERNAL_ERROR",
    public details?: unknown,
  ) {
    super(message);
    this.name = "DentexgoError";
  }
}

// ---------- Config check ----------

export function isConfigured(): boolean {
  return Boolean(
    process.env.DENTEXGO_SHARED_SECRET &&
      (process.env.CLINIC_SLUG || "dentaris"),
  );
}

// ---------- Internal fetch helper ----------

/** Shared by the sibling domain modules (conversations.ts, insights.ts). */
export async function apiFetch<T>(
  path: string,
  init?: RequestInit & { searchParams?: Record<string, string | number | undefined> },
): Promise<T> {
  const secret = getSharedSecret();
  if (!secret) {
    throw new DentexgoError(
      0,
      "DENTEXGO_SHARED_SECRET is not set.",
      "CLINIC_NOT_CONFIGURED",
    );
  }
  const slug = getClinicSlug();
  const base = getApiBaseUrl().replace(/\/$/, "");

  let url = `${base}/api/v1/clinics/${encodeURIComponent(slug)}${path}`;
  if (init?.searchParams) {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(init.searchParams)) {
      if (v !== undefined && v !== null && v !== "") qs.set(k, String(v));
    }
    const q = qs.toString();
    if (q) url += `?${q}`;
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${secret}`,
    Accept: "application/json",
    ...((init?.headers as Record<string, string>) ?? {}),
  };
  if (init?.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(url, {
    ...init,
    headers,
    // The admin API isn't cacheable at the platform layer — staff expect
    // fresh data on every page load.
    cache: "no-store",
  });

  // 204 No Content (DELETE)
  if (res.status === 204) return undefined as T;

  const text = await res.text();
  let body: unknown = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      // Non-JSON response (eg. an HTML error page from a proxy)
    }
  }

  if (!res.ok) {
    const errBody = (body ?? {}) as { error?: string; code?: string; details?: unknown };
    throw new DentexgoError(
      res.status,
      errBody.error ?? `Dentexgo API ${res.status}`,
      errBody.code ?? "INTERNAL_ERROR",
      errBody.details,
    );
  }

  return body as T;
}

// ---------- Endpoints ----------

export async function whoami(): Promise<WhoamiResult> {
  return apiFetch<WhoamiResult>("/whoami");
}

export async function listFaqs(): Promise<Faq[]> {
  const data = await apiFetch<{ items: Faq[] }>("/faqs");
  return data.items ?? [];
}

export async function createFaq(input: FaqInput): Promise<Faq> {
  const data = await apiFetch<{ item: Faq }>("/faqs", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return data.item;
}

export async function updateFaq(
  rowId: string,
  input: FaqUpdate,
): Promise<Faq> {
  const data = await apiFetch<{ item: Faq }>(
    `/faqs/${encodeURIComponent(rowId)}`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    },
  );
  return data.item;
}

export async function deleteFaq(rowId: string): Promise<void> {
  await apiFetch<void>(`/faqs/${encodeURIComponent(rowId)}`, {
    method: "DELETE",
  });
}

export async function getBot(): Promise<BotConfig> {
  return apiFetch<BotConfig>("/bot");
}

export async function patchBotPersona(
  update: BotPersonaUpdate,
): Promise<BotPersona> {
  return apiFetch<BotPersona>("/bot/persona", {
    method: "PATCH",
    body: JSON.stringify(update),
  });
}

