import "server-only";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  mkdir,
  readFile,
  writeFile,
} from "node:fs/promises";

/**
 * Filesystem-backed fallback store for feedback submissions.
 * Used when Supabase isn't configured or the `feedback` table is missing —
 * lets the admin panel still surface submissions end-to-end in dev/demo mode.
 *
 * NOTE: Vercel's runtime filesystem is read-only. In production with Supabase
 * unavailable, submissions still surface in `state.success` but won't persist.
 */

const DIR = join(tmpdir(), "dentaris");
const FILE = join(DIR, "feedback.json");

export type LocalFeedback = {
  id: string;
  name: string | null;
  phone: string | null;
  message: string;
  status: "new" | "read" | "resolved";
  created_at: string;
};

async function readAll(): Promise<LocalFeedback[]> {
  try {
    const raw = await readFile(FILE, "utf8");
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data as LocalFeedback[];
  } catch {
    return [];
  }
}

async function writeAll(rows: LocalFeedback[]): Promise<void> {
  try {
    await mkdir(DIR, { recursive: true });
    await writeFile(FILE, JSON.stringify(rows, null, 2), "utf8");
  } catch (err) {
    console.warn("[feedback-store] write failed (filesystem read-only?):", err);
  }
}

export async function addLocalFeedback(
  input: Pick<LocalFeedback, "name" | "phone" | "message">,
): Promise<LocalFeedback> {
  const rows = await readAll();
  const next: LocalFeedback = {
    id: `local-${Date.now().toString(36)}-${Math.random()
      .toString(36)
      .slice(2, 7)}`,
    name: input.name ?? null,
    phone: input.phone ?? null,
    message: input.message,
    status: "new",
    created_at: new Date().toISOString(),
  };
  rows.unshift(next);
  await writeAll(rows.slice(0, 500));
  return next;
}

export async function listLocalFeedback(limit = 200): Promise<LocalFeedback[]> {
  const rows = await readAll();
  return rows.slice(0, limit);
}

export async function updateLocalFeedbackStatus(
  id: string,
  status: LocalFeedback["status"],
): Promise<boolean> {
  const rows = await readAll();
  const idx = rows.findIndex((r) => r.id === id);
  if (idx === -1) return false;
  rows[idx] = { ...rows[idx], status };
  await writeAll(rows);
  return true;
}
