import { cn } from "@/lib/utils";

/**
 * Renaissance ornament kit. All hairline (0.5px) inline SVG, fill: none,
 * round caps, colored in lapis / gold / sepia.
 *
 * Restraint rules (enforced by usage, not code):
 *   - ONE ornament per section maximum.
 *   - NONE inside body paragraphs.
 *   - Hidden below 600px width via the `.ornament` class (see globals.css).
 */

/**
 * Filigree divider — a thin hairline rule with a small gold concentric-circle
 * motif at its center. Used between sections.
 */
export function FiligreeDivider({ className }: { className?: string }) {
  return (
    <div
      className={cn("ornament flex w-full items-center justify-center", className)}
      aria-hidden="true"
    >
      <svg
        width="240"
        height="24"
        viewBox="0 0 240 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="presentation"
      >
        {/* left + right hairline rules */}
        <line
          x1="8"
          y1="12"
          x2="100"
          y2="12"
          stroke="var(--color-sepia)"
          strokeWidth="0.5"
          strokeLinecap="round"
          opacity="0.55"
        />
        <line
          x1="140"
          y1="12"
          x2="232"
          y2="12"
          stroke="var(--color-sepia)"
          strokeWidth="0.5"
          strokeLinecap="round"
          opacity="0.55"
        />
        {/* small filigree leaf tips */}
        <path
          d="M100 12 q6 -4 12 0 q-6 4 -12 0"
          stroke="var(--color-sepia)"
          strokeWidth="0.5"
          strokeLinecap="round"
          opacity="0.5"
        />
        <path
          d="M140 12 q-6 -4 -12 0 q6 4 12 0"
          stroke="var(--color-sepia)"
          strokeWidth="0.5"
          strokeLinecap="round"
          opacity="0.5"
        />
        {/* gold concentric-circle motif at center */}
        <circle cx="120" cy="12" r="5.5" stroke="var(--color-gold)" strokeWidth="0.5" />
        <circle cx="120" cy="12" r="2.5" stroke="var(--color-gold)" strokeWidth="0.5" />
        <circle cx="120" cy="12" r="0.6" fill="var(--color-gold)" />
      </svg>
    </div>
  );
}

/**
 * Golden-spiral corner flourish — a single, optional gold spiral hint
 * tucked into a corner. Subtle; one per section at most.
 */
export function GoldenSpiralFlourish({ className }: { className?: string }) {
  return (
    <div className={cn("ornament pointer-events-none", className)} aria-hidden="true">
      <svg
        width="84"
        height="84"
        viewBox="0 0 84 84"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="presentation"
      >
        {/* golden-ratio rectangle nest */}
        <rect x="2" y="2" width="80" height="80" stroke="var(--color-gold)" strokeWidth="0.5" opacity="0.45" />
        <rect x="32.6" y="2" width="49.4" height="49.4" stroke="var(--color-gold)" strokeWidth="0.5" opacity="0.35" />
        {/* spiral arcs (quarter-circle per golden square) */}
        <path
          d="M2 51.4 A49.4 49.4 0 0 1 51.4 2"
          stroke="var(--color-gold)"
          strokeWidth="0.5"
          strokeLinecap="round"
          opacity="0.7"
        />
        <path
          d="M51.4 2 A30.6 30.6 0 0 1 82 32.6"
          stroke="var(--color-gold)"
          strokeWidth="0.5"
          strokeLinecap="round"
          opacity="0.7"
        />
        <path
          d="M82 32.6 A18.8 18.8 0 0 1 63.2 51.4"
          stroke="var(--color-gold)"
          strokeWidth="0.5"
          strokeLinecap="round"
          opacity="0.7"
        />
      </svg>
    </div>
  );
}
