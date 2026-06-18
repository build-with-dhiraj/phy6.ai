import {
  ConstellationCanvas,
  HeroFallback,
} from "@/components/constellation-canvas";
import { EmailCapture } from "@/components/email-capture";
import { FiligreeDivider, GoldenSpiralFlourish } from "@/components/ornaments";
import { SiteFooter } from "@/components/site-footer";
import { ScrollReveal, TextReveal } from "@/components/text-reveal";
import { InkedPlate } from "@/components/ui/inked-plate";

const SIGNATURE_LINES = [
  "Specialization built the modern world. Connection will build the next one.",
  "Start with physics. End everywhere.",
  "A motor and a heartbreak run on the same logic. We'll show you.",
];

export default function Home() {
  return (
    <main>
      {/* ============================================================
          1) HERO :: "The Inked Plate": asymmetric 38/62 golden split.
             Left: wordmark + tagline on bare parchment (type never over the
             image, so contrast stays AAA), with the ambient constellation
             behind it. Right: the developed Renaissance plate. A single
             hairline rule draws itself down the gutter on load. One 100dvh fold.
          ============================================================ */}
      <section
        className="relative grid h-[100dvh] grid-cols-1 grid-rows-[1fr_42dvh] overflow-hidden md:grid-cols-[38fr_62fr] md:grid-rows-1"
        aria-label="Introduction"
      >
        {/* LEFT :: type column on bare parchment */}
        <div className="relative flex flex-col justify-center px-[var(--space-4)] py-[var(--space-5)] md:px-[var(--space-5)]">
          {/* Ambient constellation behind the type. Static SVG fallback + the
              animated canvas on top (canvas hidden under reduced-motion). The
              `ornament` class hides the whole layer below 600px so it never
              crowds the wordmark on phones. */}
          <div className="ornament absolute inset-0 -z-10" aria-hidden="true">
            <HeroFallback />
            <ConstellationCanvas />
          </div>

          <div className="relative flex flex-col items-start text-left">
            <TextReveal
              as="h1"
              text="phy6"
              className="font-display text-[clamp(4rem,12vw,8rem)] font-bold leading-none text-[var(--color-text-primary)]"
            />
            <ScrollReveal
              as="p"
              className="mt-[var(--space-3)] font-display text-[clamp(1.3rem,3.2vw,2rem)] font-medium italic text-[var(--color-text-secondary)]"
            >
              Learn everything, waste nothing.
            </ScrollReveal>
          </div>
        </div>

        {/* GUTTER RULE :: hairline between the columns, drawing itself top to
            bottom on load. Hidden on the mobile stack (where the split is a
            horizontal band, not a vertical gutter). */}
        <div
          className="pointer-events-none absolute inset-y-0 left-[38%] hidden w-px origin-top bg-[var(--color-border)] md:block motion-safe:animate-[gutterdraw_900ms_cubic-bezier(0.16,1,0.3,1)]"
          aria-hidden="true"
        />

        {/* RIGHT :: the developed plate (its own band on the mobile stack). */}
        <div className="relative min-h-0">
          <InkedPlate />
        </div>
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
