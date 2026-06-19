/**
 * Optimize Renaissance plate JPGs for web.
 * Run: node scripts/optimize-plates.mjs
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const assetsDir = join(root, "Design assets/Renaissance aesthetics");
const publicDir = join(root, "public");

const PLATES = [
  {
    source: "simon-champagne-9nXws2I_kgo-unsplash.jpg",
    dest: "manifesto-simon-plate.jpg",
    width: 2400,
    quality: 82,
  },
  {
    source: "daniel-gregoire-N7dsOPLDk9I-unsplash.jpg",
    dest: "vault-plate.jpg",
    width: 2400,
    quality: 82,
  },
  {
    source: "leonhard-niederwimmer-4kB471fxQnA-unsplash.jpg",
    dest: "email-atmosphere.jpg",
    width: 1920,
    quality: 80,
  },
];

const GALLERY_PLATES = [
  {
    source: "leonhard-niederwimmer-4kB471fxQnA-unsplash.jpg",
    dest: "gallery/leonhard-niederwimmer.jpg",
    width: 3200,
    quality: 82,
  },
  {
    source: "marc-olivier-jodoin-8fwZP4bq2bM-unsplash.jpg",
    dest: "gallery/marc-olivier-jodoin.jpg",
    width: 3200,
    quality: 82,
  },
  {
    source: "sung-jin-cho-lh3CiteqCPs-unsplash.jpg",
    dest: "gallery/sung-jin-cho.jpg",
    width: 3200,
    quality: 82,
  },
  {
    source: "alexandr-istomin-YTALkNd4rO0-unsplash.jpg",
    dest: "gallery/alexandr-istomin.jpg",
    width: 3200,
    quality: 82,
  },
  {
    source: "emmanuel-cassar-GjB1OW-XeP8-unsplash.jpg",
    dest: "gallery/emmanuel-cassar.jpg",
    width: 3200,
    quality: 82,
  },
  {
    source: "chelaxy-designs-Q1U2CjLeo2I-unsplash.jpg",
    dest: "gallery/chelaxy-designs.jpg",
    width: 3200,
    quality: 82,
  },
  {
    source: "daniel-gregoire-N7dsOPLDk9I-unsplash.jpg",
    dest: "gallery/daniel-gregoire.jpg",
    width: 3200,
    quality: 82,
  },
];

async function tinyBlurJpeg(inputPath) {
  const buf = await sharp(inputPath)
    .resize(16, 10, { fit: "cover" })
    .jpeg({ quality: 40 })
    .toBuffer();
  return `data:image/jpeg;base64,${buf.toString("base64")}`;
}

async function main() {
  await mkdir(publicDir, { recursive: true });
  const manifest = [];

  for (const plate of [...PLATES, ...GALLERY_PLATES]) {
    const input = join(assetsDir, plate.source);
    const output = join(publicDir, plate.dest);
    await mkdir(dirname(output), { recursive: true });
    await sharp(input)
      .resize(plate.width, null, { withoutEnlargement: true })
      .jpeg({ quality: plate.quality, mozjpeg: true })
      .toFile(output);
    const blur = await tinyBlurJpeg(output);
    manifest.push({
      source: plate.source,
      publicPath: `/${plate.dest}`,
      blurDataURL: blur,
    });
    console.log(`wrote ${plate.dest}`);
  }

  await writeFile(
    join(publicDir, "design-plates-manifest.json"),
    JSON.stringify(manifest, null, 2) + "\n",
  );
  console.log("wrote design-plates-manifest.json");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
