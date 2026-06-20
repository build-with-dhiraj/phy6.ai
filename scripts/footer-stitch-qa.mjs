import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const OUT = path.join(process.cwd(), ".qa-screens/footer-stitch");
const BASE = process.env.BASE_URL ?? "http://localhost:3000";

function galleryState(page) {
  return page.evaluate(() => {
    const vh = window.innerHeight;
    const footer = document.querySelector("footer");
    const fr = footer?.getBoundingClientRect();
    const imgs = [...document.querySelectorAll("img")]
      .filter((i) => i.src.includes("/gallery/"))
      .map((i) => ({
        name: i.src.split("/").pop()?.replace(".jpg", ""),
        opacity: parseFloat(getComputedStyle(i).opacity),
        clip: i.style.clipPath || getComputedStyle(i).clipPath,
      }));
    const counter = document
      .querySelector("[data-gallery-counter]")
      ?.textContent?.trim();
    return {
      vh,
      scrollY: window.scrollY,
      footerTop: fr?.top,
      footerBottom: fr?.bottom,
      counter,
      imgs,
    };
  });
}

async function scrollTo(page, y, label) {
  await page.evaluate((yy) => window.scrollTo(0, yy), y);
  await page.waitForTimeout(350);
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await mkdir(OUT, { recursive: true });

await page.goto(BASE, { waitUntil: "networkidle" });
await page.waitForTimeout(1200);

const geom = await page.evaluate(() => {
  const footer = document.querySelector("footer");
  const vh = window.innerHeight;
  const fr = footer.getBoundingClientRect();
  const footerBottomDoc = window.scrollY + fr.bottom;
  const footerTopDoc = window.scrollY + fr.top;
  const crossY = footerBottomDoc - vh;
  const footerOffTopY = footerTopDoc;
  const footerOffBottomY = footerBottomDoc;
  const maxScroll = document.documentElement.scrollHeight - vh;
  return { vh, crossY, footerOffTopY, footerOffBottomY, maxScroll, footerHeight: fr.height };
});

const checkpoints = [
  { name: "hero-top", scrollY: 0 },
  { name: "hero-mid-pinned", scrollY: 900 },
  { name: "manifesto-fold", scrollY: 2200 },
  { name: "pre-footer-alexandr-hold", scrollY: Math.round(geom.crossY - 400) },
  { name: "pre-footer-alexandr-hold-2", scrollY: Math.round(geom.crossY - 150) },
  { name: "footer-bottom-at-vp-bottom", scrollY: Math.round(geom.crossY) },
  { name: "split-25pct", scrollY: Math.round(geom.crossY + geom.vh * 0.25) },
  { name: "split-50pct-mid", scrollY: Math.round(geom.crossY + geom.vh * 0.5) },
  { name: "split-75pct", scrollY: Math.round(geom.crossY + geom.vh * 0.75) },
  { name: "footer-top-at-vp-top", scrollY: Math.round(geom.footerOffTopY) },
  { name: "footer-off-screen", scrollY: Math.round(geom.footerOffBottomY + 50) },
  { name: "page-end-emmanuel", scrollY: geom.maxScroll },
];

const report = [];

for (const cp of checkpoints) {
  await scrollTo(page, cp.scrollY, cp.name);
  const state = await galleryState(page);
  const file = path.join(OUT, `${cp.name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  report.push({ checkpoint: cp.name, scrollY: cp.scrollY, ...state });
}

// Slow scroll through split zone — many frames
const slowStart = Math.round(geom.crossY - 100);
const slowEnd = Math.round(geom.crossY + geom.vh);
const slowSteps = 12;
for (let i = 0; i <= slowSteps; i++) {
  const y = Math.round(slowStart + (i / slowSteps) * (slowEnd - slowStart));
  await scrollTo(page, y, `slow-${i}`);
  const file = path.join(OUT, `slow-scroll-${String(i).padStart(2, "0")}.png`);
  await page.screenshot({ path: file, fullPage: false });
  const state = await galleryState(page);
  report.push({ checkpoint: `slow-${i}`, scrollY: y, ...state });
}

// Fast scroll simulation — jump through without long waits
const fastPoints = [
  geom.crossY - 300,
  geom.crossY,
  geom.crossY + geom.vh * 0.5,
  geom.maxScroll,
];
for (let i = 0; i < fastPoints.length; i++) {
  const y = Math.round(fastPoints[i]);
  await page.evaluate((yy) => window.scrollTo(0, yy), y);
  await page.waitForTimeout(80);
  const file = path.join(OUT, `fast-jump-${i}.png`);
  await page.screenshot({ path: file, fullPage: false });
  report.push({
    checkpoint: `fast-${i}`,
    scrollY: y,
    ...(await galleryState(page)),
  });
}

await browser.close();

console.log(JSON.stringify({ geom, report }, null, 2));
