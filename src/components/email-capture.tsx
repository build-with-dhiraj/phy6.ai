"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Email capture wired to a Formspree placeholder.
 *
 * TODO: Replace REPLACE_ME with the real Formspree form ID before launch.
 *   Create a form at https://formspree.io and paste its endpoint here.
 *   No secret is stored client-side; Formspree endpoints are public by design.
 */
const FORMSPREE_ACTION = "https://formspree.io/f/REPLACE_ME";

type Status = "idle" | "submitting" | "success" | "error";

export function EmailCapture() {
  const [status, setStatus] = React.useState<Status>("idle");
  const [message, setMessage] = React.useState<string>("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    // Guard against the unconfigured placeholder so the demo never hard-errors.
    if (FORMSPREE_ACTION.includes("REPLACE_ME")) {
      setStatus("success");
      setMessage(
        "Thank you. (Demo mode: connect a Formspree endpoint to collect emails for real.)",
      );
      form.reset();
      return;
    }

    setStatus("submitting");
    setMessage("");

    try {
      const response = await fetch(FORMSPREE_ACTION, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });

      if (response.ok) {
        setStatus("success");
        setMessage("Thank you. We'll write when the first lessons are ready.");
        form.reset();
      } else {
        setStatus("error");
        setMessage("Something went wrong. Please try again in a moment.");
      }
    } catch {
      setStatus("error");
      setMessage("We couldn't reach the server. Please try again shortly.");
    }
  };

  const submitting = status === "submitting";

  return (
    <form
      onSubmit={handleSubmit}
      action={FORMSPREE_ACTION}
      method="POST"
      className="mx-auto flex w-full max-w-md flex-col items-center gap-[var(--space-3)]"
      noValidate
    >
      <div className="flex w-full flex-col gap-[var(--space-2)] sm:flex-row">
        <label htmlFor="email" className="sr-only">
          Email address
        </label>
        <input
          id="email"
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className={cn(
            "min-h-11 flex-1 rounded-[2px] border bg-[var(--color-surface)] px-[var(--space-3)]",
            "font-body text-[var(--text-body)] text-[var(--color-text-primary)]",
            "placeholder:text-[var(--color-text-tertiary)]",
            "border-[var(--color-border)] transition-colors",
            "focus:border-[var(--color-lapis)] focus:outline-none",
          )}
        />
        <button
          type="submit"
          disabled={submitting}
          className={cn(
            "inline-flex min-h-11 items-center justify-center gap-2 rounded-[2px] px-[var(--space-4)]",
            "font-body text-[var(--text-body)] font-medium tracking-[0.01em]",
            // Quiet at rest: ink-on-parchment. The accents (oxblood fill, gold
            // hairline) emerge only on hover, keeping gold a rare flourish
            // rather than the loudest frame on a whisper-quiet page.
            "border border-[var(--color-text-secondary)] bg-transparent text-[var(--color-text-primary)]",
            "transition-colors duration-300",
            "hover:border-[var(--color-oxblood)] hover:bg-[var(--color-oxblood)] hover:text-[var(--color-surface)]",
            "focus-visible:outline-2 focus-visible:outline-[var(--color-lapis)]",
            "disabled:cursor-not-allowed disabled:opacity-60",
          )}
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : null}
          {submitting ? "Sending" : "Notify me"}
        </button>
      </div>

      {/* Polite live region for success/error feedback */}
      <p
        role="status"
        aria-live="polite"
        className={cn(
          "min-h-[1.25rem] text-center font-body text-[var(--text-small)]",
          status === "error"
            ? "text-[var(--color-oxblood)]"
            : "text-[var(--color-text-secondary)]",
        )}
      >
        {message}
      </p>
    </form>
  );
}
