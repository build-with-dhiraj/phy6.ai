import { TextReveal } from "@/components/text-reveal";
import { cn } from "@/lib/utils";
import { BrandMark } from "./brand-mark";

const WORDMARK_NAME = "phy6";

const variantConfig = {
  hero: {
    as: "h1" as const,
    textClass:
      "font-display text-[clamp(4rem,12vw,8rem)] font-semibold leading-none text-[var(--color-text-primary)]",
    domainClass: "text-[clamp(2.5rem,7vw,5rem)]",
    defaultShowDomain: false,
    animate: true,
  },
  footer: {
    as: "p" as const,
    textClass:
      "font-display text-[clamp(1.618rem,4vw,2rem)] font-semibold tracking-tight text-[var(--color-text-primary)]",
    domainClass: "text-[clamp(1rem,2.5vw,1.35rem)]",
    defaultShowDomain: true,
    animate: false,
  },
} satisfies Record<
  "hero" | "footer",
  {
    as: "h1" | "p";
    textClass: string;
    domainClass: string;
    defaultShowDomain: boolean;
    animate: boolean;
  }
>;

export function Wordmark({
  variant = "footer",
  showDomain,
  className,
}: {
  variant?: "hero" | "footer" | "icon-only";
  showDomain?: boolean;
  className?: string;
}) {
  if (variant === "icon-only") {
    return (
      <BrandMark
        size={32}
        className={cn("text-[var(--color-text-primary)]", className)}
        title="phy6"
      />
    );
  }

  const config = variantConfig[variant];
  const domainVisible = showDomain ?? config.defaultShowDomain;

  const domainSuffix = domainVisible ? (
    <span
      className={cn(
        "font-semibold text-[var(--color-text-tertiary)]",
        config.domainClass,
      )}
    >
      .ai
    </span>
  ) : null;

  if (config.animate) {
    return (
      <div className={cn("inline-flex items-baseline gap-0", className)}>
        <TextReveal
          as={config.as}
          text={WORDMARK_NAME}
          className={config.textClass}
        />
        {domainSuffix}
      </div>
    );
  }

  const Tag = config.as;

  return (
    <Tag className={cn(config.textClass, className)}>
      {WORDMARK_NAME}
      {domainSuffix}
    </Tag>
  );
}
