import type { ReactNode, SVGProps } from "react";
import { DEFAULT_LOCALE } from "@/config/locales";

interface MarqueeSectionProps {
  locale?: string;
}

const COPY = {
  vi: {
    brand: "OTTER BEER",
    tagline: "HƯƠNG VỊ TÂY NINH, TRẢI NGHIỆM KHÁC BIỆT",
  },
  en: {
    brand: "OTTER BEER",
    tagline: "TASTE OF TAY NINH, A DIFFERENT EXPERIENCE",
  },
} as const;

/** How many times one row's text+icon pair repeats per half of its looping
 *  track. The track renders two identical halves back to back and animates
 *  exactly one half-width of translateX, so the loop is seamless regardless
 *  of viewport width — the count only needs to be high enough that one half
 *  already overflows the widest supported viewport. The brand row's text is
 *  short, so it needs more repeats than the longer tagline row. */
const BRAND_REPEAT = 10;
const TAGLINE_REPEAT = 6;

/** Full loop duration per row, in ms. Different speeds (and opposite
 *  directions, set by each MarqueeRow's `direction`) keep the two rows from
 *  ever settling into a synchronized pattern. */
const BRAND_DURATION_MS = 26000;
const TAGLINE_DURATION_MS = 32000;

/** Decorative separators between repeats. Plain geometric shapes authored
 *  for this component, not sourced from any design file — same convention as
 *  src/components/ui/icons.tsx. */
function DropletIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M10 2c3 4.2 6 7.7 6 11a6 6 0 1 1-12 0c0-3.3 3-6.8 6-11Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SparkleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={12}
      height={12}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path d="M10 1c.6 4.8 3.2 7.4 8 8-4.8.6-7.4 3.2-8 8-.6-4.8-3.2-7.4-8-8 4.8-.6 7.4-3.2 8-8Z" />
    </svg>
  );
}

interface MarqueeRowProps {
  text: string;
  repeat: number;
  durationMs: number;
  direction: "left" | "right";
  icon: ReactNode;
  textClassName: string;
}

/** One looping row. The visual, repeating track is `aria-hidden`; a single
 *  `sr-only` copy of the text carries the row's content to assistive tech,
 *  the same "announce once, hide the decorative repeats" pattern used by
 *  HeroSection's live region for its own always-changing visual. */
function MarqueeRow({
  text,
  repeat,
  durationMs,
  direction,
  icon,
  textClassName,
}: MarqueeRowProps) {
  const items = Array.from({ length: repeat * 2 });

  return (
    <div className="marquee-fade-mask overflow-hidden">
      <span className="sr-only">{text}</span>
      <div
        aria-hidden="true"
        data-testid={`marquee-track-${direction}`}
        data-direction={direction}
        className="marquee-track flex w-max shrink-0 items-center"
        style={{ "--marquee-duration": `${durationMs}ms` } as React.CSSProperties}
      >
        {items.map((_, i) => (
          <span
            key={i}
            className={`flex shrink-0 items-center gap-x-3 px-3 sm:gap-x-4 sm:px-4 ${textClassName}`}
          >
            <span className="whitespace-nowrap">{text}</span>
            {icon}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Homepage brand marquee — a diagonal band of two independently looping
 *  rows: a bold brand name scrolling one way, a lighter tagline scrolling
 *  the other. Ported from a Stitch mockup (stitch.withgoogle.com), not a
 *  Figma frame — no exported assets or design tokens were available, so
 *  colors/type reuse the site's existing "Coastal Premium" tokens and the
 *  separator icons are hand-authored (see DropletIcon/SparkleIcon above),
 *  same convention as BrandStorySection's decorative motifs. */
export function MarqueeSection({ locale = DEFAULT_LOCALE }: MarqueeSectionProps) {
  const content = COPY[locale as keyof typeof COPY] ?? COPY.en;

  return (
    <section
      aria-label="Brand Marquee"
      className="relative w-full overflow-hidden bg-surface-container-low py-10 sm:py-14"
    >
      <div className="w-[120%] -translate-x-[8%] -rotate-2 space-y-3 sm:space-y-4">
        <MarqueeRow
          text={content.brand}
          repeat={BRAND_REPEAT}
          durationMs={BRAND_DURATION_MS}
          direction="left"
          icon={<DropletIcon className="text-secondary-fixed-dim" />}
          textClassName="font-display text-2xl font-normal uppercase tracking-tight text-primary sm:text-4xl"
        />
        <MarqueeRow
          text={content.tagline}
          repeat={TAGLINE_REPEAT}
          durationMs={TAGLINE_DURATION_MS}
          direction="right"
          icon={<SparkleIcon className="text-secondary-fixed-dim" />}
          textClassName="font-mono text-sm font-semibold uppercase tracking-widest text-on-surface-variant sm:text-lg"
        />
      </div>
    </section>
  );
}
