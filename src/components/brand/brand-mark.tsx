import { cn } from "@/lib/utils";

/**
 * Marek2 reclining-curve mark — Renaissance figure silhouette as a double curve.
 * Stroke weights tuned for legibility at favicon sizes (see brand/favicon-mark.svg).
 */
export function BrandMark({
  className,
  size,
  title,
}: {
  className?: string;
  /** Pixel width/height; omit to size via CSS class */
  size?: number;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="32"
        strokeLinecap="round"
        d="M80 360 C120 280 200 200 320 180 C380 170 420 200 440 240"
      />
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="18"
        strokeLinecap="round"
        opacity="0.45"
        d="M100 380 C180 320 280 300 400 320"
      />
    </svg>
  );
}
