/**
 * Generate phy6 favicons, PWA icons, and OG image from brand/favicon-mark.svg
 * Run: node scripts/generate-brand-assets.mjs
 */
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import toIco from "to-ico";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const markSvg = join(root, "brand/favicon-mark.svg");
const publicDir = join(root, "public");
const appDir = join(root, "src/app");

const PARCHMENT = "#F8F3ED";

const SIZES = {
  "favicon-16x16.png": 16,
  "favicon-32x32.png": 32,
  "favicon-96x96.png": 96,
  "apple-touch-icon.png": 180,
  "android-chrome-192x192.png": 192,
  "android-chrome-512x512.png": 512,
};

async function rasterizeSvg(svgBuffer, size, width, height, options = {}) {
  const w = width ?? size;
  const h = height ?? size;
  const density =
    options.density ??
    (size != null
      ? Math.min(512, Math.max(144, size * 12))
      : 120);
  return sharp(svgBuffer, {
    density,
    limitInputPixels: options.limitInputPixels ?? true,
  })
    .resize(w, h, { fit: "contain", background: PARCHMENT })
    .png()
    .toBuffer();
}

/** Download a single Google Fonts face to disk (TTF from CSS API). */
async function downloadGoogleFont(cssUrl, destPath) {
  const css = await fetch(cssUrl, {
    headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)" },
  }).then((r) => r.text());
  const match = css.match(/src: url\(([^)]+)\) format\('(?:woff2|truetype)'\)/);
  if (!match) throw new Error(`No font URL in CSS from ${cssUrl}`);
  const buf = await fetch(match[1]).then((r) => r.arrayBuffer());
  await writeFile(destPath, Buffer.from(buf));
}

async function buildOgPng() {
  const fontsDir = join(root, "brand/fonts");
  await mkdir(fontsDir, { recursive: true });

  const cormorantPath = join(fontsDir, "cormorant-garamond-600.ttf");
  const ebItalicPath = join(fontsDir, "eb-garamond-italic-400.ttf");

  await downloadGoogleFont(
    "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&display=swap",
    cormorantPath,
  );
  await downloadGoogleFont(
    "https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@1,400&display=swap",
    ebItalicPath,
  );

  const basePng = await rasterizeSvg(
    await readFile(join(root, "brand/og-image.svg")),
    null,
    1200,
    630,
  );

  const cormorantUrl = cormorantPath.replace(/\\/g, "/");
  const ebUrl = ebItalicPath.replace(/\\/g, "/");

  const textSvg = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <style>
      @font-face {
        font-family: 'Cormorant Garamond';
        font-weight: 600;
        font-style: normal;
        src: url('file://${cormorantUrl}') format('truetype');
      }
      @font-face {
        font-family: 'EB Garamond';
        font-weight: 400;
        font-style: italic;
        src: url('file://${ebUrl}') format('truetype');
      }
    </style>
  </defs>
  <text x="560" y="340" font-family="'Cormorant Garamond', serif" font-size="120" font-weight="600" fill="#1A1410">phy6</text>
  <text x="560" y="420" font-family="'EB Garamond', serif" font-size="36" font-style="italic" fill="#4A4035">Learn everything, waste nothing.</text>
</svg>`,
  );

  const textPng = await rasterizeSvg(textSvg, null, 1200, 630, { limitInputPixels: false });

  return sharp(basePng).composite([{ input: textPng, top: 0, left: 0 }]).png().toBuffer();
}

async function main() {
  await mkdir(publicDir, { recursive: true });

  const markBuf = await readFile(markSvg);

  const pngBuffers = {};
  for (const [name, size] of Object.entries(SIZES)) {
    const out = join(publicDir, name);
    const png = await rasterizeSvg(markBuf, size);
    pngBuffers[name] = png;
    await writeFile(out, png);
    console.log(`wrote ${name}`);
  }

  const faviconIco = await toIco([
    pngBuffers["favicon-16x16.png"],
    pngBuffers["favicon-32x32.png"],
  ]);
  await writeFile(join(appDir, "favicon.ico"), faviconIco);
  await writeFile(join(publicDir, "favicon.ico"), faviconIco);
  console.log("wrote favicon.ico");

  await writeFile(join(appDir, "icon.png"), pngBuffers["android-chrome-512x512.png"]);
  await writeFile(join(appDir, "apple-icon.png"), pngBuffers["apple-touch-icon.png"]);
  console.log("wrote src/app/icon.png and apple-icon.png");

  const ogPng = await buildOgPng();
  await writeFile(join(publicDir, "og-image.png"), ogPng);
  console.log("wrote og-image.png");

  const manifest = {
    name: "phy6",
    short_name: "phy6",
    description: "Learn everything, waste nothing.",
    start_url: "/",
    display: "standalone",
    background_color: PARCHMENT,
    theme_color: PARCHMENT,
    icons: [
      { src: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { src: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  };
  await writeFile(
    join(publicDir, "manifest.webmanifest"),
    JSON.stringify(manifest, null, 2) + "\n",
  );
  console.log("wrote manifest.webmanifest");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
