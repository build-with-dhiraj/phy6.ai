/**
 * Iterative silk QA — runs gate checks until all pass or max rounds.
 * Outputs to .qa-screens/silk-qa/
 */
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT = path.join(process.cwd(), ".qa-screens/silk-qa");
const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const VIEWPORT = { width: 1440, height: 900 };

function stitchP(bottom, vh) {
  if (bottom > vh) return 0;
  if (bottom <= 0) return 1;
  return Math.max(0, Math.min(1, 1 - bottom / vh));
}

async function getOpacities(page) {
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

async function scrollPass(page, { startY, endY, stepPx, frameMs }) {
  const samples = [];
  await page.evaluate((y) => window.scrollTo(0, y), startY);
  await page.waitForTimeout(150);
  const dir = endY >= startY ? 1 : -1;
  const steps = Math.abs(Math.round((endY - startY) / stepPx));
  for (let i = 0; i <= steps; i++) {
    const y = Math.round(startY + i * stepPx * dir);
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(frameMs);
    const s = await getOpacities(page);
    samples.push(s);
  }
  return samples;
}

function maxStepDelta(samples, idx) {
  let max = 0;
  for (let i = 1; i < samples.length; i++) {
    max = Math.max(max, Math.abs(samples[i].op[idx] - samples[i - 1].op[idx]));
  }
  return max;
}

async function runGates(page, geom) {
  const failures = [];
  const vh = geom.vh;

  // Gate 1: jump split -> hold (Bug A)
  await page.evaluate(() => window.scrollTo(0, 5500));
  await page.waitForTimeout(300);
  await page.evaluate(() => window.scrollTo(0, 4973));
  await page.waitForTimeout(400);
  const jumpHold = await getOpacities(page);
  if (jumpHold.footer.bottom > vh && jumpHold.op[3] > 0.01) {
    failures.push({
      gate: "jump_split_to_hold",
      emmanuel: jumpHold.op[3],
      footerBottom: jumpHold.footer.bottom,
    });
  }

  // Gate 2: footer exit (Bug B)
  await page.evaluate(() => window.scrollTo(0, 5914));
  await page.waitForTimeout(400);
  const footerExit = await getOpacities(page);
  if (footerExit.footer.bottom <= 0 && footerExit.op[2] > 0.01) {
    failures.push({
      gate: "footer_exit_alexandr_leak",
      alexandr: footerExit.op[2],
      emmanuel: footerExit.op[3],
      footerBottom: footerExit.footer.bottom,
    });
  }

  // Gate 3: linear hero crossfade at margin -20
  const heroCrossY = geom.hero.bottomDoc - vh;
  const yHero = Math.round(heroCrossY + 20);
  await page.evaluate((y) => window.scrollTo(0, y), yHero);
  await page.waitForTimeout(400);
  const heroMargin = await getOpacities(page);
  const expectedMarc = stitchP(heroMargin.hero.bottom, vh);
  const marcErr = Math.abs(heroMargin.op[1] - expectedMarc);
  if (marcErr > 0.02) {
    failures.push({
      gate: "hero_linear_margin",
      expectedMarc,
      actualMarc: heroMargin.op[1],
      err: marcErr,
    });
  }

  // Gate 4: manifesto linear
  const manCrossY = geom.manifesto.bottomDoc - vh;
  const yMan = Math.round(manCrossY + 20);
  await page.evaluate((y) => window.scrollTo(0, y), yMan);
  await page.waitForTimeout(400);
  const manMargin = await getOpacities(page);
  const expectedAle = stitchP(manMargin.manifesto.bottom, vh);
  const aleErr = Math.abs(manMargin.op[2] - expectedAle);
  if (aleErr > 0.02) {
    failures.push({
      gate: "manifesto_linear_margin",
      expectedAle,
      actualAle: manMargin.op[2],
      err: aleErr,
    });
  }

  // Gate 5: footer hold before cross
  const footCrossY = geom.footer.bottomDoc - vh;
  await page.evaluate((y) => window.scrollTo(0, y + 40), Math.round(footCrossY));
  await page.waitForTimeout(400);
  const footHold = await getOpacities(page);
  if (footHold.footer.bottom > vh && footHold.op[3] > 0.01) {
    failures.push({
      gate: "footer_pre_cross_emmanuel",
      emmanuel: footHold.op[3],
      footerBottom: footHold.footer.bottom,
    });
  }

  // Gate 6: scroll passes smoothness
  const passes = [
    { name: "hero-slow", start: heroCrossY - 100, end: heroCrossY + vh + 50, step: 8, ms: 32 },
    { name: "hero-superfast", start: heroCrossY - 100, end: heroCrossY + vh + 200, step: 80, ms: 8 },
    { name: "footer-slow", start: footCrossY - 100, end: footCrossY + vh + 50, step: 8, ms: 32 },
    { name: "footer-superfast", start: footCrossY - 100, end: geom.footer.bottomDoc + 200, step: 80, ms: 8 },
  ];

  const passMetrics = {};
  for (const p of passes) {
    const samples = await scrollPass(page, {
      startY: Math.round(p.start),
      endY: Math.round(p.end),
      stepPx: p.step,
      frameMs: p.ms,
    });
    const fromIdx = p.name.startsWith("hero") ? 0 : 2;
    const toIdx = p.name.startsWith("hero") ? 1 : 3;
    const maxIn = maxStepDelta(samples, toIdx);
    const maxOut = maxStepDelta(samples, fromIdx);
    const endOp = samples[samples.length - 1]?.op[toIdx] ?? 0;
    passMetrics[p.name] = { maxIn, maxOut, endOp, samples: samples.length };
    if (p.name.includes("superfast") && p.name.includes("footer") && endOp < 0.98) {
      failures.push({ gate: "footer_superfast_incomplete", endOp });
    }
    const limit = p.step >= 50 ? 0.45 : 0.12;
    const branchExitSnap =
      p.name.includes("footer") &&
      maxOut >= 0.99 &&
      samples[samples.length - 1]?.op[3] >= 0.98;
    if ((maxIn > limit || maxOut > limit) && !branchExitSnap) {
      failures.push({
        gate: `pass_${p.name}_delta`,
        maxIn,
        maxOut,
        limit,
      });
    }
  }

  return { failures, passMetrics, snapshots: { jumpHold, footerExit, heroMargin, manMargin, footHold } };
}

async function captureScreenshots(page, geom, round) {
  const dir = path.join(OUT, `round-${round}`);
  await mkdir(dir, { recursive: true });
  const vh = geom.vh;
  const points = [
    { name: "hero-p50", y: geom.hero.bottomDoc - vh * 0.5 },
    { name: "manifesto-cross", y: geom.manifesto.bottomDoc - vh },
    { name: "manifesto-p50", y: geom.manifesto.bottomDoc - vh * 0.5 },
    { name: "footer-cross", y: geom.footer.bottomDoc - vh },
    { name: "footer-p50", y: geom.footer.bottomDoc - vh * 0.5 },
    { name: "footer-exit", y: geom.footer.bottomDoc + 5 },
    { name: "jump-hold", y: geom.footer.bottomDoc - vh - 60 },
  ];
  for (const p of points) {
    await page.evaluate((yy) => window.scrollTo(0, yy), Math.round(p.y));
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(dir, `${p.name}.png`) });
  }
  const jumpHoldY = Math.round(geom.footer.bottomDoc - vh - 60);
  await page.evaluate(() => window.scrollTo(0, 5500));
  await page.waitForTimeout(300);
  await page.evaluate((yy) => window.scrollTo(0, yy), jumpHoldY);
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(dir, "jump-split-to-hold.png") });
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: VIEWPORT });
await mkdir(OUT, { recursive: true });

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
    hero: { topDoc: sy + hr.top, bottomDoc: sy + hr.bottom },
    manifesto: { topDoc: sy + mr.top, bottomDoc: sy + mr.bottom },
    footer: { topDoc: sy + fr.top, bottomDoc: sy + fr.bottom },
  };
});

const result = await runGates(page, geom);
await captureScreenshots(page, geom, 1);

const report = {
  timestamp: new Date().toISOString(),
  geom,
  passed: result.failures.length === 0,
  failures: result.failures,
  passMetrics: result.passMetrics,
};

await writeFile(path.join(OUT, "report.json"), JSON.stringify(report, null, 2));
await browser.close();

console.log(JSON.stringify(report, null, 2));
process.exit(report.passed ? 0 : 1);
