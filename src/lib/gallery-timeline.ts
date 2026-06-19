import gsap from "gsap";
import type { GalleryFrame } from "@/data/gallery-frames";
import type { GalleryTransition } from "@/data/gallery-journey";

export const CROSSFADE = 0.12;
export const SEGMENT_DUR = 1;

export function transitionTimelineUnits(transition: GalleryTransition): number {
  return SEGMENT_DUR;
}

export function totalTimelineUnits(transitions: GalleryTransition[]): number {
  return transitions.reduce((sum, t) => sum + transitionTimelineUnits(t), 0);
}

type BuildTimelineArgs = {
  frames: GalleryFrame[];
  transitions: GalleryTransition[];
  imageRefs: HTMLImageElement[];
};

export function buildGalleryTimeline({
  frames,
  transitions,
  imageRefs,
}: BuildTimelineArgs): gsap.core.Timeline {
  const tl = gsap.timeline({ paused: true, defaults: { ease: "power2.out" } });
  let at = 0;

  for (const transition of transitions) {
    if (transition.finale && transition.from === transition.to) {
      const img = imageRefs[transition.from];
      if (img) {
        tl.set(img, { opacity: 1, scale: 1 }, at);
      }
      at += SEGMENT_DUR;
      continue;
    }

    const imgA = imageRefs[transition.from];
    const imgB = imageRefs[transition.to];
    if (!imgA || !imgB) continue;

    tl.set(imgA, { opacity: 1, scale: 1 }, at);

    tl.to(
      imgA,
      {
        opacity: 0,
        duration: CROSSFADE * SEGMENT_DUR,
        ease: "power2.in",
      },
      at,
    );

    tl.fromTo(
      imgB,
      { opacity: 0, scale: 1 },
      {
        opacity: 1,
        scale: 1,
        duration: CROSSFADE * SEGMENT_DUR,
        ease: "power2.out",
      },
      at,
    );

    at += SEGMENT_DUR;
  }

  return tl;
}
