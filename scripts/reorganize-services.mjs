#!/usr/bin/env node
/**
 * Reorganizes services to match the physical Dentaris catalog.
 * Creates parent categories and assigns existing services as children.
 * Run after migration 10_service_parent_id.sql.
 *
 * Usage: node scripts/reorganize-services.mjs
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const envFile = readFileSync(new URL("../.env", import.meta.url), "utf-8");
const env = Object.fromEntries(
  envFile.split("\n").filter(l => l.trim() && !l.startsWith("#"))
    .map(l => l.trim().split("=").map(s => s.trim()))
    .filter(([k, v]) => k && v),
);

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// Get default dental department
async function getDentalDeptId() {
  const { data } = await supabase
    .from("departments")
    .select("id, slug")
    .in("slug", ["dental", "general"])
    .order("sort_order")
    .limit(2);
  return data?.find(d => d.slug === "dental")?.id ?? data?.[0]?.id;
}

// Parent categories from the physical catalog
const CATEGORIES = [
  { slug: "cosmetic", icon: "smile", name_mn: "Шүдний гоо заслын эмчилгээ", name_en: "Cosmetic Dentistry", desc_mn: "Шүд цайруулалт, шигтгээ", desc_en: "Whitening, gems" },
  { slug: "diagnostic", icon: "routine", name_mn: "Бусад эмчилгээ", name_en: "Diagnostic & Other", desc_mn: "Рентген зураг, мэдээ алдуулалт", desc_en: "X-rays, anesthesia" },
  { slug: "prosthetic", icon: "crown", name_mn: "Согог заслын эмчилгээ", name_en: "Prosthetic Treatment", desc_mn: "Зай нөхөх, паалан", desc_en: "Space maintenance, enamel restoration" },
  { slug: "orthodontics", icon: "braces", name_mn: "Гажиг заслын эмчилгээ", name_en: "Orthodontic Treatment", desc_mn: "Оношилгоо, тэлэгч зэмсэг, Face mask", desc_en: "Diagnosis, expanders, appliances" },
  { slug: "fixed-prosthetics", icon: "crown", name_mn: "Авагддаггүй шүдэлбэр", name_en: "Fixed Prosthetics", desc_mn: "Циркон, гүүрэлсэн бүрээс, шаазан нүүрэвч", desc_en: "Zirconia, bridges, veneers" },
  { slug: "removable-prosthetics", icon: "crown", name_mn: "Авагддаг шүдэлбэр", name_en: "Removable Prosthetics", desc_mn: "Уян шахмал, метал суурьтай шүдэлбэр", desc_en: "Flexible, metal-based dentures" },
  { slug: "implant", icon: "implant", name_mn: "Имплант", name_en: "Dental Implant", desc_mn: "Солонгос, Япон имплант", desc_en: "Korean, Japanese implants" },
  { slug: "oral-surgery", icon: "surgery", name_mn: "Мэс ажилбар", name_en: "Oral Surgery", desc_mn: "Шүд авалт, агт араа, буйл тайрах", desc_en: "Extractions, wisdom teeth, gum surgery" },
  { slug: "preventive", icon: "hygiene", name_mn: "Урьдчилан сэргийлэх эмчилгээ", name_en: "Preventive Care", desc_mn: "Цэвэрлэгээ, чулуу авах, фторт түрхлэг", desc_en: "Cleaning, tartar removal, fluoride" },
  { slug: "pediatric", icon: "kid", name_mn: "Хүүхдийн эмчилгээ", name_en: "Pediatric Dentistry", desc_mn: "Сүүн шүдний ломбо, сувгийн эмчилгээ", desc_en: "Baby teeth fillings, root canal" },
  { slug: "adult-treatment", icon: "routine", name_mn: "Насанд хүрэгчдийн эмчилгээ", name_en: "Adult Treatment", desc_mn: "Цоорлын эмчилгээ, сувгийн эмчилгээ, ломбо", desc_en: "Cavity treatment, root canal, fillings" },
  { slug: "braces-types", icon: "braces", name_mn: "Шүдний аппаратны төрлүүд", name_en: "Braces Types", desc_mn: "Металл, шаазан, сафир, элайнер аппарат", desc_en: "Metal, ceramic, sapphire, aligner braces" },
];

// Map existing service slugs to parent category slugs
const CHILD_MAP = {
  // Cosmetic
  "cosmetic": ["whitening-full", "whitening-single-tooth", "tooth-gem", "veneer-composite"],
  // Diagnostic
  "diagnostic": ["xray", "anesthesia-local", "consultation"],
  // Prosthetic
  "prosthetic": ["space-maintenance", "enamel-restoration"],
  // Orthodontics treatment
  "orthodontics": [
    "orthodontics-aligner-diagnostics", "orthodontics-single-arch",
    "orthodontics-removable-pediatric", "orthodontics-facemask",
    "orthodontics-screw", "orthodontics-retainer-removable",
    "orthodontics-adjustment", "orthodontics-bracket-reattach-fallen",
    "orthodontics-bracket-reattach-lost", "orthodontics-brush-kit",
  ],
  // Fixed prosthetics
  "fixed-prosthetics": ["crown-zirconia"],
  // Removable prosthetics
  "removable-prosthetics": [],
  // Implant
  "implant": ["implant"],
  // Oral surgery
  "oral-surgery": [
    "extraction-regular", "wisdom-tooth-regular", "wisdom-tooth-impacted",
    "tooth-root-extraction", "lingual-frenectomy", "labial-frenectomy",
  ],
  // Preventive
  "preventive": [
    "tartar-removal-single", "tartar-removal-full", "cleaning-full", "nightguard",
  ],
  // Pediatric
  "pediatric": ["pediatric-filling", "pediatric-root-canal"],
  // Adult treatment
  "adult-treatment": ["filling-adult", "root-canal"],
  // Braces types
  "braces-types": [
    "orthodontics-metal", "orthodontics-ceramic", "orthodontics-sapphire",
    "orthodontics-self-ligating", "orthodontics-self-ligating-ceramic",
  ],
};

async function main() {
  console.log("Reorganizing services...\n");

  const deptId = await getDentalDeptId();
  if (!deptId) {
    console.error("No dental department found!");
    process.exit(1);
  }
  console.log(`Department: ${deptId}\n`);

  // Get all existing services
  const { data: existing } = await supabase
    .from("services")
    .select("id, slug, parent_id")
    .is("itdoctor_service_id", null);

  const slugToId = Object.fromEntries((existing ?? []).map(s => [s.slug, s.id]));

  // Step 1: Create parent categories
  const parentIds = {};
  for (let i = 0; i < CATEGORIES.length; i++) {
    const cat = CATEGORIES[i];

    // Check if already exists
    if (slugToId[cat.slug]) {
      // Update to be a parent (clear parent_id)
      await supabase.from("services").update({
        parent_id: null,
        name_mn: cat.name_mn,
        name_en: cat.name_en,
        description_mn: cat.desc_mn,
        description_en: cat.desc_en,
        icon_key: cat.icon,
        is_active: true,
        sort_order: i + 1,
      }).eq("id", slugToId[cat.slug]);
      parentIds[cat.slug] = slugToId[cat.slug];
      console.log(`  Updated parent: ${cat.name_mn} (${cat.slug})`);
    } else {
      const { data: inserted, error } = await supabase.from("services").insert({
        slug: cat.slug,
        department_id: deptId,
        name_mn: cat.name_mn,
        name_en: cat.name_en,
        description_mn: cat.desc_mn,
        description_en: cat.desc_en,
        icon_key: cat.icon,
        currency: "MNT",
        is_active: true,
        sort_order: i + 1,
      }).select("id").single();

      if (error) {
        console.error(`  Error creating ${cat.slug}:`, error.message);
      } else {
        parentIds[cat.slug] = inserted.id;
        console.log(`  Created parent: ${cat.name_mn} (${cat.slug})`);
      }
    }
  }

  // Step 2: Assign children to parents
  let assigned = 0;
  for (const [parentSlug, childSlugs] of Object.entries(CHILD_MAP)) {
    const parentId = parentIds[parentSlug];
    if (!parentId) continue;

    for (const childSlug of childSlugs) {
      const childId = slugToId[childSlug];
      if (!childId) {
        console.log(`  Skip (not found): ${childSlug}`);
        continue;
      }
      // Don't assign parent to itself
      if (childId === parentId) continue;

      const { error } = await supabase
        .from("services")
        .update({ parent_id: parentId })
        .eq("id", childId);

      if (error) {
        console.error(`  Error assigning ${childSlug} → ${parentSlug}:`, error.message);
      } else {
        console.log(`  Assigned: ${childSlug} → ${parentSlug}`);
        assigned++;
      }
    }
  }

  // Step 3: Services without a parent that aren't parents themselves = orphans
  // Keep them active but log them
  const { data: orphans } = await supabase
    .from("services")
    .select("slug, name_mn")
    .is("parent_id", null)
    .is("itdoctor_service_id", null)
    .eq("is_active", true);

  const parentSlugs = new Set(CATEGORIES.map(c => c.slug));
  const realOrphans = (orphans ?? []).filter(o => !parentSlugs.has(o.slug));

  if (realOrphans.length > 0) {
    console.log(`\n  Orphaned services (no parent assigned):`);
    for (const o of realOrphans) {
      console.log(`    - ${o.slug}: ${o.name_mn}`);
    }
  }

  console.log(`\nDone! Parents: ${Object.keys(parentIds).length}, Children assigned: ${assigned}`);
}

main().catch(e => { console.error("Failed:", e); process.exit(1); });
