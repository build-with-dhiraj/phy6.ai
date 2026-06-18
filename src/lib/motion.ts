"use client";

import { type Transition, type Variants } from "motion/react";

/**
 * Renaissance motion language: unhurried, hand-crafted.
 * Easing curves adapted from build-with-dhiraj/Frontend-Mastery (starter/src/lib/motion.ts),
 * re-tuned toward a slower, classical feel.
 *
 * `easeOutQuart` is the signature reveal curve for text settling into place.
 */
export const renaissanceEase = {
  // easeOutQuart — text reveals settle gently
  easeOutQuart: [0.25, 1, 0.5, 1],
  // easeInOutSine — for ambient drift (used conceptually in the canvas)
  easeInOutSine: [0.37, 0, 0.63, 1],
} as const;

export const renaissanceTransition = {
  // Section reveals: 600–800ms easeOutQuart
  reveal: { duration: 0.7, ease: renaissanceEase.easeOutQuart },
  word: { duration: 0.8, ease: renaissanceEase.easeOutQuart },
} satisfies Record<string, Transition>;

/** Whole-block reveal as it scrolls into view. */
export const scrollReveal: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: renaissanceTransition.reveal },
};

/** Per-word reveal for staggered headlines. */
export const wordReveal: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: renaissanceTransition.word },
};
