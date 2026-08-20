"use client";

import React, { useState, useRef } from "react";
import { playPageTurn } from "@/lib/utils/pageTurnSound";
import HTMLFlipBook from "react-pageflip";

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

const SPREADS = [
  { title: "Copper Kettle", left: "/images/otter-beer-premium-lager.jpg", right: "/images/contact-hero.jpeg" },
  { title: "Hops & Malt", left: "/images/otter-beer-hero.png", right: "/images/otter-beer-single-3d.png" },
  { title: "Fermentation", left: "/images/otter-beer-single-can.png", right: "/images/otter-beer-premium-lager-transparent.png" },
];

interface PageFlipInstance {
  pageFlip: () => {
    flipNext: () => void;
    flipPrev: () => void;
  };
}

interface PageFlipEvent {
  data: number;
}

// Cast HTMLFlipBook to allow optional props instead of the library's strict required ones
const FlipBook = HTMLFlipBook as unknown as React.ComponentType<
  Partial<Omit<React.ComponentProps<typeof HTMLFlipBook>, "children">> & {
    children: React.ReactNode;
  }
>;

export function BrandStorySection({ locale }: BrandStorySectionProps) {
  const copy = COPY[locale as keyof typeof COPY] ?? COPY.en;
  const [pageIndex, setPageIndex] = useState(0);
  const bookRef = useRef<PageFlipInstance | null>(null);

  // Math.floor(pageIndex / 2) is the current spread (0, 1, 2).
  const isFirst = pageIndex === 0;
  const isLast = pageIndex >= SPREADS.length * 2 - 2; // Can't flip next if we're on the last spread

  function turn(direction: "next" | "prev") {
    if (!bookRef.current) return;
    if (direction === "next" && !isLast) {
      bookRef.current.pageFlip().flipNext();
      playPageTurn();
      const nextIndex = Math.min(pageIndex + 2, SPREADS.length * 2 - 2);
      setPageIndex(nextIndex);
    } else if (direction === "prev" && !isFirst) {
      bookRef.current.pageFlip().flipPrev();
      playPageTurn();
      const prevIndex = Math.max(pageIndex - 2, 0);
      setPageIndex(prevIndex);
    }
  }

  const onPageFlip = (e: PageFlipEvent) => {
    setPageIndex(e.data);
  };

  return (
    <section className="relative overflow-hidden bg-background px-4 py-20 sm:px-6 lg:py-28">

      <div className="relative mx-auto flex max-w-[1120px] flex-col items-center gap-10">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="text-[11px] font-bold tracking-[0.32em] text-primary-container">
            {copy.kicker}
          </span>
          <span aria-hidden className="text-secondary-fixed-dim">
            <FlourishRule />
          </span>
          <h2 className="font-display text-[clamp(26px,4vw,42px)] tracking-[0.08em] text-primary! uppercase">
            {copy.heading}
          </h2>
        </div>

        <div className="flex w-full items-center justify-center sm:gap-6">
          <div className="hidden sm:block">
            <ArrowButton
              direction="prev"
              label={copy.prev}
              disabled={isFirst}
              onClick={() => turn("prev")}
            />
          </div>

          <div className="relative min-w-0 w-full sm:max-w-[1000px]">
            <div
              aria-hidden
              className="absolute inset-x-6 -bottom-4 h-10 rounded-[50%] bg-[#2a0b12]/35 blur-xl"
            />

            <div className="relative mx-auto w-full max-w-[960px] rounded-[8px] bg-primary p-1 shadow-md sm:p-1.5">
              <div
                aria-hidden
                className="absolute inset-y-0.5 left-1/2 w-6 -translate-x-1/2 rounded-full bg-[linear-gradient(to_right,rgba(0,0,0,0.5),rgba(255,255,255,0.08)_42%,rgba(255,255,255,0.12)_50%,rgba(255,255,255,0.08)_58%,rgba(0,0,0,0.5))] sm:inset-y-1"
              />

              <div className="relative w-full aspect-[8/5]">
                <FlipBook
                  width={480}
                  height={600}
                  size="stretch"
                  minWidth={100}
                  maxWidth={480}
                  minHeight={125}
                  maxHeight={600}
                  maxShadowOpacity={0.5}
                  showCover={false}
                  usePortrait={false}
                  mobileScrollSupport={true}
                  onFlip={onPageFlip}
                  className="mx-auto h-full w-full"
                  ref={bookRef}
                >
                  {SPREADS.flatMap((spread, sIndex) => {
                    const isCurrentSpread = Math.floor(pageIndex / 2) === sIndex;
                    return [
                      <PageFace
                        key={`${spread.title}-left`}
                        src={spread.left}
                        title={spread.title}
                        side="left"
                        aria-hidden={!isCurrentSpread}
                      />,
                      <PageFace
                        key={`${spread.title}-right`}
                        src={spread.right}
                        side="right"
                        aria-hidden={!isCurrentSpread}
                      />
                    ];
                  })}
                </FlipBook>
              </div>
            </div>
          </div>

          <div className="hidden sm:block">
            <ArrowButton
              direction="next"
              label={copy.next}
              disabled={isLast}
              onClick={() => turn("next")}
            />
          </div>
        </div>

        <div className="flex w-full items-center justify-between px-2 sm:justify-center">
          <div className="sm:hidden">
            <ArrowButton
              direction="prev"
              label={copy.prev}
              disabled={isFirst}
              onClick={() => turn("prev")}
            />
          </div>
          <p
            aria-live="polite"
            className="text-[11px] font-bold tracking-[0.28em] text-primary-container uppercase"
          >
            {copy.pageOf(Math.floor(pageIndex / 2) + 1, SPREADS.length)}
          </p>
          <div className="sm:hidden">
            <ArrowButton
              direction="next"
              label={copy.next}
              disabled={isLast}
              onClick={() => turn("next")}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

const PageFace = React.forwardRef<HTMLDivElement, {
  side: "left" | "right";
  src: string;
  title?: string;
  "aria-hidden"?: boolean;
}>(({ side, src, title, "aria-hidden": ariaHidden }, ref) => {
  return (
    <div
      ref={ref}
      aria-hidden={ariaHidden}
      className={`relative flex h-full w-full flex-col items-center justify-center bg-background overflow-hidden ${side === "left"
          ? "rounded-l-[4px]"
          : "rounded-r-[4px]"
        }`}
    >
      {title && <h3 className="sr-only">{title}</h3>}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={title}
        className="absolute inset-0 h-full w-full object-cover"
      />

      <PaperGrain />

      <div
        aria-hidden
        className={`pointer-events-none absolute inset-y-1 z-10 w-[11px] opacity-30 bg-[repeating-linear-gradient(to_right,rgba(42,11,18,0.22)_0px,rgba(42,11,18,0.22)_1px,transparent_1px,transparent_3px)] ${side === "left" ? "left-0 rounded-l-[3px]" : "right-0 rounded-r-[3px]"
          }`}
      />

      {/* Book spine gutter shadow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-20"
        style={{
          background: side === "left"
            ? "linear-gradient(to right, transparent 82%, rgba(255,255,255,0.1) 92%, rgba(0,0,0,0.55) 100%)"
            : "linear-gradient(to left, transparent 82%, rgba(255,255,255,0.1) 92%, rgba(0,0,0,0.55) 100%)"
        }}
      />
    </div>
  );
});
PageFace.displayName = "PageFace";

function PaperGrain() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.045] mix-blend-multiply"
    >
      <filter id="brand-story-grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#brand-story-grain)" />
    </svg>
  );
}

function FlourishRule() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 180 14"
      className="h-3 w-36"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
    >
      <path d="M4 7h56" />
      <path d="M120 7h56" />
      <path d="M68 7c6-6 12 6 18 0s12-6 18 0" />
      <circle cx="90" cy="7" r="1.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

function ArrowButton({
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
      className="group relative flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none disabled:pointer-events-none disabled:opacity-20 sm:h-16 sm:w-16"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-7 w-7 fill-current text-primary-container transition-all duration-200 group-hover:scale-125 group-hover:text-primary sm:h-10 sm:w-10"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        {direction === "prev" ? (
          <path d="M 17.5 4.5 L 5.5 12 L 17.5 19.5 L 14.2 12 Z" />
        ) : (
          <path d="M 6.5 4.5 L 18.5 12 L 6.5 19.5 L 9.8 12 Z" />
        )}
      </svg>
    </button>
  );
}
