"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { GalleryFrame } from "@/data/gallery-frames";
import { computeMaxZoom, focalOrigin } from "@/lib/gallery-zoom";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

const SEGMENT_VH = 1.3;
const HOLD = 0.15;
const DIVE = 0.6;
const HANDOFF = 0.25;
const FINALE_HOLD = 0.15;
const FINALE_DIVE = 0.7;

type ScrollZoomGalleryProps = {
  frames: GalleryFrame[];
  className?: string;
};

function waitForImage(img: HTMLImageElement) {
  if (img.complete && img.naturalWidth > 0) return Promise.resolve();
  return new Promise<void>((resolve) => {
    img.addEventListener("load", () => resolve(), { once: true });
    img.addEventListener("error", () => resolve(), { once: true });
  });
}

export function ScrollZoomGallery({ frames, className }: ScrollZoomGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const imageRefs = useRef<(HTMLImageElement | null)[]>([]);
  const [segmentIndex, setSegmentIndex] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    const pin = pinRef.current;
    if (!container || !pin || frames.length === 0) return;

    let ctx: gsap.Context | null = null;
    let segmentObserver: ScrollTrigger | null = null;

    const setup = async () => {
      const images = imageRefs.current.filter(Boolean) as HTMLImageElement[];
      await Promise.all(images.map(waitForImage));

      const vw = pin.clientWidth;
      const vh = pin.clientHeight;
      const dpr = window.devicePixelRatio || 1;

      const maxZooms = frames.map((frame, i) => {
        const img = imageRefs.current[i];
        const cap = frame.maxZoomCap ?? 3.2;
        if (!img?.naturalWidth) return 2;
        return computeMaxZoom(
          img.naturalWidth,
          img.naturalHeight,
          vw,
          vh,
          dpr,
          cap,
        );
      });

      ctx = gsap.context(() => {
        images.forEach((img, i) => {
          gsap.set(img, {
            opacity: i === 0 ? 1 : 0,
            scale: 1,
            transformOrigin: focalOrigin(frames[i].focal),
            force3D: true,
          });
        });

        const tl = gsap.timeline({
          defaults: { ease: "power2.out" },
        });

        const segmentDur = 1;
        const transitionCount = frames.length - 1;

        for (let i = 0; i < transitionCount; i++) {
          const imgA = imageRefs.current[i];
          const imgB = imageRefs.current[i + 1];
          if (!imgA || !imgB) continue;

          const focal = frames[i].focal;
          const maxZoom = maxZooms[i];
          const origin = focalOrigin(focal);
          const at = i * segmentDur;

          tl.set(imgA, {
            opacity: 1,
            scale: 1,
            transformOrigin: origin,
          }, at);

          tl.to(imgA, {
            scale: maxZoom,
            duration: DIVE * segmentDur,
            ease: "power2.out",
            transformOrigin: origin,
          }, at + HOLD * segmentDur);

          tl.to(
            imgA,
            {
              opacity: 0,
              duration: HANDOFF * segmentDur * 0.55,
              ease: "power2.in",
            },
            at + (HOLD + DIVE) * segmentDur,
          );

          tl.fromTo(
            imgB,
            { opacity: 0, scale: 1 },
            {
              opacity: 1,
              scale: 1,
              duration: HANDOFF * segmentDur * 0.55,
              ease: "power2.out",
              transformOrigin: focalOrigin(frames[i + 1].focal),
            },
            at + (HOLD + DIVE) * segmentDur,
          );
        }

        const lastIdx = frames.length - 1;
        const lastImg = imageRefs.current[lastIdx];
        if (lastImg) {
          const at = transitionCount * segmentDur;
          const focal = frames[lastIdx].focal;
          const maxZoom = maxZooms[lastIdx];
          const origin = focalOrigin(focal);

          tl.set(lastImg, {
            opacity: 1,
            scale: 1,
            transformOrigin: origin,
          }, at);

          tl.to(lastImg, {
            scale: maxZoom,
            duration: FINALE_DIVE * segmentDur,
            ease: "power2.out",
            transformOrigin: origin,
          }, at + FINALE_HOLD * segmentDur);
        }

        const totalDuration = transitionCount * segmentDur + segmentDur;

        ScrollTrigger.create({
          trigger: container,
          start: "top top",
          end: `+=${frames.length * SEGMENT_VH * 100}%`,
          pin: pin,
          scrub: true,
          animation: tl,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        });

        segmentObserver = ScrollTrigger.create({
          trigger: container,
          start: "top top",
          end: `+=${frames.length * SEGMENT_VH * 100}%`,
          onUpdate: (self) => {
            const idx = Math.min(
              Math.floor(self.progress * frames.length),
              frames.length - 1,
            );
            setSegmentIndex((prev) => (prev !== idx ? idx : prev));
          },
        });
      }, container);
    };

    setup();

    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      segmentObserver?.kill();
      ctx?.revert();
    };
  }, [frames]);

  const scrollHeight = `calc(${frames.length * SEGMENT_VH * 100}dvh - 100dvh)`;

  return (
    <div
      ref={containerRef}
      className={cn("relative", className)}
      style={{ height: scrollHeight }}
    >
      <div
        ref={pinRef}
        className="relative h-[100dvh] w-full overflow-hidden bg-[var(--color-bg-parchment)]"
        aria-label="Renaissance architecture gallery"
      >
        <div className="absolute inset-0">
          {frames.map((frame, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={frame.src}
              ref={(el) => {
                imageRefs.current[i] = el;
              }}
              src={frame.src}
              alt={frame.alt}
              className="absolute inset-0 h-full w-full object-cover opacity-0 pointer-events-none will-change-[transform,opacity]"
              style={{
                backfaceVisibility: "hidden",
              }}
              draggable={false}
            />
          ))}
        </div>

        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[var(--color-bg-parchment)]/8 via-transparent to-[var(--color-bg-parchment)]/15"
          aria-hidden="true"
        />

        <div
          className="pointer-events-none absolute bottom-[var(--space-4)] left-[var(--space-4)] font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-text-tertiary)] motion-reduce:hidden"
          aria-hidden="true"
        >
          <span>{String(segmentIndex + 1).padStart(2, "0")}</span>
          <span className="opacity-40"> / </span>
          <span>{String(frames.length).padStart(2, "0")}</span>
        </div>
      </div>
    </div>
  );
}

export function StaticGalleryGrid({
  frames,
}: {
  frames: GalleryFrame[];
}) {
  return (
    <div className="grid grid-cols-1 gap-[var(--space-3)] md:grid-cols-2">
      {frames.map((frame, i) => (
        <div
          key={frame.src}
          className="overflow-hidden rounded-sm border border-[var(--color-border)] bg-[var(--color-surface)]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={frame.src}
            alt={frame.alt}
            className="aspect-[3/2] w-full object-cover"
            loading={i < 2 ? "eager" : "lazy"}
          />
        </div>
      ))}
    </div>
  );
}
