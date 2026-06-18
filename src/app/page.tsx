import {
  ConstellationCanvas,
  HeroFallback,
} from "@/components/constellation-canvas";
import { EmailCapture } from "@/components/email-capture";
import { FiligreeDivider, GoldenSpiralFlourish } from "@/components/ornaments";
import { SiteFooter } from "@/components/site-footer";
import { ScrollReveal, TextReveal } from "@/components/text-reveal";

const SIGNATURE_LINES = [
  "Specialization built the modern world. Connection will build the next one.",
  "Start with physics. End everywhere.",
  "A motor and a heartbreak run on the same logic. We'll show you.",
];

export default function Home() {
  return (
    <main>
      {/* ============================================================
          1) HERO — constellation canvas behind the wordmark
          ============================================================ */}
      <section
        className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-[var(--space-4)]"
        aria-label="Introduction"
      >
        {/* Ambient background: static fallback + animated canvas on top.
            Canvas is hidden under prefers-reduced-motion (CSS), leaving the
            faint static SVG. With no JS, only the SVG renders. */}
        <div className="absolute inset-0 -z-10">
          <HeroFallback />
          <ConstellationCanvas />
          {/* gentle parchment vignette so words always stay legible */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at center, transparent 30%, var(--color-bg-parchment) 92%)",
            }}
            aria-hidden="true"
          />
        </div>

        <div className="relative flex flex-col items-center text-center">
          <TextReveal
            as="h1"
            text="phy6"
            className="font-display text-[clamp(4rem,18vw,9rem)] font-bold leading-none text-[var(--color-text-primary)]"
          />
          <ScrollReveal
            as="p"
            className="mt-[var(--space-3)] font-display text-[clamp(1.4rem,4vw,2.2rem)] font-medium italic text-[var(--color-text-secondary)]"
          >
            Learn everything, waste nothing.
          </ScrollReveal>
        </div>

        {/* Quiet scroll cue */}
        <a
          href="#manifesto"
          className="absolute bottom-[var(--space-5)] flex flex-col items-center gap-2 text-[var(--color-text-tertiary)] transition-colors hover:text-[var(--color-text-secondary)]"
          aria-label="Read on: scroll to the manifesto"
        >
          <span className="font-body text-[var(--text-small)] tracking-wide">
            Read on
          </span>
          <svg
            width="16"
            height="22"
            viewBox="0 0 16 22"
            fill="none"
            aria-hidden="true"
            className="motion-safe:animate-[scrollcue_2.4s_ease-in-out_infinite]"
          >
            <path
              d="M8 1 v16 M2 12 l6 6 6-6"
              stroke="currentColor"
              strokeWidth="0.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
      </section>

      {/* ============================================================
          2) MANIFESTO — illuminated drop cap on the first word
          ============================================================ */}
      <section
        id="manifesto"
        className="relative px-[var(--space-4)] pb-[var(--space-5)] pt-[var(--space-6)]"
        aria-label="Manifesto"
      >
        <GoldenSpiralFlourish className="pointer-events-none absolute right-[max(var(--space-5),calc((100vw-var(--measure))/2-104px))] top-[var(--space-6)] opacity-70" />

        <div className="mx-auto max-w-[var(--measure)]">
          <ScrollReveal>
            <p className="drop-cap font-body text-[var(--text-body)] leading-[1.6] text-[var(--color-text-primary)]">
              For five hundred years we were told to specialize. Pick a lane. Learn
              the thing that pays. Somewhere in that trade we lost the Renaissance
              mind, the one that saw no wall between physics and philosophy,
              between art and engineering, between the head and the heart.
            </p>
          </ScrollReveal>

          <ScrollReveal>
            <p className="mt-[var(--space-4)] font-body text-[var(--text-body)] leading-[1.6] text-[var(--color-text-primary)]">
              phy6 exists to bring it back.
            </p>
          </ScrollReveal>

          <ScrollReveal>
            <p className="mt-[var(--space-4)] font-body text-[var(--text-body)] leading-[1.6] text-[var(--color-text-primary)]">
              Every hard idea in the universe is built from a handful of simple,
              beautiful first principles. Learn those, and nothing is off-limits to
              you. A motor and a moral dilemma run on the same logic. A falling
              apple and a falling empire rhyme. We&rsquo;ll show you both.
            </p>
          </ScrollReveal>

          <ScrollReveal>
            <p className="mt-[var(--space-4)] font-body text-[var(--text-body)] leading-[1.6] text-[var(--color-text-primary)]">
              We&rsquo;re not here to hand you a certificate. We want to make you
              formidable: curious, hard to fool, fluent across the whole map of
              human knowledge. Because in an age where AI can answer anything, the
              rare thing is a human who can connect everything.
            </p>
          </ScrollReveal>

          <ScrollReveal>
            <p className="mt-[var(--space-4)] font-body text-[var(--text-body)] leading-[1.6] text-[var(--color-text-primary)]">
              So learn for the love of it. And stop calling it wasted time. You were
              never wasting time. You were becoming.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ============================================================
          3) SIGNATURE LINES — Cormorant italic, divided by filigree
          ============================================================ */}
      <section
        className="px-[var(--space-4)] pb-[var(--space-6)] pt-[var(--space-5)]"
        aria-label="Signature lines"
      >
        <div className="mx-auto flex max-w-[var(--measure)] flex-col items-center gap-[var(--space-5)]">
          {/* Lead-in divider so the shift from prose to aphorism reads as a
              deliberate turn, not an abrupt jump. */}
          <FiligreeDivider />
          {SIGNATURE_LINES.map((line, i) => (
            <div
              key={line}
              className="flex w-full flex-col items-center gap-[var(--space-5)]"
            >
              {i > 0 ? <FiligreeDivider /> : null}
              <ScrollReveal as="p" className="text-center">
                <span className="font-display text-[clamp(1.5rem,3.6vw,2.05rem)] italic leading-[1.3] text-[var(--color-text-secondary)]">
                  {line}
                </span>
              </ScrollReveal>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================
          4) EMAIL CAPTURE
          ============================================================ */}
      <section
        className="border-t border-[var(--color-border)] bg-[var(--color-surface)] px-[var(--space-4)] py-[var(--space-6)]"
        aria-label="Stay in touch"
      >
        <div className="mx-auto flex max-w-[var(--measure)] flex-col items-center gap-[var(--space-3)] text-center">
          <ScrollReveal>
            <h2 className="font-display text-[var(--text-h2)] font-semibold leading-[1.1] text-[var(--color-text-primary)]">
              The first lessons are coming.
            </h2>
          </ScrollReveal>
          <ScrollReveal
            as="p"
            className="max-w-sm font-body italic text-[var(--color-text-tertiary)]"
          >
            Leave an address. We&rsquo;ll write when there&rsquo;s something worth
            learning.
          </ScrollReveal>
          <div className="mt-[var(--space-3)] w-full">
            <EmailCapture />
          </div>
        </div>
      </section>

      {/* ============================================================
          5) FOOTER
          ============================================================ */}
      <SiteFooter />
    </main>
  );
}
