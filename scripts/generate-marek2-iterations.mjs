import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const OUT = join(process.cwd(), "brand/favicon-options");
const PUB = join(process.cwd(), "public/favicon-options");
mkdirSync(OUT, { recursive: true });
mkdirSync(PUB, { recursive: true });

const P = "#F8F3ED";
const I = "#1A1410";
const L = "#1E3A8A";
const G = "#C9A24A";
const S = "#6A4A33";
const O = "#7C2D29";

/** Original marek2 — reclining body arc + sepia shadow stroke */
const FIG = "M80 360 C120 280 200 200 320 180 C380 170 420 200 440 240";
const SHAD = "M100 380 C180 320 280 300 400 320";
const SHAD_DEEP = "M110 395 C190 335 290 315 410 335";
const SHAD_TIGHT = "M95 372 C175 312 275 308 395 312";
const FIG_LOW = "M80 400 C120 320 200 260 320 240 C380 230 420 260 440 280";
const SHAD_LOW = "M100 420 C180 360 280 340 400 360";
const FIG_HIGH = "M60 320 C100 240 180 140 300 120 C360 110 400 160 420 200";
const SHAD_HIGH = "M80 340 C160 280 260 260 380 280";

function svg(bg, primary, echo) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <rect width="512" height="512" fill="${bg}"/>
  <path fill="none" stroke="${primary.stroke}" stroke-width="${primary.w}" stroke-linecap="round" d="${primary.d}"/>
  <path fill="none" stroke="${echo.stroke}" stroke-width="${echo.w}" stroke-linecap="round"${echo.opacity ? ` opacity="${echo.opacity}"` : ""}${echo.dash ? ` stroke-dasharray="${echo.dash}"` : ""} d="${echo.d}"/>
</svg>`;
}

function pair(figD, shadD, primaryStroke, primaryW, echoStroke, echoW, echoOpts = {}) {
  return svg(P, { stroke: primaryStroke, w: primaryW, d: figD }, {
    stroke: echoStroke,
    w: echoW,
    d: shadD,
    opacity: echoOpts.opacity,
    dash: echoOpts.dash,
  });
}

const variants = {
  "option-marek2-reclining-curve": pair(FIG, SHAD, I, 24, S, 14, { opacity: "0.5" }),
  "option-marek2-v1-lapis-sepia": pair(FIG, SHAD, L, 24, S, 14, { opacity: "0.5" }),
  "option-marek2-v2-deep-shadow": pair(FIG, SHAD_DEEP, I, 24, S, 14, { opacity: "0.45" }),
  "option-marek2-v3-whisper-shadow": pair(FIG, SHAD_TIGHT, I, 24, S, 10, { opacity: "0.35" }),
  "option-marek2-v4-bold-figure": pair(FIG, SHAD, I, 32, S, 18, { opacity: "0.5" }),
  "option-marek2-v5-gold-sepia": pair(FIG, SHAD, G, 24, S, 14, { opacity: "0.55" }),
  "option-marek2-v6-lapis-shadow": pair(FIG, SHAD, I, 24, L, 14, { opacity: "0.35" }),
  "option-marek2-v7-grounded-low": pair(FIG_LOW, SHAD_LOW, I, 24, S, 14, { opacity: "0.5" }),
  "option-marek2-v8-reaching-high": pair(FIG_HIGH, SHAD_HIGH, I, 24, S, 14, { opacity: "0.5" }),
  "option-marek2-v9-double-shadow": pair(FIG, SHAD_TIGHT, I, 24, S, 12, { opacity: "0.45", dash: "14 10" }),
  "option-marek2-v10-oxblood-warm": pair(FIG, SHAD, O, 24, S, 14, { opacity: "0.5" }),
};

for (const [name, content] of Object.entries(variants)) {
  const text = content.trim() + "\n";
  writeFileSync(join(OUT, `${name}.svg`), text);
  writeFileSync(join(PUB, `${name}.svg`), text);
}

const optsPath = join(process.cwd(), "scripts/generate-favicon-options.mjs");
let opts = readFileSync(optsPath, "utf8");
const newMarek2 = variants["option-marek2-reclining-curve"].trim();
const re = /"option-marek2-reclining-curve": `[\s\S]*?`,/;
if (re.test(opts)) {
  opts = opts.replace(re, `"option-marek2-reclining-curve": \`${newMarek2}\`,`);
  writeFileSync(optsPath, opts);
}

console.log(`Wrote ${Object.keys(variants).length} marek2 SVGs (original reclining curve)`);
