import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const OUT = path.join(process.cwd(), ".qa-screens");
const BASE = process.env.BASE_URL ?? "http://localhost:3000";

const checkpoints = [
  { name: "01-top-leonhard", scrollY: 0 },
  { name: "02-hero-pinned", scrollY: 1100 },
  { name: "03-marc-gap-manifesto-rise", scrollY: 1800 },
  { name: "04-manifesto-fold", scrollY: 2400 },
  { name: "05-alexandr-gap-email-rise", scrollY: 4200 },
  { name: "06-emmanuel-end", scrollY: null },
];

async function galleryState(page) {
  return page.evaluate(() => {
    const vh = window.innerHeight;
    const imgs = [...document.querySelectorAll("img")]
      .filter((i) => i.src.includes("/gallery/"))
      .map((i) => ({
        name: i.src.split("/").pop()?.replace(".jpg", ""),
        opacity: parseFloat(i.style.opacity || getComputedStyle(i).opacity),
      }));
    const dominant = imgs.reduce(
      (a, b) => (b.opacity > a.opacity ? b : a),
      imgs[0],
    );
    const counter = document.querySelector("main .font-mono")?.textContent?.trim();
    const manifesto = document.querySelector("#manifesto > div");
    const hero = document.querySelector("section[aria-label='Introduction'] > div");
    const textCol = document.querySelector("#manifesto > div > div:last-child");
    return {
      vh,
      scrollY: window.scrollY,
      counter,
      dominant: dominant?.name,
      dominantOpacity: dominant?.opacity,
      active: imgs.filter((i) => i.opacity > 0.15).map((i) => i.name),
      manifestoHeight: manifesto?.getBoundingClientRect().height,
      heroHeight: hero?.getBoundingClientRect().height,
      textColOverflow: textCol ? getComputedStyle(textCol).overflowY : null,
      textColScrollHeight: textCol?.scrollHeight,
      textColClientHeight: textCol?.clientHeight,
    };
  });
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await mkdir(OUT, { recursive: true });

await page.goto(BASE, { waitUntil: "networkidle" });
await page.waitForTimeout(1500);

const maxScroll = await page.evaluate(
  () => document.documentElement.scrollHeight - window.innerHeight,
);
checkpoints.find((c) => c.scrollY === null).scrollY = maxScroll;

const report = [];

for (const cp of checkpoints) {
  await page.evaluate((y) => window.scrollTo(0, y), cp.scrollY);
  await page.waitForTimeout(400);
  const state = await galleryState(page);
  const file = path.join(OUT, `${cp.name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  report.push({ checkpoint: cp.name, scrollY: cp.scrollY, ...state });
}

await browser.close();

console.log(JSON.stringify({ base: BASE, maxScroll, report }, null, 2));
