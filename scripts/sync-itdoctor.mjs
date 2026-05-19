#!/usr/bin/env node
/**
 * Sync IT Doctor API data → Supabase.
 * Usage: node scripts/sync-itdoctor.mjs
 *
 * Requires .env with:
 *   ITDOCTOR_API_URL, ITDOCTOR_API_TOKEN,
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

// Load .env manually
const envFile = readFileSync(new URL("../.env", import.meta.url), "utf-8");
const env = Object.fromEntries(
  envFile
    .split("\n")
    .filter((l) => l.trim() && !l.startsWith("#"))
    .map((l) => l.trim().split("=").map((s) => s.trim()))
    .filter(([k, v]) => k && v),
);

const API_URL = env.ITDOCTOR_API_URL;
const API_TOKEN = env.ITDOCTOR_API_TOKEN;
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!API_URL || !API_TOKEN || !SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing env vars. Check .env file.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function apiFetch(path) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { Authorization: `Bearer ${API_TOKEN}` },
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || "API error");
  return json.data;
}

function slugify(s) {
  return (
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || `item-${Date.now().toString(36)}`
  );
}

async function main() {
  console.log("Fetching IT Doctor data...");

  const [dentists, services] = await Promise.all([
    apiFetch("/dentists"),
    apiFetch("/services"),
  ]);

  console.log(`Found ${dentists.length} dentists, ${services.length} services`);

  // Get a dental department (prefer "dental" slug, then "general")
  const { data: depts } = await supabase
    .from("departments")
    .select("id, slug")
    .in("slug", ["dental", "general"])
    .order("sort_order", { ascending: true });

  const defaultDeptId = depts?.find((d) => d.slug === "dental")?.id
    ?? depts?.[0]?.id;
  if (!defaultDeptId) {
    console.error("No dental department found. Create one first.");
    process.exit(1);
  }
  console.log(`Using department: ${depts?.find(d => d.id === defaultDeptId)?.slug} (${defaultDeptId})`)

  let synced = 0;
  let deactivated = 0;

  // Sync dentists
  for (const d of dentists) {
    const nameMn = `${d.lastname} ${d.firstname}`;
    const nameEn = `${d.firstname} ${d.lastname}`;

    const { data: existing } = await supabase
      .from("doctors")
      .select("id")
      .eq("itdoctor_dentist_id", d.id)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("doctors")
        .update({ name_mn: nameMn, name_en: nameEn, department_id: defaultDeptId, is_active: true })
        .eq("id", existing.id);
      console.log(`  Updated: ${nameMn} (IT Doctor #${d.id})`);
    } else {
      const slug = slugify(nameEn);
      const { error } = await supabase.from("doctors").insert({
        department_id: defaultDeptId,
        slug,
        name_mn: nameMn,
        name_en: nameEn,
        title_mn: d.title || null,
        title_en: d.title || null,
        photo_url: d.avatar || null,
        itdoctor_dentist_id: d.id,
        is_active: true,
        sort_order: d.id,
      });
      if (error) {
        console.error(`  Error inserting ${nameMn}:`, error.message);
      } else {
        console.log(`  Created: ${nameMn} (IT Doctor #${d.id})`);
      }
    }
    synced++;
  }

  // Sync services
  for (const s of services) {
    const { data: existing } = await supabase
      .from("services")
      .select("id")
      .eq("itdoctor_service_id", s.id)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("services")
        .update({ name_mn: s.name, name_en: s.name, is_active: true })
        .eq("id", existing.id);
      console.log(`  Updated service: ${s.name} (IT Doctor #${s.id})`);
    } else {
      const slug = slugify(s.name) + `-${s.id}`;
      const { error } = await supabase.from("services").insert({
        department_id: defaultDeptId,
        slug,
        name_mn: s.name,
        name_en: s.name,
        itdoctor_service_id: s.id,
        currency: "MNT",
        is_active: true,
        sort_order: s.id,
      });
      if (error) {
        console.error(`  Error inserting ${s.name}:`, error.message);
      } else {
        console.log(`  Created service: ${s.name} (IT Doctor #${s.id})`);
      }
    }
    synced++;
  }

  // Deactivate unlinked records
  const itDentistIds = dentists.map((d) => d.id);
  const itServiceIds = services.map((s) => s.id);

  const { data: allDoctors } = await supabase
    .from("doctors")
    .select("id, name_mn, itdoctor_dentist_id")
    .eq("is_active", true);

  for (const doc of allDoctors ?? []) {
    if (!doc.itdoctor_dentist_id || !itDentistIds.includes(doc.itdoctor_dentist_id)) {
      await supabase.from("doctors").update({ is_active: false }).eq("id", doc.id);
      console.log(`  Deactivated doctor: ${doc.name_mn}`);
      deactivated++;
    }
  }

  const { data: allServices } = await supabase
    .from("services")
    .select("id, name_mn, itdoctor_service_id")
    .eq("is_active", true);

  for (const svc of allServices ?? []) {
    if (!svc.itdoctor_service_id || !itServiceIds.includes(svc.itdoctor_service_id)) {
      await supabase.from("services").update({ is_active: false }).eq("id", svc.id);
      console.log(`  Deactivated service: ${svc.name_mn}`);
      deactivated++;
    }
  }

  console.log(`\nDone! Synced: ${synced}, Deactivated: ${deactivated}`);
}

main().catch((e) => {
  console.error("Sync failed:", e);
  process.exit(1);
});
