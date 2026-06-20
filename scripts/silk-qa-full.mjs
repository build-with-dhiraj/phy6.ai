/**
 * Full progressive edge QA at slow / fast / veryfast / superfast speeds.
 */
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT = path.join(process.cwd(), ".qa-screens/silk-qa/full");
const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const VIEWPORT = { width: 1440, height: 900 };

const SPEEDS = [
  { tag: "slow", step: 8, ms: 32 },
  { tag: "fast", step: 35, ms: 16 },
  { tag: "veryfast", step: 50, ms: 12 },
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
    };
  });
}

async function scrollZone(page, name, startY, endY, speed) {
  const frames = [];
  await page.evaluate((y) => window.scrollTo(0, y), Math.round(startY));
  await page.waitForTimeout(200);
  const dir = endY >= startY ? 1 : -1;
  const steps = Math.abs(Math.round((endY - startY) / speed.step));
  for (let i = 0; i <= steps; i++) {
    const y = Math.round(startY + i * speed.step * dir);
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(speed.ms);
    const s = await state(page);
    frames.push({ i, scrollY: y, ...s });
    if (i % Math.max(1, Math.floor(steps / 4)) === 0 || i === steps) {
      await page.screenshot({
        path: path.join(OUT, `motion_${name}_${speed.tag}_f${i}.png`),
      });
    }
  }
  return frames;
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

const vh = geom.vh;
const margins = [-80, -40, -20, -8, -2, 0, 2, 8, 20, 40, 80];
const edgeReport = [];

for (const zone of [
  { prefix: "hero-bottom", edgeDoc: geom.hero.bottomDoc, opIdx: 1 },
  { prefix: "manifesto-bottom", edgeDoc: geom.manifesto.bottomDoc, opIdx: 2 },
  { prefix: "footer-bottom", edgeDoc: geom.footer.bottomDoc, opIdx: 3 },
]) {
  for (const m of margins) {
    const y = Math.max(0, Math.round(zone.edgeDoc - vh - m));
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(350);
    const s = await state(page);
    const bottom =
      zone.prefix === "hero-bottom"
        ? s.hero.bottom
        : zone.prefix === "manifesto-bottom"
          ? s.manifesto.bottom
          : s.footer.bottom;
    const expected = stitchP(bottom, vh);
    const actual = s.op[zone.opIdx];
    edgeReport.push({
      name: `${zone.prefix}_m${m}`,
      scrollY: y,
      bottom,
      expected,
      actual,
      err: Math.abs(actual - expected),
    });
    await page.screenshot({
      path: path.join(OUT, `edge_${zone.prefix}_m${m}.png`),
    });
  }
}

const zones = [
  {
    name: "hero",
    start: geom.hero.bottomDoc - vh - 120,
    end: geom.hero.bottomDoc + 80,
  },
  {
    name: "manifesto",
    start: geom.manifesto.bottomDoc - vh - 120,
    end: geom.manifesto.bottomDoc + 80,
  },
  {
    name: "footer",
    start: geom.footer.bottomDoc - vh - 120,
    end: geom.footer.bottomDoc + 200,
  },
];

const motionReport = {};
for (const zone of zones) {
  motionReport[zone.name] = {};
  for (const speed of SPEEDS) {
    motionReport[zone.name][speed.tag] = await scrollZone(
      page,
      zone.name,
      zone.start,
      zone.end,
      speed,
    );
  }
}

// Jump tests
const jumpHoldY = Math.round(geom.footer.bottomDoc - vh - 60);
await page.evaluate(() => window.scrollTo(0, 5500));
await page.waitForTimeout(300);
await page.evaluate((yy) => window.scrollTo(0, yy), jumpHoldY);
await page.waitForTimeout(400);
await page.screenshot({ path: path.join(OUT, "jump_split_to_hold.png") });
const jumpState = await state(page);

await page.evaluate(() => window.scrollTo(0, 5914));
await page.waitForTimeout(400);
await page.screenshot({ path: path.join(OUT, "footer_exit.png") });
const exitState = await state(page);

const summary = {
  passed:
    edgeReport.every((e) => e.err < 0.02 || e.bottom > vh && e.actual < 0.01) &&
    jumpState.op[3] < 0.01 &&
    exitState.op[2] < 0.01 &&
    exitState.op[3] > 0.99,
  edgeMaxErr: Math.max(...edgeReport.map((e) => e.err)),
  jumpHoldEmmanuel: jumpState.op[3],
  exitAlexandr: exitState.op[2],
  edgeReport,
  motionFrameCounts: Object.fromEntries(
    Object.entries(motionReport).map(([k, v]) => [
      k,
      Object.fromEntries(
        Object.entries(v).map(([sp, frames]) => [sp, frames.length]),
      ),
    ]),
  ),
};

await writeFile(path.join(OUT, "report.json"), JSON.stringify(summary, null, 2));
await browser.close();
console.log(JSON.stringify(summary, null, 2));
