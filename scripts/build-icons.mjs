import sharp from "sharp";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const SRC_LOGO = path.join(root, "public", "logo.png");
const SRC_LOGO_TAB = path.join(root, "public", "logo-tab.png");
const APP_DIR = path.join(root, "src", "app");

const BRAND = { r: 26, g: 132, b: 120, alpha: 1 };

async function fitOnSquare(size, { background, padding = 0.16, source = SRC_LOGO }) {
  const inner = Math.round(size * (1 - padding * 2));
  const logo = await sharp(source)
    .resize(inner, inner, { fit: "inside", withoutEnlargement: false })
    .toBuffer();
  return sharp({
    create: { width: size, height: size, channels: 4, background },
  })
    .composite([{ input: logo, gravity: "center" }])
    .png()
    .toBuffer();
}

async function buildOg() {
  const W = 1200;
  const H = 630;
  const logo = await sharp(SRC_LOGO)
    .resize(640, null, { fit: "inside" })
    .toBuffer();
  const titleSvg = Buffer.from(`
    <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#0c2a26"/>
          <stop offset="100%" stop-color="#1a8478"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#bg)"/>
      <text x="50%" y="78%" text-anchor="middle"
        font-family="Inter, system-ui, sans-serif" font-size="42" font-weight="600"
        fill="#ffffff" letter-spacing="2">
        DENTARIS DIGITAL DENTAL CLINIC
      </text>
    </svg>
  `);
  return sharp(titleSvg)
    .composite([{ input: logo, gravity: "north", top: 140, left: Math.round((W - 640) / 2) }])
    .png()
    .toBuffer();
}

const tasks = [
  {
    out: path.join(APP_DIR, "icon.png"),
    buf: () =>
      fitOnSquare(512, {
        background: { r: 0, g: 0, b: 0, alpha: 0 },
        padding: 0.06,
        source: SRC_LOGO_TAB,
      }),
  },
  {
    out: path.join(APP_DIR, "apple-icon.png"),
    buf: () => fitOnSquare(180, { background: BRAND, padding: 0.16 }),
  },
  {
    out: path.join(APP_DIR, "opengraph-image.png"),
    buf: () => buildOg(),
  },
];

for (const t of tasks) {
  const buf = await t.buf();
  await sharp(buf).toFile(t.out);
  console.log(`wrote ${path.relative(root, t.out)} (${buf.length} bytes)`);
}
