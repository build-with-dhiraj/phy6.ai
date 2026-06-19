/**
 * Interleaved landing journey: gallery crossfades between content folds.
 * Leonhard holds until hero exits viewport; marc after hero; alexandr after manifesto;
 * emmanuel after footer.
 */

export type GalleryTransition = {
  from: number;
  to: number;
  finale?: boolean;
};

export type JourneyGalleryBlock = {
  type: "gallery";
  transitions: GalleryTransition[];
  /** Scroll beats with no image change (hold current frame). */
  holdBeat?: number;
};

export type JourneyContentBlock = {
  type: "hero" | "manifesto" | "email" | "footer";
};

export type JourneyBlock = JourneyGalleryBlock | JourneyContentBlock;

export const LANDING_JOURNEY: JourneyBlock[] = [
  { type: "gallery", transitions: [], holdBeat: 1 },
  { type: "hero" },
  { type: "gallery", transitions: [{ from: 0, to: 1 }] },
  { type: "manifesto" },
  { type: "gallery", transitions: [{ from: 1, to: 2 }] },
  { type: "email" },
  { type: "footer" },
  {
    type: "gallery",
    transitions: [
      { from: 2, to: 3 },
      { from: 3, to: 3, finale: true },
    ],
  },
];

export function galleryBeatCount(blocks: JourneyBlock[]): number {
  return blocks
    .filter((b): b is JourneyGalleryBlock => b.type === "gallery")
    .reduce(
      (sum, b) => sum + b.transitions.length + (b.holdBeat ?? 0),
      0,
    );
}

export function flattenGalleryTransitions(
  blocks: JourneyBlock[],
): GalleryTransition[] {
  return blocks
    .filter((b): b is JourneyGalleryBlock => b.type === "gallery")
    .flatMap((b) => b.transitions);
}
