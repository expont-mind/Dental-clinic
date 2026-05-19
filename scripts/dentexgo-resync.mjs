#!/usr/bin/env node
// One-shot full resync: emits a `kind: "service"` sync webhook for every row
// in the services table, signed with DENTEXGO_SHARED_SECRET. Use when you've
// bulk-edited the DB outside the app (e.g., via SQL Editor) and want
// Dentexgo to re-embed before the next daily cycle.
//
// Usage:
//   node scripts/dentexgo-resync.mjs              # all services
//   node scripts/dentexgo-resync.mjs --limit 1    # just first row (smoke test)
//   node scripts/dentexgo-resync.mjs --kind staff # sync doctors instead

import { createHmac } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ENV_PATH = resolve(HERE, "..", ".env");

function loadEnv() {
  const text = readFileSync(ENV_PATH, "utf8");
  const env = {};
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/);
    if (m) env[m[1]] = m[2].trim();
  }
  return env;
}

function need(env, key) {
  const v = env[key];
  if (!v) throw new Error(`Missing env: ${key}`);
  return v;
}

function signBody(body, secret) {
  return "sha256=" + createHmac("sha256", secret).update(body).digest("hex");
}

async function main() {
  const env = loadEnv();
  const supabaseUrl = need(env, "NEXT_PUBLIC_SUPABASE_URL");
  const anonKey = need(env, "NEXT_PUBLIC_SUPABASE_ANON_KEY");
  const secret = need(env, "DENTEXGO_SHARED_SECRET");
  const slug = env.CLINIC_SLUG || "dentaris";
  const base = env.DENTEXGO_WEBHOOK_BASE_URL || "https://dentexgo.com";
  const target = `${base}/api/clinics/${slug}/sync`;

  const args = process.argv.slice(2);
  const limitIdx = args.indexOf("--limit");
  const limit = limitIdx >= 0 ? Number(args[limitIdx + 1]) : Infinity;
  const kindIdx = args.indexOf("--kind");
  const kind = kindIdx >= 0 ? args[kindIdx + 1] : "service";

  const tableByKind = { service: "services", staff: "doctors" };
  const table = tableByKind[kind];
  if (!table) throw new Error(`Unknown --kind: ${kind} (expected service|staff)`);

  console.log(`→ fetching ${table} rows from ${supabaseUrl}`);
  const res = await fetch(
    `${supabaseUrl}/rest/v1/${table}?select=id,slug&order=sort_order`,
    { headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` } },
  );
  if (!res.ok) {
    throw new Error(`Supabase fetch failed: ${res.status} ${await res.text()}`);
  }
  const rows = await res.json();
  console.log(`  got ${rows.length} rows`);

  const toSync = rows.slice(0, Number.isFinite(limit) ? limit : rows.length);
  console.log(`→ posting ${toSync.length} sync webhooks to ${target}\n`);

  let ok = 0;
  let fail = 0;
  for (const r of toSync) {
    const payload = {
      kind,
      action: "upsert",
      id: r.id,
      occurredAt: new Date().toISOString(),
    };
    const body = JSON.stringify(payload);
    const sig = signBody(body, secret);
    try {
      const wr = await fetch(target, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Dentexgo-Signature": sig,
        },
        body,
      });
      if (wr.ok || wr.status === 202) {
        console.log(`  ok  ${wr.status}  ${r.slug || r.id}`);
        ok++;
      } else {
        const text = await wr.text().catch(() => "");
        console.log(
          `  err ${wr.status}  ${r.slug || r.id}  ${text.slice(0, 160)}`,
        );
        fail++;
      }
    } catch (err) {
      console.log(`  net ${r.slug || r.id}  ${err.message}`);
      fail++;
    }
  }
  console.log(`\n${ok} ok, ${fail} fail`);
  if (fail > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
