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

const LEONHARD_INDEX = 0;
const MARC_INDEX = 1;
const ALEXANDR_INDEX = 2;
const EMMANUEL_INDEX = 3;

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function setGalleryOpacities(
  images: HTMLImageElement[],
  opacities: number[],
) {
  images.forEach((img, i) => {
    gsap.set(img, {
      opacity: opacities[i] ?? 0,
      scale: 1,
      clipPath: "none",
    });
  });
}

/** Crossfade completes over this fraction of viewport height (1 = full vh). */
const STITCH_CROSSFADE_ZONE = 0.5;

/** Crossfade 0→1 while fold bottom moves through the crossfade zone. */
function stitchCrossfadeProgress(bottom: number, viewportHeight: number) {
  if (bottom > viewportHeight) return 0;
  const zone = viewportHeight * STITCH_CROSSFADE_ZONE;
  const endBottom = viewportHeight - zone;
  if (bottom <= endBottom) return 1;
  return clamp01(1 - (bottom - endBottom) / zone);
}

type GalleryJourneyBackdropProps = {
  journeyRef: React.RefObject<HTMLDivElement | null>;
  heroStitchRef: React.RefObject<HTMLDivElement | null>;
  manifestoStitchRef: React.RefObject<HTMLDivElement | null>;
  footerStitchRef: React.RefObject<HTMLElement | null>;
  reducedMotion: boolean;
};

export function GalleryJourneyBackdrop({
  journeyRef,
  heroStitchRef,
  manifestoStitchRef,
  footerStitchRef,
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
    const triggers: ScrollTrigger[] = [];

    const updateProgress = () => {
      if (
        !heroStitchRef.current ||
        !manifestoStitchRef.current ||
        !footerStitchRef.current ||
        !journey
      ) {
        return;
      }

      const images = imageRefs.current.filter(Boolean) as HTMLImageElement[];
      const heroRect = heroStitchRef.current.getBoundingClientRect();
      const manifestoRect = manifestoStitchRef.current.getBoundingClientRect();
      const footerRect = footerStitchRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      const applyHold = (frameIndex: number) => {
        const opacities = images.map((_, i) => (i === frameIndex ? 1 : 0));
        setGalleryOpacities(images, opacities);
        setSegmentIndex((prev) => (prev !== frameIndex ? frameIndex : prev));
      };

      /** Incoming frame fades over full outgoing — avoids parchment wash between layers. */
      const applyLinearCrossfade = (
        fromIdx: number,
        toIdx: number,
        segmentP: number,
      ) => {
        const p = clamp01(segmentP);
        const opacities = images.map((_, i) => {
          if (i === fromIdx) return p >= 1 ? 0 : 1;
          if (i === toIdx) return p;
          return 0;
        });
        setGalleryOpacities(images, opacities);
        const counterFrame = p >= 0.5 ? toIdx : fromIdx;
        setSegmentIndex((prev) =>
          prev !== counterFrame ? counterFrame : prev,
        );
      };

      /** Alexandr above footer; Emmanuel fades in only below footer bottom. */
      const applyFooterSplit = (footerBottom: number) => {
        const segmentP = stitchCrossfadeProgress(
          footerBottom,
          viewportHeight,
        );
        const clipBottom = Math.max(0, footerBottom);

        images.forEach((img, i) => {
          if (i !== ALEXANDR_INDEX && i !== EMMANUEL_INDEX) {
            gsap.set(img, { opacity: 0, scale: 1, clipPath: "none" });
          }
        });

        const alexandr = images[ALEXANDR_INDEX];
        const emmanuel = images[EMMANUEL_INDEX];
        if (alexandr) {
          gsap.set(alexandr, { opacity: 1, scale: 1, clipPath: "none" });
        }
        if (emmanuel) {
          const clipPath =
            segmentP >= 1 || clipBottom <= 0
              ? "none"
              : `inset(${clipBottom}px 0 0 0)`;
          gsap.set(emmanuel, {
            opacity: segmentP,
            scale: 1,
            clipPath,
          });
        }

        const counterFrame =
          segmentP >= 0.5 ? EMMANUEL_INDEX : ALEXANDR_INDEX;
        setSegmentIndex((prev) =>
          prev !== counterFrame ? counterFrame : prev,
        );
      };

      if (heroRect.top > 0) {
        applyHold(LEONHARD_INDEX);
      } else if (heroRect.bottom > viewportHeight) {
        applyHold(LEONHARD_INDEX);
      } else if (heroRect.bottom > 0) {
        const segmentP = stitchCrossfadeProgress(
          heroRect.bottom,
          viewportHeight,
        );
        applyLinearCrossfade(LEONHARD_INDEX, MARC_INDEX, segmentP);
      } else if (manifestoRect.top > 0) {
        applyHold(MARC_INDEX);
      } else if (manifestoRect.bottom > viewportHeight) {
        applyHold(MARC_INDEX);
      } else if (manifestoRect.bottom > 0) {
        const segmentP = stitchCrossfadeProgress(
          manifestoRect.bottom,
          viewportHeight,
        );
        applyLinearCrossfade(MARC_INDEX, ALEXANDR_INDEX, segmentP);
      } else if (footerRect.top > viewportHeight) {
        applyHold(ALEXANDR_INDEX);
      } else if (footerRect.bottom > viewportHeight) {
        applyHold(ALEXANDR_INDEX);
      } else if (footerRect.bottom > 0) {
        applyFooterSplit(footerRect.bottom);
      } else {
        applyHold(EMMANUEL_INDEX);
      }
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
  }, [journeyRef, heroStitchRef, manifestoStitchRef, footerStitchRef, reducedMotion]);

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
