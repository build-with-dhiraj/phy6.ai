/**
 * Scroll-UP visual QA: margin edges + motion at veryslow/slow/fast/superfast.
 * Mirrors silk-qa-full.mjs but every pass scrolls upward (decreasing scrollY).
 */
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT = path.join(process.cwd(), ".qa-screens/silk-qa-scroll-up");
const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const VIEWPORT = { width: 1440, height: 900 };

const SPEEDS = [
  { tag: "veryslow", step: 4, ms: 48 },
  { tag: "slow", step: 8, ms: 32 },
  { tag: "fast", step: 35, ms: 16 },
  { tag: "superfast", step: 80, ms: 8 },
];

function stitchP(bottom, vh) {
  if (bottom > vh) return 0;
  if (bottom <= 0) return 1;
  return Math.max(0, Math.min(1, 1 - bottom / vh));
}

async function state(page) {
  return page.evaluate(() => {
    const vh = window.innerHeight;
    const hero = document.querySelector("section[aria-label='Introduction'] > div");
    const manifesto = document.querySelector("#manifesto > div");
    const footer = document.querySelector("footer");
    const hr = hero.getBoundingClientRect();
    const mr = manifesto.getBoundingClientRect();
    const fr = footer.getBoundingClientRect();
    const imgs = [...document.querySelectorAll("img")].filter((i) =>
      i.src.includes("/gallery/"),
    );
    return {
      scrollY: window.scrollY,
      vh,
      hero: { top: hr.top, bottom: hr.bottom },
      manifesto: { top: mr.top, bottom: mr.bottom },
      footer: { top: fr.top, bottom: fr.bottom },
      op: imgs.map((i) => parseFloat(getComputedStyle(i).opacity)),
      clips: imgs.map((i) => i.style.clipPath || getComputedStyle(i).clipPath),
    };
  });
}

/** Scroll UP: startY > endY */
async function scrollUpZone(page, name, startY, endY, speed, outDir) {
  const frames = [];
  const start = Math.round(startY);
  const end = Math.round(endY);
  await page.evaluate((y) => window.scrollTo(0, y), start);
  await page.waitForTimeout(250);
  const step = speed.step;
  const steps = Math.max(1, Math.ceil((start - end) / step));
  for (let i = 0; i <= steps; i++) {
    const y = Math.max(0, start - i * step);
    if (y < end) break;
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(speed.ms);
    const s = await state(page);
    frames.push({ i, scrollY: y, dir: "up", ...s });
    if (i % Math.max(1, Math.floor(steps / 4)) === 0 || i === steps || y <= end) {
      await page.screenshot({
        path: path.join(outDir, `motion_up_${name}_${speed.tag}_f${i}.png`),
      });
    }
    if (y <= end) break;
  }
  return frames;
}

function maxStepDelta(frames, idx) {
  let max = 0;
  for (let i = 1; i < frames.length; i++) {
    max = Math.max(max, Math.abs(frames[i].op[idx] - frames[i - 1].op[idx]));
  }
  return max;
}

function monotonicViolations(frames, idx, direction) {
  let v = 0;
  for (let i = 1; i < frames.length; i++) {
    const d = frames[i].op[idx] - frames[i - 1].op[idx];
    if (direction === "up" && d > 0.02) v++;
    if (direction === "down" && d < -0.02) v++;
  }
  return v;
}

async function runUpGates(page, geom, vh) {
  const failures = [];

  // Gate: jump UP split -> hold (reverse of Bug A)
  await page.evaluate(() => window.scrollTo(0, 5500));
  await page.waitForTimeout(300);
  await page.evaluate(() => window.scrollTo(0, 4973));
  await page.waitForTimeout(400);
  const jumpHold = await state(page);
  if (jumpHold.footer.bottom > vh && jumpHold.op[3] > 0.01) {
    failures.push({
      gate: "jump_up_split_to_hold",
      emmanuel: jumpHold.op[3],
      footerBottom: jumpHold.footer.bottom,
    });
  }

  // Gate: jump UP hold -> split (large scroll up into footer crossfade)
  await page.evaluate(() => window.scrollTo(0, 4973));
  await page.waitForTimeout(300);
  await page.evaluate(() => window.scrollTo(0, 5500));
  await page.waitForTimeout(400);
  const jumpSplit = await state(page);
  const expectedEmm = stitchP(jumpSplit.footer.bottom, vh);
  if (
    jumpSplit.footer.bottom < vh &&
    jumpSplit.footer.bottom > 0 &&
    Math.abs(jumpSplit.op[3] - expectedEmm) > 0.08
  ) {
    failures.push({
      gate: "jump_up_hold_to_split",
      expectedEmm,
      actualEmm: jumpSplit.op[3],
      footerBottom: jumpSplit.footer.bottom,
    });
  }

  // Gate: jump UP emmanuel hold -> footer split
  await page.evaluate(() => window.scrollTo(0, 7353));
  await page.waitForTimeout(300);
  await page.evaluate(() => window.scrollTo(0, 5600));
  await page.waitForTimeout(400);
  const jumpFromEnd = await state(page);
  if (jumpFromEnd.footer.bottom > 0 && jumpFromEnd.op[2] < 0.9) {
    failures.push({
      gate: "jump_up_emmanuel_to_split",
      alexandr: jumpFromEnd.op[2],
      emmanuel: jumpFromEnd.op[3],
      footerBottom: jumpFromEnd.footer.bottom,
    });
  }

  // Gate: linear margins (scroll UP approach — same positions)
  const heroCrossY = geom.hero.bottomDoc - vh;
  const yHero = Math.round(heroCrossY + 20);
  await page.evaluate((y) => window.scrollTo(0, y), yHero);
  await page.waitForTimeout(400);
  const heroMargin = await state(page);
  const heroErr = Math.abs(heroMargin.op[1] - stitchP(heroMargin.hero.bottom, vh));
  if (heroErr > 0.02) {
    failures.push({ gate: "hero_up_linear", err: heroErr });
  }

  const manCrossY = geom.manifesto.bottomDoc - vh;
  const yMan = Math.round(manCrossY + 20);
  await page.evaluate((y) => window.scrollTo(0, y), yMan);
  await page.waitForTimeout(400);
  const manMargin = await state(page);
  const manErr = Math.abs(manMargin.op[2] - stitchP(manMargin.manifesto.bottom, vh));
  if (manErr > 0.02) {
    failures.push({ gate: "manifesto_up_linear", err: manErr });
  }

  const footCrossY = geom.footer.bottomDoc - vh;
  const yFoot = Math.round(footCrossY + 20);
  await page.evaluate((y) => window.scrollTo(0, y), yFoot);
  await page.waitForTimeout(400);
  const footMargin = await state(page);
  const footErr = Math.abs(footMargin.op[3] - stitchP(footMargin.footer.bottom, vh));
  if (footErr > 0.02) {
    failures.push({ gate: "footer_up_linear", err: footErr });
  }

  // Gate: footer hold scrolling up from deep split
  const footHoldUpY = Math.round(footCrossY + 40);
  await page.evaluate(() => window.scrollTo(0, 5600));
  await page.waitForTimeout(300);
  await page.evaluate((y) => window.scrollTo(0, y), footHoldUpY);
  await page.waitForTimeout(400);
  const footHoldUp = await state(page);
  if (footHoldUp.footer.bottom > vh && footHoldUp.op[3] > 0.01) {
    failures.push({
      gate: "scroll_up_foot_hold_emmanuel_leak",
      emmanuel: footHoldUp.op[3],
      footerBottom: footHoldUp.footer.bottom,
    });
  }

  return {
    failures,
    snapshots: { jumpHold, jumpSplit, jumpFromEnd, heroMargin, manMargin, footMargin, footHoldUp },
  };
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: VIEWPORT });
await mkdir(OUT, { recursive: true });
const fullDir = path.join(OUT, "full");
await mkdir(fullDir, { recursive: true });

await page.goto(BASE, { waitUntil: "networkidle" });
await page.waitForTimeout(1500);

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
    maxScroll: document.documentElement.scrollHeight - window.innerHeight,
    hero: { topDoc: sy + hr.top, bottomDoc: sy + hr.bottom },
    manifesto: { topDoc: sy + mr.top, bottomDoc: sy + mr.bottom },
    footer: { topDoc: sy + fr.top, bottomDoc: sy + fr.bottom },
  };
});

const vh = geom.vh;
const margins = [-80, -40, -20, -8, -2, 0, 2, 8, 20, 40, 80];
const edgeReport = [];

// Edge snapshots (positions identical to scroll-down QA; validates state when scrolling up through them)
for (const zone of [
  { prefix: "hero-bottom", edgeDoc: geom.hero.bottomDoc, opIdx: 1, getBottom: (s) => s.hero.bottom },
  { prefix: "manifesto-bottom", edgeDoc: geom.manifesto.bottomDoc, opIdx: 2, getBottom: (s) => s.manifesto.bottom },
  { prefix: "footer-bottom", edgeDoc: geom.footer.bottomDoc, opIdx: 3, getBottom: (s) => s.footer.bottom },
  { prefix: "hero-top", edgeDoc: geom.hero.topDoc, opIdx: 0, getBottom: (s) => s.hero.top, isTop: true },
  { prefix: "manifesto-top", edgeDoc: geom.manifesto.topDoc, opIdx: 1, getBottom: (s) => s.manifesto.top, isTop: true },
  { prefix: "footer-top", edgeDoc: geom.footer.topDoc, opIdx: 2, getBottom: (s) => s.footer.top, isTop: true },
]) {
  for (const m of margins) {
    const y = zone.isTop
      ? Math.max(0, Math.round(zone.edgeDoc - m))
      : Math.max(0, Math.round(zone.edgeDoc - vh - m));
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(350);
    const s = await state(page);
    const edge = zone.getBottom(s);
    const expected = zone.isTop ? null : stitchP(edge, vh);
    const actual = s.op[zone.opIdx];
    edgeReport.push({
      name: `${zone.prefix}_m${m}`,
      scrollY: y,
      edge,
      expected,
      actual,
      err: expected != null ? Math.abs(actual - expected) : null,
    });
    await page.screenshot({
      path: path.join(fullDir, `edge_up_${zone.prefix}_m${m}.png`),
    });
  }
}

// Progress points (cross, p50, past) — captured after scrolling UP into zone from below
const progressPoints = [
  { name: "hero-cross", y: geom.hero.bottomDoc - vh },
  { name: "hero-p50", y: geom.hero.bottomDoc - vh * 0.5 },
  { name: "hero-past", y: geom.hero.bottomDoc + 40 },
  { name: "manifesto-cross", y: geom.manifesto.bottomDoc - vh },
  { name: "manifesto-p50", y: geom.manifesto.bottomDoc - vh * 0.5 },
  { name: "manifesto-past", y: geom.manifesto.bottomDoc + 40 },
  { name: "footer-cross", y: geom.footer.bottomDoc - vh },
  { name: "footer-p50", y: geom.footer.bottomDoc - vh * 0.5 },
  { name: "footer-exit", y: geom.footer.bottomDoc + 5 },
  { name: "footer-hold", y: geom.footer.bottomDoc - vh - 60 },
];

for (const p of progressPoints) {
  // Approach from below (higher scrollY), then settle
  const approachY = Math.min(geom.maxScroll, Math.round(p.y + 200));
  await page.evaluate((yy) => window.scrollTo(0, yy), approachY);
  await page.waitForTimeout(200);
  await page.evaluate((yy) => window.scrollTo(0, yy), Math.round(p.y));
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(OUT, `snap_up_${p.name}.png`) });
}

// Jump screenshots (scroll UP)
await page.evaluate(() => window.scrollTo(0, 4973));
await page.waitForTimeout(300);
await page.evaluate(() => window.scrollTo(0, 5500));
await page.waitForTimeout(400);
await page.screenshot({ path: path.join(OUT, "jump_up_hold_to_split.png") });

await page.evaluate(() => window.scrollTo(0, 5500));
await page.waitForTimeout(300);
await page.evaluate(() => window.scrollTo(0, 4973));
await page.waitForTimeout(400);
await page.screenshot({ path: path.join(OUT, "jump_up_split_to_hold.png") });

const maxScroll = geom.maxScroll;
await page.evaluate((y) => window.scrollTo(0, y), maxScroll);
await page.waitForTimeout(300);
await page.evaluate(() => window.scrollTo(0, 5640));
await page.waitForTimeout(400);
await page.screenshot({ path: path.join(OUT, "jump_up_end_to_footer_split.png") });

// Motion passes — scroll UP through each zone
const zones = [
  {
    name: "hero",
    start: geom.hero.bottomDoc + 80,
    end: geom.hero.bottomDoc - vh - 120,
    inIdx: 1,
    outIdx: 0,
  },
  {
    name: "manifesto",
    start: geom.manifesto.bottomDoc + 80,
    end: geom.manifesto.bottomDoc - vh - 120,
    inIdx: 2,
    outIdx: 1,
  },
  {
    name: "footer",
    start: geom.footer.bottomDoc + 200,
    end: geom.footer.bottomDoc - vh - 120,
    inIdx: 3,
    outIdx: 2,
  },
];

const motionReport = {};
const motionFailures = [];

for (const zone of zones) {
  motionReport[zone.name] = {};
  for (const speed of SPEEDS) {
    const frames = await scrollUpZone(
      page,
      zone.name,
      zone.start,
      zone.end,
      speed,
      fullDir,
    );
    motionReport[zone.name][speed.tag] = frames.length;
    const maxIn = maxStepDelta(frames, zone.inIdx);
    const maxOut = maxStepDelta(frames, zone.outIdx);
    const monoIn = monotonicViolations(frames, zone.inIdx, "up");
    const limit = speed.step >= 50 ? 0.45 : speed.step <= 4 ? 0.06 : 0.12;
    const last = frames[frames.length - 1];
    // Scroll-up into footer split from Emmanuel hold: Alexandr 0→1 at branch entry
    const branchEntrySnap =
      zone.name === "footer" &&
      maxOut >= 0.99 &&
      last?.op[zone.outIdx] >= 0.95;
    if ((maxIn > limit || maxOut > limit) && !branchEntrySnap) {
      motionFailures.push({
        zone: zone.name,
        speed: speed.tag,
        maxIn,
        maxOut,
        limit,
      });
    }
    if (monoIn > 2) {
      motionFailures.push({
        zone: zone.name,
        speed: speed.tag,
        monoIn,
        type: "monotonic_up",
      });
    }
  }
}

const gateResult = await runUpGates(page, geom, vh);

// Key round-1 style snapshots
const roundDir = path.join(OUT, "round-1");
await mkdir(roundDir, { recursive: true });
const roundPoints = [
  { file: "hero-cross", y: geom.hero.bottomDoc - vh },
  { file: "footer-p50", y: geom.footer.bottomDoc - vh * 0.5 },
  { file: "footer-hold", y: geom.footer.bottomDoc - vh - 60 },
];
for (const p of roundPoints) {
  await page.evaluate((yy) => window.scrollTo(0, yy), Math.round(p.y));
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(roundDir, `${p.file}.png`) });
}

const edgeMaxErr = Math.max(
  ...edgeReport
    .filter((e) => e.err != null)
    .map((e) => e.err),
  0,
);

const report = {
  direction: "scroll-up",
  timestamp: new Date().toISOString(),
  geom,
  passed:
    gateResult.failures.length === 0 &&
    motionFailures.length === 0 &&
    edgeMaxErr < 0.02,
  gateFailures: gateResult.failures,
  motionFailures,
  edgeMaxErr,
  edgeReport,
  motionReport,
  gateSnapshots: gateResult.snapshots,
};

await writeFile(path.join(OUT, "report.json"), JSON.stringify(report, null, 2));

await browser.close();
console.log(JSON.stringify({
  passed: report.passed,
  gateFailures: report.gateFailures,
  motionFailures: report.motionFailures,
  edgeMaxErr: report.edgeMaxErr,
  motionReport: report.motionReport,
}, null, 2));

process.exit(report.passed ? 0 : 1);
