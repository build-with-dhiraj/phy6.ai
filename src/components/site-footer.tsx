import { Mail } from "lucide-react";
import { FiligreeDivider } from "@/components/ornaments";

/**
 * X (Twitter) glyph — lucide dropped its dedicated brand marks, so we inline a
 * minimal one to keep the icon set consistent and hairline-light.
 */
function XGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.65l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
    </svg>
  );
}

/**
 * GitHub glyph — also a brand mark removed from recent lucide; inlined to match.
 */
function GitHubGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 .5C5.37.5 0 5.78 0 12.29c0 5.21 3.44 9.63 8.21 11.19.6.11.82-.25.82-.56v-2.2c-3.34.71-4.04-1.58-4.04-1.58-.55-1.36-1.34-1.72-1.34-1.72-1.09-.73.08-.72.08-.72 1.2.08 1.84 1.21 1.84 1.21 1.07 1.79 2.81 1.27 3.5.97.11-.76.42-1.27.76-1.56-2.67-.3-5.47-1.3-5.47-5.79 0-1.28.47-2.32 1.23-3.14-.12-.3-.53-1.52.12-3.16 0 0 1-.31 3.3 1.2a11.6 11.6 0 0 1 6 0c2.28-1.51 3.29-1.2 3.29-1.2.65 1.64.24 2.86.12 3.16.77.82 1.23 1.86 1.23 3.14 0 4.5-2.81 5.48-5.49 5.77.43.36.81 1.08.81 2.18v3.23c0 .31.21.68.82.56A12.02 12.02 0 0 0 24 12.29C24 5.78 18.63.5 12 .5Z" />
    </svg>
  );
}

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full bg-[var(--color-surface)]">
      <FiligreeDivider />
      <div className="mx-auto flex max-w-[var(--measure)] flex-col items-center px-[var(--space-4)] pb-[var(--space-5)] pt-[var(--space-4)] text-center">
        <p className="font-display text-[clamp(1.618rem,4vw,2rem)] font-semibold tracking-tight text-[var(--color-text-primary)]">
          phy6<span className="text-[var(--color-text-tertiary)]">.ai</span>
        </p>

        <nav aria-label="Social and contact links" className="mt-[var(--space-3)]">
          <ul className="flex items-center justify-center gap-[var(--space-3)]">
            <li>
              <a
                href="https://x.com/dhiraj_pawar_"
                target="_blank"
                rel="me noopener noreferrer"
                aria-label="phy6 on X"
                className="inline-flex h-9 w-9 items-center justify-center rounded-[2px] text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-oxblood)]"
              >
                <XGlyph className="h-[18px] w-[18px]" />
              </a>
            </li>
            <li>
              <a
                href="https://github.com/build-with-dhiraj"
                target="_blank"
                rel="me noopener noreferrer"
                aria-label="phy6 on GitHub"
                className="inline-flex h-9 w-9 items-center justify-center rounded-[2px] text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-oxblood)]"
              >
                <GitHubGlyph className="h-[18px] w-[18px]" />
              </a>
            </li>
            <li>
              <a
                href="mailto:dhiraj@phy6.ai"
                aria-label="Email phy6"
                className="inline-flex h-9 w-9 items-center justify-center rounded-[2px] text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-oxblood)]"
              >
                <Mail className="h-[18px] w-[18px]" aria-hidden="true" />
              </a>
            </li>
          </ul>
        </nav>

        <p className="mt-[var(--space-4)] font-display text-[1.05rem] italic text-[var(--color-text-secondary)]">
          Learn everything, waste nothing.
        </p>
        <p className="mt-[var(--space-1)] font-body text-[var(--text-small)] text-[var(--color-text-tertiary)]">
          © {year} phy6.ai
        </p>
      </div>
    </footer>
  );
}
