/**
 * Deep analysis of edge-stitch QA: expected vs actual opacity, branch boundaries, monotonicity.
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const REPORT = path.join(process.cwd(), ".qa-screens/edge-stitch/report.json");
const OUT = path.join(process.cwd(), ".qa-screens/edge-stitch/analysis.json");

const CROSSFADE = 0.12;
const SEGMENT_DUR = 1;
const crossfadeDur = CROSSFADE * SEGMENT_DUR;

function stitchP(bottom, vh) {
  if (bottom > vh) return 0;
  if (bottom <= 0) return 1;
  return 1 - bottom / vh;
}

function analyzePass(samples, fromIdx, toIdx, vh) {
  const errors = [];
  let maxDelta = 0;
  let monotonicViolations = 0;
  const deltas = [];

  for (let i = 0; i < samples.length; i++) {
    const s = samples[i];
    const bottom =
      s.heroBottom ?? s.manifestoBottom ?? s.footerBottom ?? null;
    if (bottom == null) continue;

    const expectedP = stitchP(bottom, vh);
    const outOpacity = s.opacities[toIdx];
    const inOpacity = s.opacities[fromIdx];
    const expectedOut = 1 - expectedP; // approximate for crossfade
    const expectedIn = expectedP;

    // Timeline uses power2.out easing on crossfade segment - not linear in opacity
    // Compare segmentP to linear model
    const linearIn = expectedP;

    if (i > 0) {
      const dIn = s.opacities[toIdx] - samples[i - 1].opacities[toIdx];
      const dOut = s.opacities[fromIdx] - samples[i - 1].opacities[fromIdx];
      deltas.push({ scrollY: s.scrollY, dIn, dOut, bottom });
      maxDelta = Math.max(maxDelta, Math.abs(dIn), Math.abs(dOut));

      if (bottom > 0 && bottom < vh) {
        if (dIn < -0.001) monotonicViolations++;
        if (dOut > 0.001) monotonicViolations++;
      }
    }

    if (bottom > 0 && bottom < vh) {
      const err = Math.abs(s.opacities[toIdx] - linearIn);
      if (err > 0.15) {
        errors.push({
          scrollY: s.scrollY,
          bottom,
          expectedLinearIn: linearIn,
          actualIn: s.opacities[toIdx],
          err,
        });
      }
    }
  }

  return { maxDelta, monotonicViolations, errors, deltaCount: deltas.length };
}

// Branch boundary analysis from snapshots
function branchAt(state, vh) {
  const h = state.hero;
  const m = state.manifesto;
  const f = state.footer;
  if (!h || !m || !f) return "unknown";
  if (h.top > 0) return "leonhard_hold";
  if (h.bottom > vh) return "leonhard_hold_pinned";
  if (h.bottom > 0) return "hero_crossfade";
  if (m.top > 0) return "marc_hold";
  if (m.bottom > vh) return "marc_hold_pinned";
  if (m.bottom > 0) return "manifesto_crossfade";
  if (f.top > vh) return "alexandr_hold";
  if (f.bottom > vh) return "alexandr_hold";
  if (f.bottom > 0) return "footer_split";
  return "emmanuel_hold";
}

const report = JSON.parse(await readFile(REPORT, "utf8"));
const vh = report.geom.vh;

const snapshotAnalysis = report.edgeSnapshots.map((s) => {
  const state = {
    hero: { top: s.heroTop, bottom: s.heroBottom },
    manifesto: { top: s.manifestoTop, bottom: s.manifestoBottom },
    footer: { top: s.footerTop, bottom: s.footerBottom },
  };
  return {
    name: s.name,
    scrollY: s.scrollY,
    branch: branchAt(state, vh),
    ...state,
    opacities: s.opacities,
  };
});

// Find branch transitions in snapshot order (sorted by scrollY)
const sorted = [...snapshotAnalysis].sort((a, b) => a.scrollY - b.scrollY);
const branchTransitions = [];
for (let i = 1; i < sorted.length; i++) {
  if (sorted[i].branch !== sorted[i - 1].branch) {
    branchTransitions.push({
      from: sorted[i - 1],
      to: sorted[i],
      branchFrom: sorted[i - 1].branch,
      branchTo: sorted[i].branch,
    });
  }
}

const passAnalysis = {};
for (const p of report.passSummary) {
  const full = JSON.parse(await readFile(REPORT, "utf8"));
  // pass samples not in summary - need to re-run or read from extended report
}
// Re-read full report for pass samples if stored - check report structure
const fullReport = JSON.parse(await readFile(REPORT, "utf8"));
if (fullReport.passSamples) {
  for (const [name, samples] of Object.entries(fullReport.passSamples)) {
    const zone = name.includes("hero") ? { from: 0, to: 1 }
      : name.includes("manifesto") ? { from: 1, to: 2 }
      : { from: 3, to: 3 }; // footer uses different model
    passAnalysis[name] = analyzePass(samples, zone.from, zone.to, vh);
  }
}

// Live: branch boundary scroll + reverse scroll + mobile
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
await page.waitForTimeout(1200);

const geom = await page.evaluate(() => {
  const sy = window.scrollY;
  const hero = document.querySelector("section[aria-label='Introduction'] > div");
  const manifesto = document.querySelector("#manifesto > div");
  const footer = document.querySelector("footer");
  const hr = hero.getBoundingClientRect();
  const mr = manifesto.getBoundingClientRect();
  const fr = footer.getBoundingClientRect();
  return {
    vh: window.innerHeight,
    hero: { topDoc: sy + hr.top, bottomDoc: sy + hr.bottom },
    manifesto: { topDoc: sy + mr.top, bottomDoc: sy + mr.bottom },
    footer: { topDoc: sy + fr.top, bottomDoc: sy + fr.bottom },
  };
});

function getState() {
  return page.evaluate(() => {
    const vh = window.innerHeight;
    const hero = document.querySelector("section[aria-label='Introduction'] > div");
    const manifesto = document.querySelector("#manifesto > div");
    const footer = document.querySelector("footer");
    const hr = hero.getBoundingClientRect();
    const mr = manifesto.getBoundingClientRect();
    const fr = footer.getBoundingClientRect();
    const imgs = [...document.querySelectorAll("img")]
      .filter((i) => i.src.includes("/gallery/"))
      .map((i) => parseFloat(getComputedStyle(i).opacity));
    return {
      scrollY: window.scrollY,
      hero: { top: hr.top, bottom: hr.bottom },
      manifesto: { top: mr.top, bottom: mr.bottom },
      footer: { top: fr.top, bottom: fr.bottom },
      opacities: imgs,
    };
  });
}

// Critical boundary scroll positions
const boundaries = [
  { name: "hero_bottom_cross", y: geom.hero.bottomDoc - geom.vh },
  { name: "hero_bottom_top", y: geom.hero.bottomDoc },
  { name: "hero_exited", y: geom.hero.bottomDoc + 1 },
  { name: "manifesto_top_cross", y: geom.manifesto.topDoc },
  { name: "manifesto_bottom_cross", y: geom.manifesto.bottomDoc - geom.vh },
  { name: "manifesto_bottom_top", y: geom.manifesto.bottomDoc },
  { name: "manifesto_exited", y: geom.manifesto.bottomDoc + 1 },
  { name: "footer_top_cross", y: geom.footer.topDoc },
  { name: "footer_bottom_cross", y: geom.footer.bottomDoc - geom.vh },
  { name: "footer_bottom_top", y: geom.footer.bottomDoc },
  { name: "footer_exited", y: geom.footer.bottomDoc + 1 },
];

const boundaryStates = [];
for (const b of boundaries) {
  for (const offset of [-40, -10, -2, 0, 2, 10, 40]) {
    const y = Math.max(0, Math.round(b.y + offset));
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(300);
    const state = await getState();
    boundaryStates.push({
      boundary: b.name,
      offset,
      scrollY: y,
      branch: branchAt(state, geom.vh),
      ...state,
    });
  }
}

// Reverse scroll through hero crossfade
const reverseSamples = [];
const revStart = geom.hero.bottomDoc - geom.vh + 200;
const revEnd = geom.hero.bottomDoc - geom.vh - 200;
await page.evaluate((y) => window.scrollTo(0, y), Math.round(revStart));
await page.waitForTimeout(300);
for (let y = revStart; y >= revEnd; y -= 12) {
  await page.evaluate((yy) => window.scrollTo(0, yy), Math.round(y));
  await page.waitForTimeout(32);
  const s = await getState();
  reverseSamples.push(s);
}

let revMaxDelta = 0;
let revViolations = 0;
for (let i = 1; i < reverseSamples.length; i++) {
  for (let k = 0; k < 4; k++) {
    const d = reverseSamples[i].opacities[k] - reverseSamples[i - 1].opacities[k];
    revMaxDelta = Math.max(revMaxDelta, Math.abs(d));
    if (Math.abs(d) > 0.12) revViolations++;
  }
}

// Mobile viewport
await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(500);
const mobileGeom = await page.evaluate(() => {
  const sy = window.scrollY;
  const hero = document.querySelector("section[aria-label='Introduction'] > div");
  const manifesto = document.querySelector("#manifesto > div");
  const footer = document.querySelector("footer");
  const hr = hero.getBoundingClientRect();
  const mr = manifesto.getBoundingClientRect();
  const fr = footer.getBoundingClientRect();
  return {
    vh: window.innerHeight,
    hero: { topDoc: sy + hr.top, bottomDoc: sy + hr.bottom, height: hr.height },
    manifesto: { topDoc: sy + mr.top, bottomDoc: sy + mr.bottom, height: mr.height },
    footer: { topDoc: sy + fr.top, bottomDoc: sy + fr.bottom, height: fr.height },
  };
});

const mobileSnapshots = [];
const mobileCross = mobileGeom.hero.bottomDoc - mobileGeom.vh;
for (const offset of [-60, -20, 0, 20, 60]) {
  const y = Math.max(0, Math.round(mobileCross + offset));
  await page.evaluate((yy) => window.scrollTo(0, yy), y);
  await page.waitForTimeout(400);
  const s = await getState();
  mobileSnapshots.push({ offset, scrollY: y, ...s, branch: branchAt(s, mobileGeom.vh) });
}

await browser.close();

const analysis = {
  viewport: "1440x900",
  geometry: report.geom,
  crossfadeDur,
  timelineEasing: "power2.out on GSAP crossfade segment",
  stitchFormula: "segmentP = clamp(1 - bottom/vh, 0, 1); scroll-linked NOT eased",
  snapshotCount: snapshotAnalysis.length,
  branchTransitions: branchTransitions.map((t) => ({
    scrollFrom: t.from.scrollY,
    scrollTo: t.to.scrollY,
    branchFrom: t.branchFrom,
    branchTo: t.branchTo,
    opacityFrom: t.from.opacities,
    opacityTo: t.to.opacities,
  })),
  marginTolerance: {
    heroBottom: report.edgeSnapshots
      .filter((e) => e.name.startsWith("hero-bottom_m"))
      .map((e) => ({
        margin: e.margin,
        bottom: e.heroBottom,
        leo: e.opacities[0]?.o,
        mar: e.opacities[1]?.o,
        expectedMarLinear: stitchP(e.heroBottom, vh),
      })),
    manifestoBottom: report.edgeSnapshots
      .filter((e) => e.name.startsWith("manifesto-bottom_m"))
      .map((e) => ({
        margin: e.margin,
        bottom: e.manifestoBottom,
        mar: e.opacities[1]?.o,
        ale: e.opacities[2]?.o,
        expectedAleLinear: stitchP(e.manifestoBottom, vh),
      })),
    footerBottom: report.edgeSnapshots
      .filter((e) => e.name.startsWith("footer-bottom_m"))
      .map((e) => ({
        margin: e.margin,
        bottom: e.footerBottom,
        ale: e.opacities[2]?.o,
        emm: e.opacities[3]?.o,
        expectedEmmLinear: stitchP(e.footerBottom, vh),
        holdViolation: e.footerBottom > vh && e.opacities[3]?.o > 0.01,
      })),
  },
  passSummary: report.passSummary,
  boundaryProbe: boundaryStates,
  reverseScroll: {
    samples: reverseSamples.length,
    maxOpacityDelta: revMaxDelta,
    largeJumpCount: revViolations,
  },
  mobile: {
    viewport: "390x844",
    geometry: mobileGeom,
    heroCrossSnapshots: mobileSnapshots,
  },
  issues: [],
};

// Auto-detect issues
for (const row of analysis.marginTolerance.footerBottom) {
  if (row.holdViolation) {
    analysis.issues.push({
      severity: "low",
      code: "FOOTER_PRE_CROSS_EMM_LEAK",
      detail: `Emmanuel opacity ${row.emm} when footer.bottom ${row.bottom} > vh ${vh}`,
      margin: row.margin,
    });
  }
}

for (const t of analysis.branchTransitions) {
  const oFrom = t.opacityFrom?.map((x) => x.o);
  const oTo = t.opacityTo?.map((x) => x.o);
  if (!oFrom || !oTo) continue;
  for (let k = 0; k < 4; k++) {
    const jump = Math.abs(oTo[k] - oFrom[k]);
    if (jump > 0.5 && t.branchFrom !== t.branchTo) {
      analysis.issues.push({
        severity: jump > 0.9 ? "medium" : "low",
        code: "BRANCH_OPACITY_JUMP",
        detail: `img${k} ${oFrom[k]}→${oTo[k]} at ${t.branchFrom}→${t.branchTo}`,
        scrollFrom: t.scrollFrom,
        scrollTo: t.scrollTo,
      });
    }
  }
}

for (const p of report.passSummary) {
  if (p.name.includes("superfast") && p.opacityRange) {
    const emm = p.opacityRange.emmanuel;
    if (emm && emm[1] < 0.95 && p.name.includes("footer")) {
      analysis.issues.push({
        severity: "low",
        code: "SUPERFAST_INCOMPLETE_CROSSFADE",
        detail: `${p.name} emmanuel max ${emm[1]}`,
      });
    }
  }
}

await writeFile(OUT, JSON.stringify(analysis, null, 2));
console.log(JSON.stringify({
  issues: analysis.issues,
  branchTransitionCount: analysis.branchTransitions.length,
  reverseMaxDelta: analysis.reverseScroll.maxOpacityDelta,
  mobile: analysis.mobile.heroCrossSnapshots,
}, null, 2));
