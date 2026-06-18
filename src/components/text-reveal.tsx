"use client";

import * as React from "react";
import { motion, useReducedMotion } from "motion/react";
import { renaissanceTransition, scrollReveal, wordReveal } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Staggered per-word headline reveal.
 * Pattern adapted from build-with-dhiraj/Frontend-Mastery (DhirajTextReveal),
 * re-tuned to easeOutQuart and a slower, classical cadence.
 *
 * Accessibility: the full text is exposed via aria-label; the animated words
 * are aria-hidden. Honors prefers-reduced-motion (renders plainly).
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
  const reduceMotion = useReducedMotion();
  const words = text.split(" ");

  if (reduceMotion) {
    return <Tag className={className}>{text}</Tag>;
  }

  return (
    <Tag className={cn("overflow-hidden", className)} aria-label={text} data-reveal>
      <span aria-hidden="true" className="inline-flex flex-wrap justify-center gap-x-[0.28em]">
        {words.map((word, index) => (
          <span key={`${word}-${index}`} className="inline-block overflow-hidden pb-[0.08em]">
            <motion.span
              data-reveal
              variants={wordReveal}
              initial="hidden"
              animate="visible"
              transition={{
                ...renaissanceTransition.word,
                delay: startDelay + index * delayStep,
              }}
              className="inline-block"
            >
              {word}
            </motion.span>
          </span>
        ))}
      </span>
    </Tag>
  );
}

/**
 * Whole-block reveal as the element scrolls into view.
 * Pattern adapted from Frontend-Mastery (DhirajScrollReveal).
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
  const reduceMotion = useReducedMotion();
  const MotionTag = motion[Tag];

  if (reduceMotion) {
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <MotionTag
      data-reveal
      variants={scrollReveal}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.4 }}
      className={className}
    >
      {children}
    </MotionTag>
  );
}
