import sharp from "sharp";
import { fileURLToPath } from "node:url";
import { readdir, stat, rename, unlink } from "node:fs/promises";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.resolve(here, "..", "public");

const MAX_EDGE = 2000;
const JPEG_QUALITY = 78;
const WEBP_QUALITY = 80;
const SKIP_UNDER_BYTES = 150 * 1024;

const SKIP_NAMES = new Set([
  "logo.png",
  "contant.webp",
  "next.svg",
  "vercel.svg",
  "globe.svg",
  "file.svg",
  "window.svg",
]);

function shouldSkipExt(name) {
  const ext = path.extname(name).toLowerCase();
  return !(ext === ".jpg" || ext === ".jpeg" || ext === ".png");
}

async function processOne(file) {
  const src = path.join(PUBLIC_DIR, file);
  const st = await stat(src);
  if (!st.isFile()) return null;
  if (SKIP_NAMES.has(file)) return { file, skipped: "in skip list", before: st.size, after: st.size };
  if (shouldSkipExt(file)) return null;
  if (st.size < SKIP_UNDER_BYTES) return { file, skipped: "<150KB", before: st.size, after: st.size };

  const ext = path.extname(file).toLowerCase();
  const isPng = ext === ".png";
  const tmp = path.join(PUBLIC_DIR, `.tmp-${file}`);

  const pipeline = sharp(src, { failOn: "none" }).rotate().resize({
    width: MAX_EDGE,
    height: MAX_EDGE,
    fit: "inside",
    withoutEnlargement: true,
  });

  if (isPng) {
    await pipeline.png({ quality: 90, compressionLevel: 9, palette: true }).toFile(tmp);
  } else {
    await pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true, progressive: true }).toFile(tmp);
  }

  const after = (await stat(tmp)).size;
  if (after >= st.size) {
    await unlink(tmp);
    return { file, skipped: "no gain", before: st.size, after: st.size };
  }
  await rename(tmp, src);
  return { file, before: st.size, after };
}

function fmt(b) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / 1024 / 1024).toFixed(2)} MB`;
}

const entries = await readdir(PUBLIC_DIR);
const results = [];
for (const f of entries) {
  try {
    const r = await processOne(f);
    if (r) results.push(r);
  } catch (e) {
    results.push({ file: f, error: String(e.message || e) });
  }
}

let beforeTotal = 0;
let afterTotal = 0;
for (const r of results) {
  if (r.error) {
    console.log(`ERR  ${r.file}: ${r.error}`);
    continue;
  }
  beforeTotal += r.before;
  afterTotal += r.after;
  if (r.skipped) {
    console.log(`skip ${r.file.padEnd(60)} (${r.skipped}, ${fmt(r.before)})`);
  } else {
    const pct = ((1 - r.after / r.before) * 100).toFixed(0);
    console.log(`opt  ${r.file.padEnd(60)} ${fmt(r.before).padStart(10)} -> ${fmt(r.after).padStart(10)}  (-${pct}%)`);
  }
}
console.log("---");
console.log(`TOTAL ${fmt(beforeTotal)} -> ${fmt(afterTotal)} (saved ${fmt(beforeTotal - afterTotal)})`);
