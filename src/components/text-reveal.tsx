import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Staggered per-word headline reveal.
 * Pattern adapted from build-with-dhiraj/Frontend-Mastery (DhirajTextReveal),
 * re-tuned to easeOutQuart and a slower, classical cadence.
 *
 * Animation is CSS-only, gated behind `motion-safe` (Tailwind compiles to
 * `prefers-reduced-motion: no-preference`) so SSR and client markup are
 * identical — no hydration mismatch. Resting styles are the final revealed
 * state; under reduced motion the words simply show fully visible.
 *
 * Accessibility: the full text is exposed via aria-label; the animated words
 * are aria-hidden.
 */
export function TextReveal({
  text,
  as: Tag = "h1",
  className,
  delayStep = 0.07,
  startDelay = 0,
}: {
  text: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  className?: string;
  delayStep?: number;
  startDelay?: number;
}) {
  const words = text.split(" ");

  return (
    <Tag className={cn("overflow-hidden", className)} aria-label={text} data-reveal>
      <span aria-hidden="true" className="inline-flex flex-wrap justify-center gap-x-[0.28em]">
        {words.map((word, index) => (
          <span key={`${word}-${index}`} className="inline-block overflow-hidden pb-[0.08em]">
            <span
              data-reveal
              className={cn(
                "inline-block",
                "motion-safe:animate-[wordreveal_800ms_cubic-bezier(0.25,1,0.5,1)_both]",
              )}
              style={{
                animationDelay: `${startDelay + index * delayStep}s`,
              }}
            >
              {word}
            </span>
          </span>
        ))}
      </span>
    </Tag>
  );
}

/**
 * Whole-block reveal as the element scrolls into view.
 * Pattern adapted from Frontend-Mastery (DhirajScrollReveal).
 *
 * Scroll gating uses CSS `animation-timeline: view()` under motion-safe only,
 * so markup never branches on a JS reduced-motion hook.
 */
export function ScrollReveal({
  children,
  className,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section" | "p" | "li";
}) {
  return (
    <Tag data-reveal className={cn("scroll-reveal", className)}>
      {children}
    </Tag>
  );
}
