# phy6 — "Renaissance First Principles" Design System

**Philosophy.** A minimal, modern layout with Renaissance craft only in the
details. Leonardo da Vinci — artist, physicist, polymath — is the brand emblem.

**Restraint rule.** *If in doubt, omit.*

These tokens live as CSS custom properties in `src/app/globals.css` and are
exposed to Tailwind v4 utilities via `@theme inline`.

---

## Color

Light / parchment theme. Contrast on the parchment background is WCAG **AAA**.

| Token | Value | Role |
| --- | --- | --- |
| `--color-bg-parchment` | `#F8F3ED` | Page background |
| `--color-surface` | `#FEFDFB` | Raised surfaces (footer, inputs) |
| `--color-border` | `#E8DFD3` | Hairline borders |
| `--color-text-primary` | `#1A1410` | Body & headlines (ink) |
| `--color-text-secondary` | `#4A4035` | Secondary text |
| `--color-text-tertiary` | `#7A6F67` | Tertiary / muted text |
| `--color-lapis` | `#1E3A8A` | Drop cap, focus ring, accent |
| `--color-oxblood` | `#7C2D29` | Button text / hover accent |
| `--color-gold` | `#C9A24A` | Ornament motifs, button border |
| `--color-sepia` | `#6A4A33` | Constellation ink, filigree rules |

---

## Typography

Both families are free / OFL, loaded via `next/font/google`.

- **Display** — **Cormorant Garamond**, weights 400 / 500 / 600 / 700.
- **Body** — **EB Garamond**, weights 400 / 500 / 600, with italics.

Golden-ratio type scale:

| Token | Size | Usage |
| --- | --- | --- |
| `--text-h1` | `4.236rem` | Hero wordmark (clamps down on mobile) |
| `--text-h2` | `2.618rem` | Section headings |
| `--text-h3` | `1.618rem` | Sub-headings / footer wordmark |
| `--text-body` | `1rem` | Body copy |
| `--text-small` | `0.875rem` | Captions, footer notes |

- Body line-height: **1.5** (manifesto paragraphs use 1.6 for breathing room).
- Display letter-spacing: **−0.015em**.
- Body measure (max reading width): **`--measure` = 37rem** (≈ 65–75 chars).

---

## Spacing

Golden-ratio scale (px):

| Token | Value |
| --- | --- |
| `--space-1` | `6px` |
| `--space-2` | `10px` |
| `--space-3` | `16px` |
| `--space-4` | `26px` |
| `--space-5` | `42px` |
| `--space-6` | `68px` |

Layout is mostly centered and classical, with generous whitespace.

---

## Ornament kit

Inline SVG only. Hairline stroke **0.5px**, `fill: none`, round caps, colored in
lapis / gold / sepia.

1. **Illuminated drop cap** — a ~4-line Cormorant 700 capital in lapis on the
   first manifesto paragraph (CSS `::first-letter`).
2. **Filigree divider** — a thin hairline rule with a small gold
   concentric-circle motif at its center, between sections.
3. **Golden-spiral corner flourish** — an optional single gold spiral hint
   (golden-ratio rectangle nest) tucked into a section corner.

**Restraint constraints**

- One ornament per section, maximum.
- No ornaments inside body paragraphs.
- All ornaments hidden below **600px** width (`.ornament` + a
  `@media (max-width: 599px)` rule).

---

## Motion

Unhurried, hand-crafted.

- Text reveals use **`easeOutQuart`** (`cubic-bezier(0.25, 1, 0.5, 1)`),
  **600–800ms**, triggered on scroll-in.
- The hero constellation drifts on slow sine paths (20–40s cycles).
- Everything honors **`prefers-reduced-motion`**: reveals render plainly and the
  canvas is replaced by a static SVG constellation.

---

## Hero animation — "Leonardo Codex Constellation"

A fixed, full-bleed `<canvas>` behind the hero text, low visual weight:

- 8–12 ink nodes (sepia / lapis) drifting slowly, with soft sfumato glow.
- Hairline connecting lines between near nodes (≤160px), opacity ≤0.25, fading
  by distance.
- Every ~12s a faint gold Vitruvian (circle-in-square) / golden-ratio hint
  appears centered and dissolves over ~3s (opacity ≤0.3).
- DPR-aware (capped at 2×), `requestAnimationFrame`-driven, pauses on
  `visibilitychange` and when scrolled off-screen.
- Reduced-motion / no-JS fallback: a single static, very faint constellation
  (a few nodes + 2–3 lines) at low opacity.

---

## Logo & wordmark

**Mark** — Marek2 reclining-curve silhouette (Renaissance figure as a double curve).
Source: `brand/favicon-mark.svg`, inline React: `BrandMark` in `src/components/brand/brand-mark.tsx`.

| Surface | Component | Notes |
| --- | --- | --- |
| Favicon / PWA | `brand/favicon-mark.svg` → `scripts/generate-brand-assets.mjs` | Ink primary stroke, sepia shadow curve; strokes 32 / 18 for 16px legibility |
| Hero wordmark | `Wordmark` variant `hero` | Cormorant semibold, `clamp(4rem,12vw,8rem)`; animated via `TextReveal` |
| Footer wordmark | `Wordmark` variant `footer` | Same weight as hero; shows `.ai` suffix in tertiary |
| OG / social | `public/og-image.png` | Mark + Cormorant `phy6` + italic EB Garamond tagline (generated, not Georgia) |
| Icon-only | `Wordmark` variant `icon-only` | 32px `BrandMark` for future nav / metadata |

**Rules**

- Always use `Wordmark` / `BrandMark` — do not hand-roll `phy6` typography in sections.
- Hero and footer share **font-semibold (600)** and display family; only scale differs.
- `.ai` suffix: tertiary color, optional on hero (`showDomain`), default on footer.
- Mark uses ink on parchment; secondary curve at ~45% opacity sepia in raster assets, `currentColor` at 45% opacity in UI.
