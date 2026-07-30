import "server-only";
import { DentexgoError } from "./client";

/**
 * Classify a thrown Dentexgo error for display in the admin UI.
 *
 * Returns Mongolian prose plus the machine `code`. The API's own `message` is
 * English and must never reach the admin panel — keep it for `console.error`
 * only. Callers branch on `code`, never on the message text.
 */
export function describeDentexgoError(e: unknown): {
  message: string;
  code: string;
} {
  if (e instanceof DentexgoError) {
    if (e.code === "CLINIC_NOT_CONFIGURED") {
      return { message: "Dentexgo тохиргоо ороогүй байна.", code: e.code };
    }
    if (e.code === "NO_AI_MODULE") {
      return { message: "AI модуль активгүй байна.", code: e.code };
    }
    return {
      message: `Dentexgo-ийн алдаа (${e.code}). Дахин оролдоно уу.`,
      code: e.code,
    };
  }
  return {
    message: "Dentexgo-той холбогдож чадсангүй.",
    code: "NETWORK_ERROR",
  };
}
