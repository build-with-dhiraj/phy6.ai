/**
 * Edge-case visual QA: hero / manifesto / footer margins vs viewport.
 * Captures snapshots at before / on / after each edge crossing + scroll-speed passes.
 */
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT = path.join(process.cwd(), ".qa-screens/edge-stitch");
const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const VIEWPORT = { width: 1440, height: 900 };

function galleryState(page) {
  return page.evaluate(() => {
    const vh = window.innerHeight;
    const hero = document.querySelector("section[aria-label='Introduction'] > div");
    const manifesto = document.querySelector("#manifesto > div");
    const footer = document.querySelector("footer");
    const hr = hero?.getBoundingClientRect();
    const mr = manifesto?.getBoundingClientRect();
    const fr = footer?.getBoundingClientRect();
    const imgs = [...document.querySelectorAll("img")]
      .filter((i) => i.src.includes("/gallery/"))
      .map((i) => ({
        name: i.src.split("/").pop()?.replace(".jpg", ""),
        opacity: parseFloat(getComputedStyle(i).opacity),
        clip: i.style.clipPath || getComputedStyle(i).clipPath,
      }));
    return {
      scrollY: window.scrollY,
      vh,
      hero: hr
        ? { top: hr.top, bottom: hr.bottom, height: hr.height }
        : null,
      manifesto: mr
        ? { top: mr.top, bottom: mr.bottom, height: mr.height }
        : null,
      footer: fr
        ? { top: fr.top, bottom: fr.bottom, height: fr.height }
        : null,
      imgs,
    };
  });
}

/** scrollY so element edge (doc offset) aligns with viewport edge */
function scrollForEdge(docOffset, viewportEdge) {
  return Math.round(docOffset - viewportEdge);
}

async function measureGeometry(page) {
  return page.evaluate(() => {
    const vh = window.innerHeight;
    const hero = document.querySelector("section[aria-label='Introduction'] > div");
    const manifesto = document.querySelector("#manifesto > div");
    const footer = document.querySelector("footer");
    const sy = window.scrollY;
    const hr = hero.getBoundingClientRect();
    const mr = manifesto.getBoundingClientRect();
    const fr = footer.getBoundingClientRect();
    return {
      vh,
      scrollY: sy,
      hero: {
        topDoc: sy + hr.top,
        bottomDoc: sy + hr.bottom,
        height: hr.height,
      },
      manifesto: {
        topDoc: sy + mr.top,
        bottomDoc: sy + mr.bottom,
        height: mr.height,
      },
      footer: {
        topDoc: sy + fr.top,
        bottomDoc: sy + fr.bottom,
        height: fr.height,
      },
    };
  });
}

function buildEdgeCheckpoints(geom) {
  const { vh } = geom;
  const margins = [-80, -40, -20, -8, -2, 0, 2, 8, 20, 40, 80];

  const zones = [
    {
      prefix: "hero-bottom",
      desc: "Hero stitch bottom vs viewport bottom (Leonhard→Marc)",
      scrollYs: margins.map((m) =>
        scrollForEdge(geom.hero.bottomDoc, vh + m),
      ),
      progressYs: [
        scrollForEdge(geom.hero.bottomDoc, vh),
        scrollForEdge(geom.hero.bottomDoc, vh * 0.75),
        scrollForEdge(geom.hero.bottomDoc, vh * 0.5),
        scrollForEdge(geom.hero.bottomDoc, vh * 0.25),
        scrollForEdge(geom.hero.bottomDoc, 0),
        scrollForEdge(geom.hero.bottomDoc, -20),
      ],
    },
    {
      prefix: "hero-top",
      desc: "Hero stitch top vs viewport top",
      scrollYs: margins.map((m) => scrollForEdge(geom.hero.topDoc, m)),
    },
    {
      prefix: "manifesto-bottom",
      desc: "Manifesto stitch bottom vs viewport bottom (Marc→Alexandr)",
      scrollYs: margins.map((m) =>
        scrollForEdge(geom.manifesto.bottomDoc, vh + m),
      ),
      progressYs: [
        scrollForEdge(geom.manifesto.bottomDoc, vh),
        scrollForEdge(geom.manifesto.bottomDoc, vh * 0.75),
        scrollForEdge(geom.manifesto.bottomDoc, vh * 0.5),
        scrollForEdge(geom.manifesto.bottomDoc, vh * 0.25),
        scrollForEdge(geom.manifesto.bottomDoc, 0),
        scrollForEdge(geom.manifesto.bottomDoc, -20),
      ],
    },
    {
      prefix: "manifesto-top",
      desc: "Manifesto stitch top vs viewport top",
      scrollYs: margins.map((m) =>
        scrollForEdge(geom.manifesto.topDoc, m),
      ),
    },
    {
      prefix: "footer-bottom",
      desc: "Footer bottom vs viewport bottom (Alexandr→Emmanuel split)",
      scrollYs: margins.map((m) =>
        scrollForEdge(geom.footer.bottomDoc, vh + m),
      ),
      progressYs: [
        scrollForEdge(geom.footer.bottomDoc, vh),
        scrollForEdge(geom.footer.bottomDoc, vh * 0.75),
        scrollForEdge(geom.footer.bottomDoc, vh * 0.5),
        scrollForEdge(geom.footer.bottomDoc, vh * 0.25),
        scrollForEdge(geom.footer.bottomDoc, 0),
        scrollForEdge(geom.footer.bottomDoc, -20),
      ],
    },
    {
      prefix: "footer-top",
      desc: "Footer top vs viewport top",
      scrollYs: margins.map((m) => scrollForEdge(geom.footer.topDoc, m)),
    },
  ];

  const checkpoints = [];
  for (const zone of zones) {
    for (let i = 0; i < zone.scrollYs.length; i++) {
      const m = margins[i];
      checkpoints.push({
        name: `${zone.prefix}_m${m}`,
        scrollY: Math.max(0, zone.scrollYs[i]),
        zone: zone.prefix,
        margin: m,
        desc: zone.desc,
      });
    }
    if (zone.progressYs) {
      const labels = ["cross", "p75", "p50", "p25", "top", "past"];
      zone.progressYs.forEach((y, i) => {
        checkpoints.push({
          name: `${zone.prefix}_${labels[i]}`,
          scrollY: Math.max(0, y),
          zone: zone.prefix,
          label: labels[i],
          desc: zone.desc,
        });
      });
    }
  }
  return checkpoints;
}

/** Record opacity timeline during scroll; flag jumps */
async function scrollPass(page, {
  name,
  startY,
  endY,
  stepPx,
  frameMs,
  sampleEvery = 1,
}) {
  const samples = [];
  await page.evaluate((y) => window.scrollTo(0, y), startY);
  await page.waitForTimeout(200);

  const dir = endY >= startY ? 1 : -1;
  const steps = Math.abs(Math.round((endY - startY) / stepPx));

  for (let i = 0; i <= steps; i++) {
    const y = Math.round(startY + i * stepPx * dir);
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(frameMs);

    if (i % sampleEvery === 0) {
      const state = await galleryState(page);
      const dominant = state.imgs.reduce(
        (a, b) => (b.opacity > a.opacity ? b : a),
        state.imgs[0],
      );
      samples.push({
        i,
        scrollY: y,
        dominant: dominant.name,
        dominantOpacity: dominant.opacity,
        opacities: state.imgs.map((img) => img.opacity),
        heroBottom: state.hero?.bottom,
        manifestoBottom: state.manifesto?.bottom,
        footerBottom: state.footer?.bottom,
      });
    }
  }

  const jumps = [];
  for (let j = 1; j < samples.length; j++) {
    const prev = samples[j - 1];
    const cur = samples[j];
    for (let k = 0; k < cur.opacities.length; k++) {
      const delta = cur.opacities[k] - prev.opacities[k];
      if (Math.abs(delta) > 0.08) {
        jumps.push({
          frame: j,
          scrollY: cur.scrollY,
          img: k,
          delta,
          from: prev.opacities[k],
          to: cur.opacities[k],
        });
      }
    }
    const domSwap =
      prev.dominant !== cur.dominant &&
      prev.dominantOpacity > 0.3 &&
      cur.dominantOpacity > 0.3;
    if (domSwap) {
      jumps.push({
        frame: j,
        scrollY: cur.scrollY,
        type: "dominant_swap",
        from: prev.dominant,
        to: cur.dominant,
      });
    }
  }

  return { name, startY, endY, stepPx, frameMs, samples, jumps, jumpCount: jumps.length };
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: VIEWPORT });
await mkdir(OUT, { recursive: true });

await page.goto(BASE, { waitUntil: "networkidle" });
await page.waitForTimeout(1500);

const geom = await measureGeometry(page);
const checkpoints = buildEdgeCheckpoints(geom);
const maxScroll = await page.evaluate(
  () => document.documentElement.scrollHeight - window.innerHeight,
);

const snapReport = [];

for (const cp of checkpoints) {
  const y = Math.min(cp.scrollY, maxScroll);
  await page.evaluate((yy) => window.scrollTo(0, yy), y);
  await page.waitForTimeout(400);
  const state = await galleryState(page);
  const file = path.join(OUT, `snap_${cp.name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  snapReport.push({ ...cp, scrollY: y, ...state });
}

// Scroll passes through each crossfade zone
const passes = [
  {
    name: "hero-crossfade-slow",
    startY: scrollForEdge(geom.hero.bottomDoc, geom.vh + 120),
    endY: scrollForEdge(geom.hero.bottomDoc, -40),
    stepPx: 8,
    frameMs: 32,
  },
  {
    name: "hero-crossfade-fast",
    startY: scrollForEdge(geom.hero.bottomDoc, geom.vh + 120),
    endY: scrollForEdge(geom.hero.bottomDoc, -40),
    stepPx: 35,
    frameMs: 16,
  },
  {
    name: "hero-crossfade-superfast",
    startY: scrollForEdge(geom.hero.bottomDoc, geom.vh + 120),
    endY: scrollForEdge(geom.hero.bottomDoc, -40),
    stepPx: 80,
    frameMs: 8,
  },
  {
    name: "manifesto-crossfade-slow",
    startY: scrollForEdge(geom.manifesto.bottomDoc, geom.vh + 120),
    endY: scrollForEdge(geom.manifesto.bottomDoc, -40),
    stepPx: 8,
    frameMs: 32,
  },
  {
    name: "manifesto-crossfade-fast",
    startY: scrollForEdge(geom.manifesto.bottomDoc, geom.vh + 120),
    endY: scrollForEdge(geom.manifesto.bottomDoc, -40),
    stepPx: 35,
    frameMs: 16,
  },
  {
    name: "manifesto-crossfade-superfast",
    startY: scrollForEdge(geom.manifesto.bottomDoc, geom.vh + 120),
    endY: scrollForEdge(geom.manifesto.bottomDoc, -40),
    stepPx: 80,
    frameMs: 8,
  },
  {
    name: "footer-split-slow",
    startY: scrollForEdge(geom.footer.bottomDoc, geom.vh + 120),
    endY: scrollForEdge(geom.footer.bottomDoc, -40),
    stepPx: 8,
    frameMs: 32,
  },
  {
    name: "footer-split-fast",
    startY: scrollForEdge(geom.footer.bottomDoc, geom.vh + 120),
    endY: scrollForEdge(geom.footer.bottomDoc, -40),
    stepPx: 35,
    frameMs: 16,
  },
  {
    name: "footer-split-superfast",
    startY: scrollForEdge(geom.footer.bottomDoc, geom.vh + 120),
    endY: scrollForEdge(geom.footer.bottomDoc, -40),
    stepPx: 80,
    frameMs: 8,
  },
];

const passReport = [];
for (const pass of passes) {
  const result = await scrollPass(page, pass);
  passReport.push(result);

  // Screenshot at worst jump if any
  if (result.jumps.length > 0) {
    const worst = result.jumps.reduce((a, b) =>
      Math.abs(b.delta ?? 0.5) > Math.abs(a.delta ?? 0.5) ? b : a,
    );
    await page.evaluate((yy) => window.scrollTo(0, yy), worst.scrollY);
    await page.waitForTimeout(200);
    await page.screenshot({
      path: path.join(OUT, `jump_${pass.name}_${worst.frame}.png`),
      fullPage: false,
    });
  }

  // Key frames from slow pass
  if (pass.name.endsWith("-slow")) {
    const keyFrames = [0, Math.floor(result.samples.length / 4), Math.floor(result.samples.length / 2), Math.floor(3 * result.samples.length / 4), result.samples.length - 1];
    for (const fi of keyFrames) {
      const s = result.samples[fi];
      if (!s) continue;
      await page.evaluate((yy) => window.scrollTo(0, yy), s.scrollY);
      await page.waitForTimeout(200);
      await page.screenshot({
        path: path.join(OUT, `motion_${pass.name}_f${fi}.png`),
        fullPage: false,
      });
    }
  }
}

// Wheel-based super fast (user-like)
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(500);
const wheelSamples = [];
for (let zone of ["hero", "manifesto", "footer"]) {
  const start = zone === "hero"
    ? scrollForEdge(geom.hero.bottomDoc, geom.vh + 100)
    : zone === "manifesto"
      ? scrollForEdge(geom.manifesto.bottomDoc, geom.vh + 100)
      : scrollForEdge(geom.footer.bottomDoc, geom.vh + 100);
  await page.evaluate((y) => window.scrollTo(0, y), Math.max(0, start - 200));
  await page.waitForTimeout(300);
  for (let w = 0; w < 60; w++) {
    await page.mouse.wheel(0, 45);
    await page.waitForTimeout(12);
  }
  const state = await galleryState(page);
  wheelSamples.push({ zone, ...state });
  await page.screenshot({
    path: path.join(OUT, `wheel_${zone}_end.png`),
    fullPage: false,
  });
}

const summary = {
  geom,
  maxScroll,
  snapshotCount: snapReport.length,
  passSummary: passReport.map((p) => ({
    name: p.name,
    samples: p.samples.length,
    jumpCount: p.jumpCount,
    jumps: p.jumps.slice(0, 8),
    opacityRange: {
      leonhard: [Math.min(...p.samples.map((s) => s.opacities[0])), Math.max(...p.samples.map((s) => s.opacities[0]))],
      marc: [Math.min(...p.samples.map((s) => s.opacities[1])), Math.max(...p.samples.map((s) => s.opacities[1]))],
      alexandr: [Math.min(...p.samples.map((s) => s.opacities[2])), Math.max(...p.samples.map((s) => s.opacities[2]))],
      emmanuel: [Math.min(...p.samples.map((s) => s.opacities[3])), Math.max(...p.samples.map((s) => s.opacities[3]))],
    },
  })),
  edgeSnapshots: snapReport.map((s) => ({
    name: s.name,
    margin: s.margin,
    scrollY: s.scrollY,
    heroBottom: s.hero?.bottom,
    manifestoBottom: s.manifesto?.bottom,
    footerBottom: s.footer?.bottom,
    opacities: s.imgs.map((i) => ({ name: i.name, o: i.opacity })),
  })),
  wheelSamples,
};

await writeFile(
  path.join(OUT, "report.json"),
  JSON.stringify(summary, null, 2),
);

await browser.close();
console.log(JSON.stringify(summary.passSummary, null, 2));
