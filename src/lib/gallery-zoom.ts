const MIN_MAX_ZOOM = 1.45;
const DEFAULT_MAX_ZOOM_CAP = 3.2;
const PIXEL_SAFETY = 0.88;

/**
 * Max CSS scale before the focal crop exceeds native image resolution on screen.
 * object-cover baseline is included so we never upscale past 1 native px per device px.
 */
export function computeMaxZoom(
  naturalWidth: number,
  naturalHeight: number,
  viewportWidth: number,
  viewportHeight: number,
  devicePixelRatio: number,
  cap = DEFAULT_MAX_ZOOM_CAP,
): number {
  if (
    naturalWidth <= 0 ||
    naturalHeight <= 0 ||
    viewportWidth <= 0 ||
    viewportHeight <= 0
  ) {
    return MIN_MAX_ZOOM;
  }

  const coverScale = Math.max(
    viewportWidth / naturalWidth,
    viewportHeight / naturalHeight,
  );

  const resolutionBound =
    Math.min(
      naturalWidth / (viewportWidth * devicePixelRatio),
      naturalHeight / (viewportHeight * devicePixelRatio),
    ) /
    coverScale *
    PIXEL_SAFETY;

  return Math.max(
    MIN_MAX_ZOOM,
    Math.min(cap, resolutionBound),
  );
}

export function focalOrigin(focal: { x: number; y: number }) {
  return `${focal.x * 100}% ${focal.y * 100}%`;
}
