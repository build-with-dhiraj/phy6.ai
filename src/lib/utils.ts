import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind class names with conflict resolution.
 * Pattern adapted from build-with-dhiraj/Frontend-Mastery (starter/src/lib/utils.ts).
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
