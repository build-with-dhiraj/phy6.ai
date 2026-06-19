/**
 * Full-bleed gallery backdrop frames (crossfade only).
 * Focal points are normalized 0–1 (top-left origin).
 */

export type GalleryFocus = { x: number; y: number };

export type GalleryFrame = {
  src: string;
  alt: string;
  focal: GalleryFocus;
  maxZoomCap?: number;
};

export const GALLERY_FRAMES: GalleryFrame[] = [
  {
    src: "/gallery/leonhard-niederwimmer.jpg",
    alt: "Baroque cathedral nave with golden altar at vanishing point",
    focal: { x: 0.5, y: 0.84 },
    maxZoomCap: 3.0,
  },
  {
    src: "/gallery/marc-olivier-jodoin.jpg",
    alt: "Neo-Gothic basilica interior with cerulean vaulted ceiling",
    focal: { x: 0.5, y: 0.86 },
    maxZoomCap: 3.0,
  },
  {
    src: "/gallery/alexandr-istomin.jpg",
    alt: "Golden dome and arches of a cathedral interior",
    focal: { x: 0.5, y: 0.28 },
    maxZoomCap: 3.2,
  },
  {
    src: "/gallery/emmanuel-cassar.jpg",
    alt: "Galleria Vittorio Emanuele II glass dome and fresco",
    focal: { x: 0.5, y: 0.12 },
    maxZoomCap: 3.2,
  },
];
