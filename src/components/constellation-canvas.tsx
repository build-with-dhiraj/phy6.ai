"use client";

import * as React from "react";

/**
 * "Leonardo Codex Constellation" — a quiet ambient canvas behind the hero.
 *
 * - 8–12 ink nodes drifting on slow sine paths (sepia + lapis), sfumato glow.
 * - Hairline connecting lines between near nodes, fading by distance.
 * - Occasional faint gold Vitruvian (circle-in-square) / golden-ratio hint,
 *   centered, dissolving over ~3s.
 * - DPR-aware, rAF-driven, pauses on tab-hidden and when off-screen.
 * - Respects prefers-reduced-motion and no-JS: a single static, very faint
 *   constellation is rendered as an SVG fallback (see HeroFallback).
 *
 * Visual weight is intentionally low so the manifesto words dominate.
 */

const SEPIA = "#6A4A33";
const LAPIS = "#1E3A8A";
const GOLD = "#C9A24A";

const NODE_COUNT = 11;
const LINK_DISTANCE = 160;
const MAX_LINKS = 80;
const MOBILE_BREAKPOINT = 600;

type Node = {
  baseX: number; // 0..1 (fraction of width)
  baseY: number; // 0..1 (fraction of height)
  ampX: number; // px
  ampY: number; // px
  speedX: number; // rad/s
  speedY: number;
  phaseX: number;
  phaseY: number;
  radius: number;
  color: string;
};

function createNodes(): Node[] {
  // Deterministic-ish scatter using a small seeded generator so the layout
  // is balanced rather than clumped.
  let seed = 6;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  const nodes: Node[] = [];
  for (let i = 0; i < NODE_COUNT; i++) {
    // Spread across a soft grid then jitter, so nodes never overlap badly.
    const col = i % 4;
    const row = Math.floor(i / 4);
    const baseX = 0.12 + (col / 3) * 0.76 + (rand() - 0.5) * 0.12;
    const baseY = 0.18 + (row / 2.5) * 0.64 + (rand() - 0.5) * 0.12;
    nodes.push({
      baseX: Math.min(0.94, Math.max(0.06, baseX)),
      baseY: Math.min(0.92, Math.max(0.08, baseY)),
      ampX: 10 + rand() * 14, // ~10–24px drift
      ampY: 10 + rand() * 14,
      // 20–40s cycles -> angular speed 2π / period
      speedX: (Math.PI * 2) / (20 + rand() * 20),
      speedY: (Math.PI * 2) / (20 + rand() * 20),
      phaseX: rand() * Math.PI * 2,
      phaseY: rand() * Math.PI * 2,
      radius: 1.6 + rand() * 1.4, // 3–6px diameter
      // Sepia ink dominates; lapis is the rare jewel (≈1 in 4 nodes), echoing
      // the "lapis as rare accent" palette rule.
      color: rand() > 0.74 ? LAPIS : SEPIA,
    });
  }
  return nodes;
}

export function ConstellationCanvas() {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Respect reduced motion: do not animate; the SVG fallback shows instead.
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const nodes = createNodes();

    let width = 0;
    let height = 0;
    let dpr = 1;
    // On narrow viewports the same node radii fill proportionally more of the
    // frame and crowd the wordmark. `compact` quiets the constellation so it
    // stays a whisper behind the text on phones.
    let compact = false;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      compact = width < MOBILE_BREAKPOINT;
      dpr = Math.min(window.devicePixelRatio || 1, 2); // cap DPR for perf
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    let rafId = 0;
    let running = true;
    let onScreen = true;
    let startTime = performance.now();
    let lastVitruvian = -8000; // first hint after ~6s
    const VITRUVIAN_INTERVAL = 12000; // ~every 12s
    const VITRUVIAN_DURATION = 3000;

    const drawVitruvian = (cx: number, cy: number, t: number, progress: number) => {
      // progress 0..1 across the dissolve; opacity rises then falls.
      const fade = Math.sin(progress * Math.PI); // 0 -> 1 -> 0
      const opacity = Math.min(0.3, fade * 0.3);
      if (opacity <= 0.001) return;

      const size = Math.min(width, height) * 0.26;
      const r = size / 2;
      const slowSpin = t * 0.04;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(slowSpin);
      ctx.strokeStyle = GOLD;
      ctx.globalAlpha = opacity;
      ctx.lineWidth = 0.5;
      ctx.lineCap = "round";

      // circle
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();

      // inscribed square (Vitruvian hint)
      ctx.beginPath();
      ctx.rect(-r * 0.92, -r * 0.92, r * 1.84, r * 1.84);
      ctx.stroke();

      // a couple of golden-ratio diagonals
      ctx.globalAlpha = opacity * 0.7;
      ctx.beginPath();
      ctx.moveTo(-r, 0);
      ctx.lineTo(r, 0);
      ctx.moveTo(0, -r);
      ctx.lineTo(0, r);
      ctx.stroke();

      ctx.restore();
      ctx.globalAlpha = 1;
    };

    const render = (now: number) => {
      if (!running) return;
      const t = (now - startTime) / 1000; // seconds

      ctx.clearRect(0, 0, width, height);

      // Compute current node positions
      const pts = nodes.map((n) => ({
        x: n.baseX * width + Math.sin(t * n.speedX + n.phaseX) * n.ampX,
        y: n.baseY * height + Math.sin(t * n.speedY + n.phaseY) * n.ampY,
        r: n.radius,
        color: n.color,
      }));

      // Occasional Vitruvian / golden hint, centered
      if (now - lastVitruvian > VITRUVIAN_INTERVAL) {
        lastVitruvian = now;
      }
      const sinceVitruvian = now - lastVitruvian;
      if (sinceVitruvian < VITRUVIAN_DURATION) {
        drawVitruvian(width / 2, height / 2, t, sinceVitruvian / VITRUVIAN_DURATION);
      }

      // Connecting lines (hairline, fade by distance), capped for perf
      let linkCount = 0;
      ctx.lineWidth = 0.5;
      for (let i = 0; i < pts.length && linkCount < MAX_LINKS; i++) {
        for (let j = i + 1; j < pts.length && linkCount < MAX_LINKS; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const dist = Math.hypot(dx, dy);
          if (dist < LINK_DISTANCE) {
            const fade = 1 - dist / LINK_DISTANCE;
            ctx.strokeStyle = pts[i].color === LAPIS ? LAPIS : SEPIA;
            // Hairlines stay barely-there; quieter still on phones.
            ctx.globalAlpha = fade * (compact ? 0.16 : 0.22);
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.stroke();
            linkCount++;
          }
        }
      }
      ctx.globalAlpha = 1;

      // Nodes with soft sfumato glow. Smaller, dimmer, less glow on phones so
      // the constellation never out-shouts the wordmark sitting over it.
      const nodeScale = compact ? 0.7 : 1;
      const nodeAlpha = compact ? 0.36 : 0.48;
      const nodeGlow = compact ? 5 : 8;
      for (const p of pts) {
        ctx.save();
        ctx.shadowColor = p.color;
        ctx.shadowBlur = nodeGlow;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = nodeAlpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * nodeScale, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      ctx.globalAlpha = 1;

      rafId = requestAnimationFrame(render);
    };

    const start = () => {
      if (running) return;
      running = true;
      // reset the clock baseline so drift doesn't jump after a pause
      startTime = performance.now() - 0;
      rafId = requestAnimationFrame(render);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(rafId);
    };

    // Pause when tab hidden
    const onVisibility = () => {
      if (document.hidden) {
        stop();
      } else if (onScreen) {
        start();
      }
    };

    // Pause when canvas is off-screen
    const io = new IntersectionObserver(
      (entries) => {
        onScreen = entries[0]?.isIntersecting ?? true;
        if (onScreen && !document.hidden) start();
        else stop();
      },
      { threshold: 0 },
    );
    io.observe(canvas);

    const onResize = () => resize();

    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);

    // kick off
    running = false;
    start();

    return () => {
      stop();
      io.disconnect();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full motion-reduce:hidden"
      aria-hidden="true"
    />
  );
}

/**
 * Static, very faint constellation for reduced-motion + no-JS.
 * Rendered as inline SVG so it appears without JavaScript; the animated
 * <canvas> sits on top and is hidden under prefers-reduced-motion.
 */
export function HeroFallback() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 1000 600"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      {/* 2–3 hairline links */}
      <g stroke={SEPIA} strokeWidth="0.5" opacity="0.16">
        <line x1="210" y1="180" x2="430" y2="250" />
        <line x1="430" y1="250" x2="620" y2="170" />
        <line x1="620" y1="170" x2="780" y2="320" />
      </g>
      {/* a few faint nodes — sepia ink with a single lapis jewel */}
      <g opacity="0.26">
        <circle cx="210" cy="180" r="3" fill={SEPIA} />
        <circle cx="430" cy="250" r="3.5" fill={LAPIS} />
        <circle cx="620" cy="170" r="2.6" fill={SEPIA} />
        <circle cx="780" cy="320" r="3" fill={SEPIA} />
        <circle cx="320" cy="420" r="2.4" fill={SEPIA} />
      </g>
    </svg>
  );
}
