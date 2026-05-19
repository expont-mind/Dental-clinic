import {
  getClinicSlug,
  getSharedSecret,
  getWebhookBaseUrl,
} from "./constants";
import { signBody } from "./sign";

export type SyncKind = "service" | "staff" | "clinic" | "branch";

export type SyncPayload = {
  kind: SyncKind;
  action: "upsert";
  id?: string;
  occurredAt: string;
};

export async function emitSync(input: {
  kind: SyncKind;
  id?: string;
}): Promise<void> {
  const secret = getSharedSecret();
  if (!secret) {
    console.warn("[dentexgo] secret not set, skipping sync emit", input);
    return;
  }
  const slug = getClinicSlug();
  const url = `${getWebhookBaseUrl()}/api/clinics/${slug}/sync`;

  const payload: SyncPayload = {
    kind: input.kind,
    action: "upsert",
    occurredAt: new Date().toISOString(),
  };
  if (input.kind !== "clinic" && input.id) payload.id = input.id;

  const body = JSON.stringify(payload);
  const signature = signBody(body, secret);

  let lastError: unknown;
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Dentexgo-Signature": signature,
        },
        body,
      });
      if (res.ok || res.status === 202) return;
      if (res.status >= 400 && res.status < 500) {
        const text = await res.text().catch(() => "");
        console.error(`[dentexgo] sync rejected ${res.status}`, text, input);
        return;
      }
      lastError = `HTTP ${res.status}`;
    } catch (err) {
      lastError = err;
    }
    await new Promise((r) => setTimeout(r, 2 ** attempt * 500));
  }
  console.error("[dentexgo] sync failed after retries", lastError, input);
}
