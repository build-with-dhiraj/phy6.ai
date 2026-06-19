import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const OUT = join(process.cwd(), "brand/favicon-options");
const PUB = join(process.cwd(), "public/favicon-options");
mkdirSync(OUT, { recursive: true });
mkdirSync(PUB, { recursive: true });

const P = "#F8F3ED";
const L = "#1E3A8A";
const G = "#C9A24A";
const S = "#6A4A33";
const I = "#1A1410";
const T = "#008078";
const D = "#141c2e";

const svgs = {
  "option-mila1-profile-dark": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="${I}" rx="48"/>
  <path fill="${L}" d="M280 120c-80 0-120 60-120 140 0 50 20 90 56 120 24 20 40 28 64 28s40-8 64-28c36-30 56-70 56-120 0-80-40-140-120-140zm-8 200c-40-24-64-64-64-112 0-56 28-96 72-96s72 40 72 96c0 48-24 88-64 112z"/>
</svg>`,

  "option-mila2-split-profile": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="256" height="512" fill="${I}"/>
  <rect x="256" width="256" height="512" fill="${P}"/>
  <path fill="${T}" d="M120 380V140c0-20 40-60 100-60 50 0 90 30 90 80v60c0 30-20 50-50 50H170c-30 0-50-20-50-50z"/>
</svg>`,

  "option-mila3-profile-lapis": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="${L}"/>
  <path fill="${P}" d="M256 96c-72 0-108 56-108 132 0 44 18 84 52 112 22 18 38 26 60 26s38-8 60-26c34-28 52-68 52-112 0-76-36-132-108-132zm0 48c44 0 72 32 72 84 0 36-16 68-44 88-14 10-24 14-28 14s-14-4-28-14c-28-20-44-52-44-88 0-52 28-84 72-84z"/>
</svg>`,

  "option-mila4-profile-line": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <rect width="512" height="512" fill="${P}"/>
  <path stroke="${L}" stroke-width="28" stroke-linecap="round" stroke-linejoin="round" d="M340 380c-40 24-72 24-112 0-48-32-72-80-72-136 0-72 48-124 112-124 40 0 72 16 96 44"/>
</svg>`,

  "option-mila5-profile-gold": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="${I}" rx="64"/>
  <circle cx="256" cy="256" r="180" fill="none" stroke="${G}" stroke-width="6"/>
  <path fill="${P}" d="M300 140c-56 0-96 44-96 108 0 36 16 68 44 92 18 14 32 20 52 20s34-6 52-20c28-24 44-56 44-92 0-64-40-108-96-108z"/>
</svg>`,

  "option-marek1-touching-hands": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <rect width="512" height="512" fill="${P}"/>
  <path stroke="${I}" stroke-width="20" stroke-linecap="round" d="M96 320 C160 200 200 160 256 200 C292 224 320 260 340 300"/>
  <path stroke="${L}" stroke-width="20" stroke-linecap="round" d="M416 200 C360 120 300 100 256 200 C240 232 230 268 224 300"/>
  <circle cx="256" cy="200" r="12" fill="${G}"/>
</svg>`,

  "option-marek2-reclining-curve": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <rect width="512" height="512" fill="#F8F3ED"/>
  <path fill="none" stroke="#1A1410" stroke-width="24" stroke-linecap="round" d="M80 360 C120 280 200 200 320 180 C380 170 420 200 440 240"/>
  <path fill="none" stroke="#6A4A33" stroke-width="14" stroke-linecap="round" opacity="0.5" d="M100 380 C180 320 280 300 400 320"/>
</svg>`,

  "option-marek3-creation-rays": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <rect width="512" height="512" fill="${P}"/>
  <circle cx="256" cy="256" r="48" fill="${G}"/>
  <g stroke="${L}" stroke-width="16" stroke-linecap="round">
    <line x1="256" y1="80" x2="256" y2="160"/><line x1="256" y1="328" x2="256" y2="408"/>
    <line x1="80" y1="256" x2="160" y2="256"/><line x1="328" y1="256" x2="408" y2="256"/>
    <line x1="130" y1="130" x2="190" y2="190"/><line x1="302" y1="302" x2="358" y2="358"/>
    <line x1="358" y1="130" x2="302" y2="190"/><line x1="190" y1="302" x2="130" y2="358"/>
  </g>
</svg>`,

  "option-marek4-body-s-curve": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <rect width="512" height="512" fill="${P}"/>
  <path stroke="${I}" stroke-width="32" stroke-linecap="round" d="M380 120 C280 120 220 200 220 280 C220 340 180 380 120 400"/>
</svg>`,

  "option-marek5-divine-spark": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <rect width="512" height="512" fill="${P}"/>
  <circle cx="256" cy="256" r="160" stroke="${S}" stroke-width="8"/>
  <path stroke="${L}" stroke-width="22" stroke-linecap="round" d="M256 120 L256 200 M256 288 L256 392 M120 256 L200 256 M288 256 L392 256"/>
  <circle cx="256" cy="256" r="20" fill="${G}"/>
</svg>`,

  "option-bayram1-ornate-frame": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <rect width="512" height="512" fill="${D}"/>
  <rect x="64" y="64" width="384" height="384" stroke="${G}" stroke-width="12" fill="${P}"/>
  <path stroke="${L}" stroke-width="8" stroke-linecap="round" d="M64 64 Q128 32 192 64 M320 64 Q384 32 448 64 M64 448 Q128 480 192 448 M320 448 Q384 480 448 448"/>
</svg>`,

  "option-bayram2-flourish-vine": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <rect width="512" height="512" fill="${D}"/>
  <path stroke="${P}" stroke-width="18" stroke-linecap="round" d="M120 400 C120 280 200 200 280 160 C340 120 380 100 400 80"/>
  <path stroke="${G}" stroke-width="10" stroke-linecap="round" opacity="0.8" d="M160 360 C200 300 260 260 340 220"/>
</svg>`,

  "option-bayram3-starburst": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <rect width="512" height="512" fill="${D}"/>
  <g stroke="${P}" stroke-width="14" stroke-linecap="round">
    <line x1="256" y1="96" x2="256" y2="180"/><line x1="256" y1="308" x2="256" y2="396"/>
    <line x1="96" y1="256" x2="180" y2="256"/><line x1="308" y1="256" x2="396" y2="256"/>
    <line x1="140" y1="140" x2="200" y2="200"/><line x1="288" y1="288" x2="352" y2="352"/>
    <line x1="352" y1="140" x2="288" y2="200"/><line x1="200" y1="288" x2="140" y2="352"/>
  </g>
  <circle cx="256" cy="256" r="36" fill="${G}"/>
</svg>`,

  "option-bayram4-scallop-arch": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="${D}"/>
  <path fill="${P}" d="M96 400 V200 Q256 80 416 200 V400 Z"/>
  <path fill="none" stroke="${L}" stroke-width="10" d="M96 400 Q256 120 416 400"/>
</svg>`,

  "option-bayram5-whimsy-dots": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <rect width="512" height="512" fill="${D}"/>
  <path fill="${L}" opacity="0.9" d="M256 96 C360 96 416 180 416 280 C416 380 340 416 256 416 C172 416 96 380 96 280 C96 180 152 96 256 96Z"/>
  <circle cx="200" cy="240" r="16" fill="${G}"/>
  <circle cx="280" cy="200" r="12" fill="${P}"/>
  <circle cx="320" cy="300" r="10" fill="${P}"/>
</svg>`,

  "option-ecl1-profile-fill": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="${P}"/>
  <path fill="#E2AE85" d="M320 400c-48 28-96 28-144 0-56-36-80-96-80-168 0-72 48-128 112-128 48 0 88 24 112 64 24-16 48-24 80-24 64 0 112 56 112 128 0 72-24 132-80 168z"/>
  <path fill="${L}" opacity="0.15" d="M280 120c-72 0-108 56-108 132v48h216v-48c0-76-36-132-108-132z"/>
</svg>`,

  "option-ecl2-profile-stroke": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <rect width="512" height="512" fill="${P}"/>
  <path stroke="${I}" stroke-width="22" stroke-linecap="round" stroke-linejoin="round" d="M360 380 C300 420 220 420 160 380 C100 340 80 260 80 200 C80 140 120 96 180 96 C210 96 240 108 260 128 C280 108 310 96 340 96 C400 96 440 140 440 200 C440 260 420 340 360 380Z"/>
</svg>`,

  "option-ecl3-profile-wreath": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <rect width="512" height="512" fill="${P}"/>
  <path stroke="${S}" stroke-width="10" stroke-linecap="round" d="M160 320 C120 280 100 220 120 180 C140 140 200 120 256 120 C312 120 348 140 368 180 C388 220 372 280 332 320"/>
  <circle cx="280" cy="240" r="64" fill="#E2AE85"/>
  <path stroke="${I}" stroke-width="16" d="M280 200v80 M248 240h64"/>
</svg>`,

  "option-ecl4-profile-medallion": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="${P}"/>
  <circle cx="256" cy="256" r="200" fill="none" stroke="${G}" stroke-width="12"/>
  <circle cx="256" cy="256" r="168" fill="#EDD1C0"/>
  <path fill="${I}" d="M300 340c-32 20-64 20-96 0-40-26-60-70-60-120 0-56 32-96 76-96 20 0 40 8 56 20 16-12 36-20 60-20 44 0 76 40 76 96 0 50-20 94-60 120z"/>
</svg>`,

  "option-ecl5-profile-shadow": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="${P}"/>
  <path fill="${S}" opacity="0.35" d="M360 400 H152 V200 C152 140 200 96 256 96 C312 96 360 140 360 200 Z"/>
  <path fill="${I}" d="M340 380 C300 400 244 400 196 380 C156 360 140 300 140 240 C140 180 180 140 240 140 H280 C340 140 380 180 380 240 C380 300 360 360 340 380Z"/>
</svg>`,

  "option-rgu1-vertical-bands": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="102" height="512" fill="${P}"/>
  <rect x="102" width="102" height="512" fill="#FDF6EE"/>
  <rect x="204" width="102" height="512" fill="#E3D2E9"/>
  <rect x="306" width="102" height="512" fill="#9D98CA"/>
  <rect x="408" width="104" height="512" fill="${L}"/>
</svg>`,

  "option-rgu2-golden-stripes": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="${P}"/>
  <rect x="0" width="64" height="512" fill="${L}"/>
  <rect x="64" width="32" height="512" fill="${G}"/>
  <rect x="96" width="64" height="512" fill="${P}"/>
  <rect x="160" width="32" height="512" fill="${S}" opacity="0.4"/>
  <rect x="192" width="320" height="512" fill="${P}"/>
</svg>`,

  "option-rgu3-column-edge": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="${P}"/>
  <rect x="0" width="180" height="512" fill="${L}"/>
  <g stroke="${G}" stroke-width="4" opacity="0.6">
    <line x1="36" y1="0" x2="36" y2="512"/><line x1="72" y1="0" x2="72" y2="512"/>
    <line x1="108" y1="0" x2="108" y2="512"/><line x1="144" y1="0" x2="144" y2="512"/>
  </g>
</svg>`,

  "option-rgu4-stepped-wash": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="${P}"/>
  <rect y="0" width="512" height="102" fill="#FEF8EF"/>
  <rect y="102" width="512" height="102" fill="#F5E3E6"/>
  <rect y="204" width="512" height="102" fill="#E3D2E9"/>
  <rect y="306" width="512" height="102" fill="#9D98CA"/>
  <rect y="408" width="512" height="104" fill="${L}"/>
</svg>`,

  "option-rgu5-arch-columns": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="${P}"/>
  <path fill="${L}" d="M0 160 H512 V512 H0 Z"/>
  <path fill="none" stroke="${G}" stroke-width="8" d="M0 160 Q256 40 512 160"/>
  <rect x="40" width="48" height="352" fill="${P}" opacity="0.9"/>
  <rect x="232" width="48" height="352" fill="${P}" opacity="0.9"/>
  <rect x="424" width="48" height="352" fill="${P}" opacity="0.9"/>
</svg>`,
};

for (const [name, content] of Object.entries(svgs)) {
  const text = content.trim() + "\n";
  writeFileSync(join(OUT, `${name}.svg`), text);
  writeFileSync(join(PUB, `${name}.svg`), text);
}

console.log(`Wrote ${Object.keys(svgs).length} new option SVGs`);
