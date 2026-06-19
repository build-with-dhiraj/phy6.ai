"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Renaissance image "plate" for asymmetric folds (hero + manifesto + vault).
 *
 * - Bleeds to top/right/bottom; dissolves into parchment on the inner edge
 *   via mask modes.
 * - Develops like ink settling into paper under motion-safe CSS.
 * - Optional loupe for the hero LCP plate only.
 */

const BLUR_DATA_URL =
  "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAUABIDASIAAhEBAxEB/8QAGAABAAMBAAAAAAAAAAAAAAAAAAEDBAX/xAAeEAACAgMAAwEAAAAAAAAAAAAAAQIDBBESBRQhMf/EABcBAAMBAAAAAAAAAAAAAAAAAAACAwH/xAAYEQEBAAMAAAAAAAAAAAAAAAAAEQECIf/aAAwDAQACEQMRAD8Ar8NgqadnLRHk6pVWcxjtNG7Hs9XFjzJNNfTBkX7nvvbaJY35FI5vEAG/oFaohlXKppTeitXWN76AKQiHZLf6AAD/2Q==";

type PlateMask = "gutter" | "leading" | "radial";

type InkedPlateProps = {
  className?: string;
  src?: string;
  priority?: boolean;
  sizes?: string;
  loupe?: boolean;
  imageClassName?: string;
  /** Plate sits in the left column; dissolve on the right/gutter edge. */
  leading?: boolean;
  /** Mask mode: gutter (hero), leading (manifesto), radial (vault). */
  mask?: PlateMask;
};

function maskClass(mask: PlateMask, leading: boolean) {
  if (mask === "radial") return "inked-plate-mask-radial";
  if (mask === "leading" || leading) return "inked-plate-mask-leading";
  return "inked-plate-mask";
}

export function InkedPlate({
  className,
  src = "/hero-plate.jpg",
  priority = false,
  sizes = "(max-width: 768px) 100vw, 62vw",
  loupe = false,
  imageClassName,
  leading = false,
  mask,
}: InkedPlateProps) {
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const resolvedMask: PlateMask = mask ?? (leading ? "leading" : "gutter");

  React.useEffect(() => {
    if (!loupe) return;

    const el = rootRef.current;
    if (!el || typeof window === "undefined") return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    if (reduced || !finePointer) return;

    let frame = 0;
    const onMove = (e: PointerEvent) => {
      if (frame) return;
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
  }, [loupe]);

  return (
    <div
      ref={rootRef}
      className={cn(
        maskClass(resolvedMask, leading),
        "relative h-full w-full overflow-hidden",
        className,
      )}
      style={
        {
          ["--loupe-x" as string]: "50%",
          ["--loupe-y" as string]: "50%",
          ["--loupe-o" as string]: "0",
        } as React.CSSProperties
      }
      aria-hidden="true"
    >
      <div className="absolute inset-0 motion-safe:animate-[platedevelop_900ms_cubic-bezier(0.16,1,0.3,1)]">
        <Image
          src={src}
          alt=""
          fill
          priority={priority}
          unoptimized={!priority}
          placeholder={priority ? "blur" : "empty"}
          blurDataURL={priority ? BLUR_DATA_URL : undefined}
          sizes={sizes}
          className={cn("object-cover object-center", imageClassName)}
        />
      </div>

      <div
        className="pointer-events-none absolute inset-0 opacity-0 motion-safe:animate-[platewash_900ms_cubic-bezier(0.16,1,0.3,1)]"
        style={{ backgroundColor: "var(--color-bg-parchment)" }}
        aria-hidden="true"
      />

      {loupe ? (
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
      ) : null}
    </div>
  );
}
