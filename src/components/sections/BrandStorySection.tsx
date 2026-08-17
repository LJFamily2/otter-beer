"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Dancing_Script } from "next/font/google";

const script = Dancing_Script({ subsets: ["latin"], weight: "700" });

interface BrandStorySectionProps {
  locale: string;
}

const COPY = {
  vi: {
    kicker: "CÂU CHUYỆN THƯƠNG HIỆU",
    heading: "Từ Hạt Lúa Mạch Đến Ly Bia",
    prev: "Trang trước",
    next: "Trang sau",
    pageOf: (page: number, total: number) => `Trang ${page} / ${total}`,
  },
  en: {
    kicker: "BRAND STORY",
    heading: "From Grain to Glass",
    prev: "Previous page",
    next: "Next page",
    pageOf: (page: number, total: number) => `Page ${page} of ${total}`,
  },
} as const;

/**
 * TEMPORARY static content — no illustration assets or admin-authored copy
 * exist yet (this component isn't wired to a backend/admin module in this
 * change). Both locales render this same English content for now, same
 * shortcut HeroSection takes for its placeholder beer copy. Swap this out
 * for a real fetch (BrandStoryService.getPublished() or similar) when asked
 * to "connect" the section — nothing else in this file needs to change
 * shape, since each spread already carries the {heading, illustration} /
 * {lines} split that admin-uploaded-image + admin-authored-text content
 * would fill in.
 */
interface BookSpread {
  id: string;
  left: { heading: string; illustration: ReactNode };
  right: { lines: string[] };
}

function useSpreads(): BookSpread[] {
  return useMemo(
    () => [
      {
        id: "kettle",
        left: { heading: "Copper Kettle\nBrewing History", illustration: <CopperKettleIllustration /> },
        right: { lines: ["Mashing", "Boiling", "Fermenting"] },
      },
      {
        id: "hops",
        left: { heading: "Hand-Selected\nHops & Malt", illustration: <HopConeIllustration /> },
        right: { lines: ["Harvesting", "Milling", "Blending"] },
      },
      {
        id: "tank",
        left: { heading: "Patient\nFermentation", illustration: <FermentationTankIllustration /> },
        right: { lines: ["Yeast", "Time", "Otter Beer"] },
      },
    ],
    []
  );
}

/**
 * Homepage "Brand Story" flipbook — an open storybook the visitor pages
 * through via the two arrow controls. Deliberately breaks from the site's
 * "Coastal Premium" design tokens (docs/DESIGN.md) for a warm, illustrated,
 * heritage-brewing mood; every texture/illustration here is original SVG
 * (no source art files exist for this section yet).
 */
export function BrandStorySection({ locale }: BrandStorySectionProps) {
  const copy = COPY[locale as keyof typeof COPY] ?? COPY.en;
  const spreads = useSpreads();
  const [index, setIndex] = useState(0);
  const [flipKey, setFlipKey] = useState(0);
  const [direction, setDirection] = useState<"next" | "prev">("next");

  const isFirst = index === 0;
  const isLast = index === spreads.length - 1;
  const spread = spreads[index];

  function goNext() {
    if (isLast) return;
    setDirection("next");
    setIndex((i) => i + 1);
    setFlipKey((k) => k + 1);
  }

  function goPrev() {
    if (isFirst) return;
    setDirection("prev");
    setIndex((i) => i - 1);
    setFlipKey((k) => k + 1);
  }

  return (
    <section className="relative overflow-hidden bg-[#f6ecd9] px-5 py-24 lg:py-32">
      <BackgroundMotif />

      <div className="relative mx-auto flex max-w-[1100px] flex-col items-center gap-10">
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-xs font-bold tracking-[0.3em] text-[#8a5a2b] uppercase">
            {copy.kicker}
          </p>
          <h2 className="font-display text-[clamp(28px,4vw,44px)] tracking-[0.08em] text-[#4a2c17] uppercase">
            {copy.heading}
          </h2>
        </div>

        <div className="flex w-full items-center justify-center gap-3 sm:gap-6">
          <FlipArrowButton
            direction="prev"
            label={copy.prev}
            disabled={isFirst}
            onClick={goPrev}
          />

          <div
            className="relative w-full max-w-[820px] shrink"
            style={{ perspective: "2400px" }}
          >
            <div className="absolute inset-x-4 -bottom-4 h-8 rounded-full bg-black/25 blur-xl" aria-hidden />

            <div className="relative rounded-2xl bg-[#4a2c17] p-2 shadow-[0_30px_60px_-20px_rgba(29,17,8,0.55)] sm:p-3">
              <div
                key={flipKey}
                className={`relative grid grid-cols-1 gap-px overflow-hidden rounded-xl bg-[#e4d3b0] sm:grid-cols-2 ${
                  direction === "next" ? "animate-page-flip-next" : "animate-page-flip-prev"
                }`}
                style={{ transformStyle: "preserve-3d" }}
                role="group"
                aria-roledescription="page"
                aria-label={copy.pageOf(index + 1, spreads.length)}
              >
                <div className="absolute inset-y-0 left-1/2 hidden w-6 -translate-x-1/2 bg-gradient-to-r from-black/15 via-black/5 to-black/15 sm:block" aria-hidden />

                <div className="relative flex min-h-[360px] flex-col items-center justify-center gap-6 bg-[#f6ecda] px-8 py-10 text-center sm:min-h-[460px]">
                  <PaperGrain />
                  <div className="relative text-[#8a5a2b]">{spread.left.illustration}</div>
                  <h3 className="relative whitespace-pre-line font-display text-xl leading-tight tracking-wide text-[#4a2c17] sm:text-2xl">
                    {spread.left.heading}
                  </h3>
                </div>

                <div className="relative flex min-h-[360px] flex-col items-center justify-center gap-4 bg-[#f6ecda] px-8 py-10 text-center sm:min-h-[460px]">
                  <PaperGrain />
                  <DecorativeCorner className="absolute top-3 left-3" />
                  <DecorativeCorner className="absolute top-3 right-3 -scale-x-100" />
                  <DecorativeCorner className="absolute bottom-3 left-3 -scale-y-100" />
                  <DecorativeCorner className="absolute right-3 bottom-3 -scale-x-100 -scale-y-100" />
                  {spread.right.lines.map((line) => (
                    <p
                      key={line}
                      className={`${script.className} relative text-[clamp(28px,4vw,42px)] leading-tight text-[#4a2c17]`}
                    >
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <FlipArrowButton
            direction="next"
            label={copy.next}
            disabled={isLast}
            onClick={goNext}
          />
        </div>

        <p aria-live="polite" className="text-xs font-medium tracking-[0.2em] text-[#8a5a2b] uppercase">
          {copy.pageOf(index + 1, spreads.length)}
        </p>
      </div>
    </section>
  );
}

function PaperGrain() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.05] mix-blend-multiply"
    >
      <filter id="brand-story-grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#brand-story-grain)" />
    </svg>
  );
}

function BackgroundMotif() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full text-[#8a5a2b] opacity-[0.07]"
    >
      <defs>
        <pattern id="brand-story-motif" width="140" height="140" patternUnits="userSpaceOnUse">
          <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 30c0-8 6-14 14-14s14 6 14 14c0 10-8 16-14 22-6-6-14-12-14-22z" />
            <path d="M100 100c4-10 4-18 0-26M96 82c8-2 14 2 16 8" />
            <path d="M96 78l4-16M100 62l6 4M100 62l-2-6" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#brand-story-motif)" />
    </svg>
  );
}

function DecorativeCorner({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 60 60"
      className={`h-10 w-10 text-[#c9a768] sm:h-12 sm:w-12 ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    >
      <path d="M4 4v20M4 4h20" />
      <path d="M4 4c14 2 22 10 24 24" />
      <circle cx="30" cy="30" r="2" />
    </svg>
  );
}

function CopperKettleIllustration() {
  return (
    <svg viewBox="0 0 160 160" className="h-24 w-24 sm:h-28 sm:w-28" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M40 62c-3 26 6 46 40 46s43-20 40-46" />
      <ellipse cx="80" cy="62" rx="40" ry="12" />
      <path d="M38 66h84" />
      <rect x="34" y="112" width="92" height="10" rx="3" />
      <path d="M72 50V30M88 50V30" />
      <path d="M72 30c0-6 4-8 4-8s4 2 4 8" />
      <path d="M88 30c0-6 4-8 4-8s4 2 4 8" />
      <path d="M112 74c10 2 16 8 16 16s-8 12-16 12" />
      <path d="M96 22c6 2 8 8 4 14M104 12c6 2 8 8 2 14" opacity="0.6" />
    </svg>
  );
}

function HopConeIllustration() {
  return (
    <svg viewBox="0 0 160 160" className="h-24 w-24 sm:h-28 sm:w-28" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M80 20v70" />
      <path d="M80 40c-14-6-24-2-30 8M80 58c14-6 24-2 30 8M80 76c-14-6-24-2-30 8" opacity="0.7" />
      <path d="M80 88c-24 0-38 16-38 38s14 24 38 24 38-2 38-24-14-38-38-38z" />
      <path d="M58 106c6-6 14-8 22-8s16 2 22 8" opacity="0.5" />
      <path d="M56 122c8-4 16-6 24-6s16 2 24 6" opacity="0.5" />
      <path d="M60 138c6-3 13-4 20-4s14 1 20 4" opacity="0.5" />
    </svg>
  );
}

function FermentationTankIllustration() {
  return (
    <svg viewBox="0 0 160 160" className="h-24 w-24 sm:h-28 sm:w-28" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="46" y="28" width="68" height="70" rx="6" />
      <path d="M46 98l34 40 34-40" />
      <path d="M46 46h68" />
      <circle cx="112" cy="62" r="6" />
      <path d="M112 56v-8" />
      <circle cx="70" cy="70" r="3" opacity="0.6" />
      <circle cx="86" cy="82" r="2.5" opacity="0.6" />
      <circle cx="76" cy="90" r="2" opacity="0.6" />
    </svg>
  );
}

function TriangleArrowIcon({ pointing }: { pointing: "left" | "right" }) {
  const path =
    pointing === "right"
      ? "M14 8c1.6 0 3 .5 4 1.4l24 17.6c1.6 1.1 2.6 3 2.6 5s-1 3.9-2.6 5L18 54.6c-1 .7-2.4 1.4-4 1.4-2.8 0-6-2-6-6.4V14.4C8 10 11.2 8 14 8z"
      : "M34 8c-1.6 0-3 .5-4 1.4L6 26.9c-1.6 1.1-2.6 3-2.6 5s1 3.9 2.6 5l24 17.6c1 .7 2.4 1.4 4 1.4 2.8 0 6-2 6-6.4V14.4C40 10 36.8 8 34 8z";
  return (
    <svg viewBox="0 0 48 60" className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden>
      <path d={path} fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function FlipArrowButton({
  direction,
  label,
  disabled,
  onClick,
}: {
  direction: "prev" | "next";
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex h-14 w-14 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#1a1a1a] text-white shadow-md transition-transform hover:scale-105 disabled:pointer-events-none disabled:opacity-25 sm:h-16 sm:w-16"
    >
      <TriangleArrowIcon pointing={direction === "next" ? "right" : "left"} />
    </button>
  );
}
