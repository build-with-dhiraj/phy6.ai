"use client";

import { useEffect, useRef, useState } from "react";
import { Wordmark } from "@/components/brand/wordmark";
import { EmailCapture } from "@/components/email-capture";
import {
  GalleryJourneyBackdrop,
  GallerySpacer,
} from "@/components/gallery-journey-backdrop";
import { FiligreeDivider, GoldenSpiralFlourish } from "@/components/ornaments";
import { SiteFooter } from "@/components/site-footer";
import { ScrollReveal } from "@/components/text-reveal";
import { InkedPlate } from "@/components/ui/inked-plate";
import { StaticGalleryGrid } from "@/components/ui/scroll-zoom-gallery";
import {
  ConstellationCanvas,
  HeroFallback,
} from "@/components/constellation-canvas";
import { GALLERY_FRAMES } from "@/data/gallery-frames";
import {
  LANDING_JOURNEY,
  type JourneyGalleryBlock,
} from "@/data/gallery-journey";

const SIGNATURE_LINES = [
  "Specialization built the modern world. Connection will build the next one.",
];

function JourneyContent({
  block,
  heroStitchRef,
  manifestoStitchRef,
  footerStitchRef,
}: {
  block: { type: string };
  heroStitchRef?: React.RefObject<HTMLDivElement | null>;
  manifestoStitchRef?: React.RefObject<HTMLDivElement | null>;
  footerStitchRef?: React.RefObject<HTMLElement | null>;
}) {
  if (block.type === "hero") {
    return (
      <section
        className="relative bg-[var(--color-bg-parchment)]"
        aria-label="Introduction"
      >
        <div
          ref={heroStitchRef}
          className="relative grid h-[100dvh] max-h-[100dvh] grid-cols-1 grid-rows-[1fr_42dvh] overflow-hidden md:grid-cols-[38fr_62fr] md:grid-rows-1"
        >
        <div className="relative flex flex-col justify-center px-[var(--space-4)] py-[var(--space-5)] md:px-[var(--space-5)]">
          <div className="ornament absolute inset-0 -z-10" aria-hidden="true">
            <HeroFallback />
            <ConstellationCanvas />
          </div>

          <div className="relative flex flex-col items-start text-left">
            <Wordmark variant="hero" />
            <ScrollReveal
              as="p"
              className="mt-[var(--space-3)] font-display text-[clamp(1.3rem,3.2vw,2rem)] font-medium italic text-[var(--color-text-secondary)]"
            >
              Learn everything, waste nothing.
            </ScrollReveal>
          </div>
        </div>

        <div
          className="pointer-events-none absolute inset-y-0 left-[38%] hidden w-px origin-top bg-[var(--color-border)] md:block motion-safe:animate-[gutterdraw_900ms_cubic-bezier(0.16,1,0.3,1)]"
          aria-hidden="true"
        />

        <div className="relative min-h-0">
          <InkedPlate priority loupe />
        </div>
        </div>
      </section>
    );
  }

  if (block.type === "manifesto") {
    return (
      <section
        id="manifesto"
        className="relative isolate bg-[var(--color-bg-parchment)]"
        aria-label="Manifesto"
      >
        <div
          ref={manifestoStitchRef}
          className="relative grid h-auto max-h-none grid-cols-1 overflow-hidden md:h-[100dvh] md:max-h-[100dvh] md:grid-cols-[62fr_38fr]"
        >
          <div className="relative h-[42dvh] min-h-0 bg-[var(--color-bg-parchment)] md:h-full">
            <InkedPlate
              src="/manifesto-simon-plate.jpg"
              leading
              mask="leading"
              imageClassName="object-top"
              sizes="(max-width: 768px) 100vw, 62vw"
            />
          </div>

          <div
            className="pointer-events-none absolute inset-y-0 left-[62%] hidden w-px bg-[var(--color-border)] md:block"
            aria-hidden="true"
          />

          <div
            className="relative flex min-h-0 flex-col overflow-hidden bg-[var(--color-bg-parchment)] px-[var(--space-4)] py-[var(--space-6)] md:h-full md:px-[var(--space-4)] md:py-[var(--space-5)] md:pr-[var(--space-5)]"
          >
            <GoldenSpiralFlourish
              className="pointer-events-none absolute left-[var(--space-3)] top-[var(--space-5)] opacity-70 md:left-[var(--space-4)]"
            />

            <div
              className="flex min-h-0 flex-1 flex-col justify-center gap-[var(--space-3)] overflow-hidden"
            >
              <div className="max-w-[var(--measure)] space-y-[var(--space-3)] md:space-y-[var(--space-2)]">
            <ScrollReveal>
              <p className="drop-cap font-body text-[var(--text-body)] leading-[1.6] text-[var(--color-text-primary)] md:text-[0.9375rem] md:leading-[1.55]">
                For five hundred years we were told to specialize. Pick a lane.
                Learn the thing that pays. Somewhere in that trade we lost the
                Renaissance mind, the one that saw no wall between physics and
                philosophy, between art and engineering, between the head and the
                heart.
              </p>
            </ScrollReveal>

            <ScrollReveal>
              <p className="font-body text-[var(--text-body)] leading-[1.6] text-[var(--color-text-primary)] md:text-[0.9375rem] md:leading-[1.55]">
                phy6 exists to bring it back.
              </p>
            </ScrollReveal>

            <ScrollReveal>
              <p className="font-body text-[var(--text-body)] leading-[1.6] text-[var(--color-text-primary)] md:text-[0.9375rem] md:leading-[1.55]">
                Every hard idea in the universe is built from a handful of
                simple, beautiful first principles. Learn those, and nothing is
                off-limits to you. A motor and a moral dilemma run on the same
                logic. A falling apple and a falling empire rhyme. We&rsquo;ll
                show you both.
              </p>
            </ScrollReveal>

            <ScrollReveal>
              <p className="font-body text-[var(--text-body)] leading-[1.6] text-[var(--color-text-primary)] md:text-[0.9375rem] md:leading-[1.55]">
                We&rsquo;re not here to hand you a certificate. We want to make
                you formidable: curious, hard to fool, fluent across the whole map
                of human knowledge. Because in an age where AI can answer anything,
                the rare thing is a human who can connect everything.
              </p>
            </ScrollReveal>

            <ScrollReveal>
              <p className="font-body text-[var(--text-body)] leading-[1.6] text-[var(--color-text-primary)] md:text-[0.9375rem] md:leading-[1.55]">
                So learn for the love of it. And stop calling it wasted time. You
                were never wasting time. You were becoming.
              </p>
            </ScrollReveal>
              </div>

              <div
                className="mt-[var(--space-4)] flex max-w-[var(--measure)] flex-col items-start gap-[var(--space-3)] md:mt-[var(--space-3)] md:gap-[var(--space-2)]"
                aria-label="Signature lines"
              >
                <FiligreeDivider />
                {SIGNATURE_LINES.map((line, i) => (
                  <div
                    key={line}
                    className="flex w-full flex-col items-start gap-[var(--space-3)]"
                  >
                    {i > 0 ? <FiligreeDivider /> : null}
                    <ScrollReveal as="p" className="text-left">
                      <span className="font-display text-[clamp(1.35rem,3.2vw,1.75rem)] italic leading-[1.25] text-[var(--color-text-secondary)] md:text-[clamp(1.15rem,2.2vw,1.45rem)]">
                        {line}
                      </span>
                    </ScrollReveal>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (block.type === "email") {
    return (
      <section
        className="relative border-t border-[var(--color-border)] bg-[var(--color-surface)] px-[var(--space-4)] py-[var(--space-6)]"
        aria-label="Stay in touch"
      >
        <div className="relative mx-auto flex max-w-[var(--measure)] flex-col items-center gap-[var(--space-3)] text-center">
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
    );
  }

  if (block.type === "footer") {
    return <SiteFooter ref={footerStitchRef} />;
  }

  return null;
}

export function InterleavedLanding() {
  const journeyRef = useRef<HTMLDivElement>(null);
  const heroStitchRef = useRef<HTMLDivElement>(null);
  const manifestoStitchRef = useRef<HTMLDivElement>(null);
  const footerStitchRef = useRef<HTMLElement>(null);
  const spacerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  let galleryBlockIndex = 0;

  return (
    <main ref={journeyRef} className="relative">
      {!reducedMotion ? (
        <GalleryJourneyBackdrop
          journeyRef={journeyRef}
          heroStitchRef={heroStitchRef}
          manifestoStitchRef={manifestoStitchRef}
          footerStitchRef={footerStitchRef}
          reducedMotion={false}
        />
      ) : null}

      <div className="relative z-10">
        {LANDING_JOURNEY.map((block) => {
          if (block.type === "gallery") {
            if (reducedMotion) return null;
            const idx = galleryBlockIndex;
            galleryBlockIndex += 1;
            return (
              <GallerySpacer
                key={`gallery-${idx}`}
                block={block as JourneyGalleryBlock}
                spacerRefs={spacerRefs}
                index={idx}
              />
            );
          }

          if (block.type === "footer") return null;

          if (block.type === "email") {
            return (
              <div key="late-fold">
                <JourneyContent block={block} />
                <JourneyContent
                  block={{ type: "footer" }}
                  footerStitchRef={footerStitchRef}
                />
              </div>
            );
          }

          return (
            <JourneyContent
              key={block.type}
              block={block}
              heroStitchRef={block.type === "hero" ? heroStitchRef : undefined}
              manifestoStitchRef={
                block.type === "manifesto" ? manifestoStitchRef : undefined
              }
            />
          );
        })}

        {reducedMotion ? (
          <section
            className="border-t border-[var(--color-border)] bg-[var(--color-bg-parchment)] px-[var(--space-4)] py-[var(--space-6)]"
            aria-label="Renaissance gallery"
          >
            <StaticGalleryGrid frames={GALLERY_FRAMES} />
          </section>
        ) : null}
      </div>
    </main>
  );
}
