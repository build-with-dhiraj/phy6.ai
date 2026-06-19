"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { GALLERY_FRAMES } from "@/data/gallery-frames";
import {
  flattenGalleryTransitions,
  galleryBeatCount,
  LANDING_JOURNEY,
  type JourneyGalleryBlock,
} from "@/data/gallery-journey";
import {
  buildGalleryTimeline,
  CROSSFADE,
  SEGMENT_DUR,
  totalTimelineUnits,
  transitionTimelineUnits,
} from "@/lib/gallery-timeline";

gsap.registerPlugin(ScrollTrigger);

const SEGMENT_VH = 1.3;
const TOTAL_GALLERY_SCROLL_VH = galleryBeatCount(LANDING_JOURNEY) * SEGMENT_VH;

function waitForImage(img: HTMLImageElement) {
  if (img.complete && img.naturalWidth > 0) return Promise.resolve();
  return new Promise<void>((resolve) => {
    img.addEventListener("load", () => resolve(), { once: true });
    img.addEventListener("error", () => resolve(), { once: true });
  });
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

type GalleryJourneyBackdropProps = {
  journeyRef: React.RefObject<HTMLDivElement | null>;
  heroStitchRef: React.RefObject<HTMLDivElement | null>;
  manifestoStitchRef: React.RefObject<HTMLDivElement | null>;
  lateFoldRef: React.RefObject<HTMLDivElement | null>;
  reducedMotion: boolean;
};

function frameIndexFromTime(
  time: number,
  transitions: ReturnType<typeof flattenGalleryTransitions>,
) {
  let at = 0;
  for (const transition of transitions) {
    const unit = transitionTimelineUnits(transition);
    if (time <= at) return transition.from;
    if (time < at + unit) {
      const crossfadeEnd = at + CROSSFADE * SEGMENT_DUR;
      if (time <= at) return transition.from;
      if (time >= crossfadeEnd) return transition.to;
      return transition.to;
    }
    at += unit;
  }
  const last = transitions[transitions.length - 1];
  return last?.to ?? 0;
}

function crossfadeEndTime(
  transitions: ReturnType<typeof flattenGalleryTransitions>,
  transitionIndex: number,
) {
  const atStart = totalTimelineUnits(transitions.slice(0, transitionIndex));
  return atStart + CROSSFADE * SEGMENT_DUR;
}

/** Crossfade 0→1 while fold bottom moves from viewport bottom (vh) to top (0). */
function stitchCrossfadeProgress(bottom: number, viewportHeight: number) {
  if (bottom > viewportHeight) return 0;
  if (bottom <= 0) return 1;
  return clamp01(1 - bottom / viewportHeight);
}

export function GalleryJourneyBackdrop({
  journeyRef,
  heroStitchRef,
  manifestoStitchRef,
  lateFoldRef,
  reducedMotion,
}: GalleryJourneyBackdropProps) {
  const pinRef = useRef<HTMLDivElement>(null);
  const imageRefs = useRef<(HTMLImageElement | null)[]>([]);
  const [segmentIndex, setSegmentIndex] = useState(0);

  useEffect(() => {
    if (reducedMotion) return;

    const journey = journeyRef.current;
    const pin = pinRef.current;
    if (!journey || !pin) return;

    let ctx: gsap.Context | null = null;
    let timeline: gsap.core.Timeline | null = null;
    const triggers: ScrollTrigger[] = [];
    const allTransitions = flattenGalleryTransitions(LANDING_JOURNEY);
    const crossfadeDur = CROSSFADE * SEGMENT_DUR;
    const timeMarcHold = crossfadeEndTime(allTransitions, 0);
    const timeAlexandrHold = crossfadeEndTime(allTransitions, 1);
    const timeEmmanuelHold = crossfadeEndTime(allTransitions, 2);

    const updateProgress = () => {
      if (
        !timeline ||
        !heroStitchRef.current ||
        !manifestoStitchRef.current ||
        !lateFoldRef.current ||
        !journey
      ) {
        return;
      }

      const heroRect = heroStitchRef.current.getBoundingClientRect();
      const manifestoRect = manifestoStitchRef.current.getBoundingClientRect();
      const lateFoldRect = lateFoldRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      let time: number;

      if (heroRect.top > 0) {
        time = 0;
      } else if (heroRect.bottom > viewportHeight) {
        time = 0;
      } else if (heroRect.bottom > 0) {
        const segmentP = stitchCrossfadeProgress(
          heroRect.bottom,
          viewportHeight,
        );
        time = segmentP * crossfadeDur;
      } else if (manifestoRect.top > 0) {
        time = timeMarcHold;
      } else if (manifestoRect.bottom > viewportHeight) {
        time = timeMarcHold;
      } else if (manifestoRect.bottom > 0) {
        const segmentP = stitchCrossfadeProgress(
          manifestoRect.bottom,
          viewportHeight,
        );
        time = 1 + segmentP * crossfadeDur;
      } else if (lateFoldRect.top > 0) {
        time = timeAlexandrHold;
      } else if (lateFoldRect.bottom > viewportHeight) {
        time = timeAlexandrHold;
      } else if (lateFoldRect.bottom > 0) {
        const segmentP = stitchCrossfadeProgress(
          lateFoldRect.bottom,
          viewportHeight,
        );
        time = 2 + segmentP * crossfadeDur;
      } else {
        time = timeEmmanuelHold;
      }

      timeline.time(time);

      const frameIdx = frameIndexFromTime(time, allTransitions);
      setSegmentIndex((prev) => (prev !== frameIdx ? frameIdx : prev));
    };

    const setup = async () => {
      const images = imageRefs.current.filter(Boolean) as HTMLImageElement[];
      await Promise.all(images.map(waitForImage));

      ctx = gsap.context(() => {
        images.forEach((img, i) => {
          gsap.set(img, {
            opacity: i === 0 ? 1 : 0,
            scale: 1,
            force3D: true,
          });
        });

        timeline = buildGalleryTimeline({
          frames: GALLERY_FRAMES,
          transitions: allTransitions,
          imageRefs: images,
        });

        triggers.push(
          ScrollTrigger.create({
            trigger: journey,
            start: "top top",
            end: "bottom bottom",
            pin: pin,
            pinSpacing: false,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onRefresh: () => {
              gsap.set(pin, { width: journey.offsetWidth, left: 0 });
              const spacer = pin.parentElement;
              if (spacer?.classList.contains("pin-spacer")) {
                spacer.style.width = `${journey.offsetWidth}px`;
              }
              updateProgress();
            },
          }),
        );

        triggers.push(
          ScrollTrigger.create({
            trigger: journey,
            start: "top top",
            end: "bottom bottom",
            onUpdate: updateProgress,
          }),
        );
      }, journey);

      ScrollTrigger.refresh();
      gsap.set(pin, { width: journey.offsetWidth, left: 0 });
      const pinSpacer = pin.parentElement;
      if (pinSpacer?.classList.contains("pin-spacer")) {
        pinSpacer.style.width = `${journey.offsetWidth}px`;
      }
      updateProgress();
    };

    setup();

    const onResize = () => {
      ScrollTrigger.refresh();
      updateProgress();
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", updateProgress, { passive: true });

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", updateProgress);
      triggers.forEach((t) => t.kill());
      ctx?.revert();
    };
  }, [journeyRef, heroStitchRef, manifestoStitchRef, lateFoldRef, reducedMotion]);

  return (
    <div
      ref={pinRef}
      className="pointer-events-none absolute left-0 top-0 z-0 h-[100dvh] w-full overflow-hidden bg-[var(--color-bg-parchment)]"
      aria-hidden="true"
    >
      <div className="absolute inset-0">
        {GALLERY_FRAMES.map((frame, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={frame.src}
            ref={(el) => {
              imageRefs.current[i] = el;
            }}
            src={frame.src}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-0 will-change-[opacity]"
            style={{ backfaceVisibility: "hidden" }}
            draggable={false}
          />
        ))}
      </div>

      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[var(--color-bg-parchment)]/8 via-transparent to-[var(--color-bg-parchment)]/15"
        aria-hidden="true"
      />

      <div
        className="pointer-events-none absolute bottom-[var(--space-4)] left-[var(--space-4)] font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-text-tertiary)]"
        aria-hidden="true"
      >
        <span>{String(segmentIndex + 1).padStart(2, "0")}</span>
        <span className="opacity-40"> / </span>
        <span>{String(GALLERY_FRAMES.length).padStart(2, "0")}</span>
      </div>
    </div>
  );
}

export function GallerySpacer({
  block,
  spacerRefs,
  index,
}: {
  block: JourneyGalleryBlock;
  spacerRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
  index: number;
}) {
  const beatUnits =
    block.transitions.reduce(
      (sum, t) => sum + transitionTimelineUnits(t),
      0,
    ) + (block.holdBeat ?? 0);
  const totalUnits = totalTimelineUnits(
    flattenGalleryTransitions(LANDING_JOURNEY),
  );
  const totalBeats = galleryBeatCount(LANDING_JOURNEY);
  const scrollVh = (beatUnits / totalBeats) * TOTAL_GALLERY_SCROLL_VH * 100;

  return (
    <div
      ref={(el) => {
        spacerRefs.current[index] = el;
      }}
      data-gallery-spacer
      className="pointer-events-none"
      style={{ height: `${scrollVh}dvh` }}
      aria-hidden="true"
    />
  );
}
