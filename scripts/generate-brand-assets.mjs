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
const ogSvg = join(root, "brand/og-image.svg");
const publicDir = join(root, "public");
const appDir = join(root, "src/app");

const SIZES = {
  "favicon-16x16.png": 16,
  "favicon-32x32.png": 32,
  "favicon-96x96.png": 96,
  "apple-touch-icon.png": 180,
  "android-chrome-192x192.png": 192,
  "android-chrome-512x512.png": 512,
};

async function rasterizeSvg(svgPath, size) {
  const buf = await readFile(svgPath);
  return sharp(buf, { density: Math.max(512, size * 4) })
    .resize(size, size, { fit: "contain", background: "#F8F3ED" })
    .png()
    .toBuffer();
}

async function main() {
  await mkdir(publicDir, { recursive: true });

  const pngBuffers = {};
  for (const [name, size] of Object.entries(SIZES)) {
    const out = join(publicDir, name);
    const png = await rasterizeSvg(markSvg, size);
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

  const ogPng = await sharp(await readFile(ogSvg))
    .resize(1200, 630)
    .png()
    .toBuffer();
  await writeFile(join(publicDir, "og-image.png"), ogPng);
  console.log("wrote og-image.png");

  const manifest = {
    name: "phy6",
    short_name: "phy6",
    description: "Learn everything, waste nothing.",
    start_url: "/",
    display: "standalone",
    background_color: "#F8F3ED",
    theme_color: "#F8F3ED",
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
