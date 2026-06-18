# phy6.ai

A single-page, ultra-minimal **vision manifesto** for the brand **phy6** —
"Learn everything, waste nothing."

The philosophy: a minimal, modern layout with Renaissance craft only in the
details. Leonardo da Vinci — artist, physicist, polymath — is the brand emblem.
The governing restraint rule is **"if in doubt, omit."**

## What it is

A quiet, scroll-driven landing page:

1. **Hero** — a hand-written `<canvas>` "Leonardo Codex Constellation" drifts
   faintly behind the `phy6` wordmark and the tagline.
2. **Manifesto** — the brand essay, opened by an illuminated drop cap.
3. **Signature lines** — three aphorisms in Cormorant italic, parted by a
   hairline filigree divider.
4. **Email capture** — a single field wired to a Formspree placeholder.
5. **Footer** — wordmark, social links, and the tagline.

## Stack

- **Next.js 16** (App Router, `src/` dir, `@/*` import alias) + **React 19** + **TypeScript**
- **Tailwind CSS v4** (CSS-first config via `@theme` in `globals.css`)
- **[`motion`](https://motion.dev)** (the Framer Motion successor) for text reveals
- Hero animation is a hand-written `<canvas>` — no animation library
- **`lucide-react`** for icons; **`clsx`** + **`tailwind-merge`** for the `cn()` helper; **`class-variance-authority`** available for variants
- Fonts via `next/font/google`: **Cormorant Garamond** (display) + **EB Garamond** (body), both OFL

Deployed as a normal serverless Next.js app on Vercel (no `output: 'export'`),
so an API route remains possible later.

## Run & build

```bash
npm install      # install dependencies
npm run dev      # dev server at http://localhost:3000
npm run build    # production build (passes with zero errors / zero lint errors)
npm run start    # serve the production build
npm run lint     # ESLint
```

## Project structure

```
src/
  app/
    layout.tsx              # fonts, metadata, skip link
    page.tsx                # the single page — all five sections
    globals.css             # design tokens + base styles (Tailwind v4)
  components/
    constellation-canvas.tsx  # animated <canvas> + static SVG fallback
    text-reveal.tsx           # staggered word reveal + scroll reveal
    ornaments.tsx             # filigree divider + golden-spiral flourish
    email-capture.tsx         # Formspree-wired form with success/error states
    site-footer.tsx           # footer with inline brand glyphs
  lib/
    utils.ts                # cn() class merge helper
    motion.ts               # easing curves + reveal variants
brand/
  design-system.md          # full token + typography + spacing reference
  manifesto.md              # the canonical copy
BUILD.md                    # build/deploy notes (stub)
```

## Design system

See [`brand/design-system.md`](brand/design-system.md) for the full reference.
In brief:

- **Palette** — parchment background `#F8F3ED`, ink `#1A1410`, with lapis
  `#1E3A8A`, oxblood `#7C2D29`, gold `#C9A24A`, sepia `#6A4A33` accents. The
  palette is WCAG **AAA** on parchment.
- **Type** — golden-ratio scale (H1 `4.236rem` → small `.875rem`), Cormorant
  Garamond display, EB Garamond body, display letter-spacing `-0.015em`.
- **Spacing** — golden-ratio steps: 6 / 10 / 16 / 26 / 42 / 68 px.
- **Measure** — ~37rem (65–75 characters) for body text.
- **Ornaments** — hairline (0.5px) inline SVG only; one per section maximum;
  none inside body paragraphs; all hidden below 600px.
- **Motion** — `easeOutQuart`, 600–800ms reveals on scroll-in; everything
  honors `prefers-reduced-motion`.

## Accessibility

- Semantic landmarks, a visible-on-focus **skip link**, visible focus rings.
- Animated headline text exposes full text via `aria-label`; decorative spans
  are `aria-hidden`.
- The hero canvas is `aria-hidden`; a static, very faint SVG constellation is
  the no-JS / reduced-motion fallback.
- The email form uses a labelled input and a polite `role="status"` live region.
- Palette contrast is AAA.

## Credit

Component **patterns** (the staggered text-reveal, the scroll-reveal wrapper,
the `cn()` helper, and the easing-curve organization) were studied from and
adapted from
**[build-with-dhiraj/Frontend-Mastery](https://github.com/build-with-dhiraj/Frontend-Mastery)**
(`starter/src/components/dhiraj-ui.tsx`, `starter/src/lib/motion.ts`,
`starter/src/lib/utils.ts`). The patterns were re-themed for the Renaissance
design system here; no code was copied verbatim and none of the reference
project's auth / forms / DB / Radix dependencies were pulled in. At the time of
writing the reference repository did not declare an explicit open-source
license; this project therefore treats it as inspiration/reference only and
re-implements the patterns independently. Replace this note with the upstream
license terms if/when one is published.

## Follow-up before launch

- **Formspree** — `src/components/email-capture.tsx` posts to
  `https://formspree.io/f/REPLACE_ME`. Create a real form and replace the ID.
  Until then the form runs in a safe "demo mode" that never errors the build.
- **Footer links** — X, GitHub, and email hrefs are `#` / `hello@phy6.ai`
  placeholders (marked `TODO`).
- A later agent handles git init and deployment; this tree is intentionally
  un-versioned.
