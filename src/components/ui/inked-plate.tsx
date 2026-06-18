"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * The image "plate" of the Inked Plate hero (right column, ~62%).
 *
 * - Carries the graded Renaissance capriccio, bleeding to top/right/bottom.
 * - Dissolves into the parchment on its inner edge (gutter-side / left on the
 *   desktop split, top edge on the mobile band) via a gradient mask
 *   (`.inked-plate-mask`), so there is no hard seam against the parchment.
 * - On load it "develops" like ink settling into paper: a faint
 *   parchment-washed low-opacity state resolves to full on a left-to-right
 *   sweep (~900ms, easeOutQuart). This is driven entirely by CSS animations
 *   gated behind `motion-safe`/`motion-reduce` (Tailwind compiles these to
 *   `prefers-reduced-motion` media queries). Because the markup never branches
 *   on a JS reduced-motion hook, SSR and client render identically, with no
 *   hydration mismatch. The elements' resting/default styles ARE the final
 *   developed state, so under reduced motion the plate just shows fully.
 * - Desktop (fine-pointer, motion-safe) only: a soft pointer "loupe" lifts
 *   local contrast/opacity under the cursor. Driven by CSS custom properties
 *   updated on pointermove, never React state per frame. The listener is
 *   attached only after mount, only on fine pointers, and never under reduced
 *   motion, so it cannot affect hydration.
 *
 * The image is the LCP element: served via next/image with `priority`, a
 * correct `sizes`, and a parchment-toned blur placeholder. No runtime-expensive
 * CSS filters sit on the LCP path.
 */

// Parchment-toned blur placeholder (20px tall, same light grade as the asset).
const BLUR_DATA_URL =
  "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAUABIDASIAAhEBAxEB/8QAGAABAAMBAAAAAAAAAAAAAAAAAAEDBAX/xAAeEAACAgMAAwEAAAAAAAAAAAAAAQIDBBESBRQhMf/EABcBAAMBAAAAAAAAAAAAAAAAAAACAwH/xAAYEQEBAAMAAAAAAAAAAAAAAAAAEQECIf/aAAwDAQACEQMRAD8Ar8NgqadnLRHk6pVWcxjtNG7Hs9XFjzJNNfTBkX7nvvbaJY35FI5vEAG/oFaohlXKppTeitXWN76AKQiHZLf6AAD/2Q==";

export function InkedPlate({ className }: { className?: string }) {
  const rootRef = React.useRef<HTMLDivElement | null>(null);

  // Desktop loupe: only on fine pointers (mouse) and when motion is allowed.
  // Updates CSS custom properties directly on pointermove, with no React
  // re-render per frame. Runs only after mount, so it never affects hydration.
  React.useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof window === "undefined") return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    if (reduced || !finePointer) return; // never bind loupe on touch / reduced

    let frame = 0;
    const onMove = (e: PointerEvent) => {
      if (frame) return; // coalesce to one update per animation frame
      frame = requestAnimationFrame(() => {
        frame = 0;
        const rect = el.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        el.style.setProperty("--loupe-x", `${x}%`);
        el.style.setProperty("--loupe-y", `${y}%`);
        el.style.setProperty("--loupe-o", "1");
      });
    };
    const onLeave = () => {
      el.style.setProperty("--loupe-o", "0");
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className={cn(
        "inked-plate-mask relative h-full w-full overflow-hidden",
        className,
      )}
      style={
        {
          // Loupe defaults (so SSR markup + reduced-motion render cleanly).
          ["--loupe-x" as string]: "50%",
          ["--loupe-y" as string]: "50%",
          ["--loupe-o" as string]: "0",
        } as React.CSSProperties
      }
      aria-hidden="true"
    >
      {/* The plate. Resting state = fully developed (opacity 1, no clip). Under
          motion-safe it replays the develop sweep from a parchment-washed,
          left-to-right wipe. Under reduced motion the animation is suppressed
          and it simply shows fully developed. */}
      <div className="absolute inset-0 motion-safe:animate-[platedevelop_900ms_cubic-bezier(0.16,1,0.3,1)]">
        <Image
          src="/hero-plate.jpg"
          alt=""
          fill
          priority
          placeholder="blur"
          blurDataURL={BLUR_DATA_URL}
          sizes="(max-width: 768px) 100vw, 62vw"
          className="object-cover object-center"
        />
      </div>

      {/* Parchment wash that recedes as the plate develops, selling the "ink
          settling into paper" read without touching the LCP image. Resting
          state = fully transparent, so under reduced motion it is invisible;
          motion-safe replays the fade-out. */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 motion-safe:animate-[platewash_900ms_cubic-bezier(0.16,1,0.3,1)]"
        style={{ backgroundColor: "var(--color-bg-parchment)" }}
        aria-hidden="true"
      />

      {/* Loupe: a soft radial that lifts local contrast/opacity under the
          cursor. Pure CSS, driven by --loupe-* custom props. Opacity is 0
          until a fine pointer moves over the plate; the listener is never
          attached on touch or under reduced motion, and the layer is hidden
          under motion-reduce. */}
      <div
        className="pointer-events-none absolute inset-0 mix-blend-overlay motion-reduce:hidden"
        style={{
          opacity: "var(--loupe-o)",
          transition: "opacity 240ms ease-out",
          background:
            "radial-gradient(circle 170px at var(--loupe-x) var(--loupe-y), rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 70%)",
        }}
        aria-hidden="true"
      />
    </div>
  );
}
