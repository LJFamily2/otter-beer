"use client";

import React, { useState, useRef, type ReactNode } from "react";
import { Great_Vibes, Roboto_Slab } from "next/font/google";
import { playPageTurn } from "@/lib/utils/pageTurnSound";
import HTMLFlipBook from "react-pageflip";

const script = Great_Vibes({ subsets: ["latin"], weight: "400" });
const slab = Roboto_Slab({ subsets: ["latin"], weight: ["700"] });

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

interface BookSpread {
  id: string;
  title: string;
  illustration: ReactNode;
  lines: string[];
}

const PAGES = [
  "/images/otter-beer-premium-lager.jpg",
  "/images/contact-hero.jpeg",
  "/images/otter-beer-hero.png",
  "/images/otter-beer-single-3d.png",
  "/images/otter-beer-single-can.png",
  "/images/otter-beer-premium-lager-transparent.png",
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
  const isLast = pageIndex >= PAGES.length - 2; // Can't flip next if we're on the last spread

  function turn(direction: "next" | "prev") {
    if (!bookRef.current) return;
    if (direction === "next" && !isLast) {
      bookRef.current.pageFlip().flipNext();
      playPageTurn();
    } else if (direction === "prev" && !isFirst) {
      bookRef.current.pageFlip().flipPrev();
      playPageTurn();
    }
  }

  const onPageFlip = (e: PageFlipEvent) => {
    setPageIndex(e.data);
  };

  return (
    <section className="relative overflow-hidden bg-[#f9efd9] px-4 py-20 sm:px-6 lg:py-28">
      <BackgroundMotif />

      <div className="relative mx-auto flex max-w-[1120px] flex-col items-center gap-10">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="text-[11px] font-bold tracking-[0.32em] text-[#a9723f]">
            {copy.kicker}
          </span>
          <span aria-hidden className="text-[#c8a26a]">
            <FlourishRule />
          </span>
          <h2 className="font-display text-[clamp(26px,4vw,42px)] tracking-[0.08em] text-[#4a2c17]! uppercase">
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

            <div className="relative mx-auto w-full max-w-[960px] rounded-[8px] bg-[linear-gradient(180deg,#42121c,#360e16_40%,#2b0a11)] p-1 shadow-[0_30px_60px_-15px_rgba(42,11,18,0.7),inset_0_1px_0_rgba(255,255,255,0.12),0_0_0_1px_rgba(30,8,13,0.9)] sm:p-1.5">
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
                  {PAGES.map((src, index) => (
                    <PageFace key={src} src={src} side={index % 2 === 0 ? "left" : "right"} />
                  ))}
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
            className="text-[11px] font-bold tracking-[0.28em] text-[#a9723f] uppercase"
          >
            {copy.pageOf(Math.floor(pageIndex / 2) + 1, Math.ceil(PAGES.length / 2))}
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
}>(({ side, src }, ref) => {
  const gutterShade =
    side === "left"
      ? "inset -18px 0 22px -18px rgba(42,11,18,0.45)"
      : "inset 18px 0 22px -18px rgba(42,11,18,0.45)";

  return (
    <div
      ref={ref}
      style={{ boxShadow: gutterShade }}
      className={`relative flex h-full w-full flex-col items-center justify-center bg-[#faf6ee] overflow-hidden ${
        side === "left"
          ? "rounded-l-[4px]"
          : "rounded-r-[4px]"
      }`}
    >
      <PaperGrain />
      <div
        aria-hidden
        className={`absolute inset-y-1 z-10 w-[11px] bg-[repeating-linear-gradient(to_right,rgba(42,11,18,0.22)_0px,rgba(42,11,18,0.22)_1px,transparent_1px,transparent_3px)] ${
          side === "left" ? "left-0 rounded-l-[3px]" : "right-0 rounded-r-[3px]"
        }`}
      />
      <img
        src={src}
        alt="Brand Story Page"
        className="absolute inset-0 h-full w-full object-cover"
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

function BackgroundMotif() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full text-[#c9a06a] opacity-[0.22]"
    >
      <defs>
        <pattern id="brand-story-motif" width="230" height="230" patternUnits="userSpaceOnUse">
          <g
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <g transform="translate(18 16)">
              <path d="M16 4v6" />
              <path d="M16 10c-7 0-11 5-11 11s4 14 11 14 11-7 11-14-4-11-11-11z" />
              <path d="M6 18c3-2 6-3 10-3s7 1 10 3M6 25c3-2 6-3 10-3s7 1 10 3M8 31c2-2 5-3 8-3s6 1 8 3" />
              <path d="M16 6c-3-3-7-3-9-1 2 3 6 4 9 1z" />
            </g>
            <g transform="translate(104 12)">
              <path d="M14 52V16" />
              <path d="M14 20c-6-1-9-5-9-10 5 0 9 3 9 8zM14 20c6-1 9-5 9-10-5 0-9 3-9 8z" />
              <path d="M14 30c-6-1-9-5-9-10 5 0 9 3 9 8zM14 30c6-1 9-5 9-10-5 0-9 3-9 8z" />
              <path d="M14 40c-6-1-9-5-9-10 5 0 9 3 9 8zM14 40c6-1 9-5 9-10-5 0-9 3-9 8z" />
              <path d="M14 12c-2-4-1-8 2-10 1 4 0 8-2 10z" />
            </g>
            <g transform="translate(176 20)">
              <path d="M4 14h24v28a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V14z" />
              <path d="M28 20h6a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4h-6" />
              <path d="M4 14c2-6 6-8 12-8s10 2 12 8" />
              <path d="M11 22v18M20 22v18" strokeWidth="1.1" />
            </g>
            <g transform="translate(24 108)">
              <path d="M10 6h28c4 8 4 30 0 38H10c-4-8-4-30 0-38z" />
              <path d="M6 16h36M6 34h36" />
              <path d="M24 6v38" strokeWidth="1.1" />
            </g>
            <g transform="translate(112 104)">
              <path d="M12 4h8v12c8 5 10 10 18v14a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V34c0-8 2-13 10-18V4z" />
              <path d="M2 34h28" strokeWidth="1.1" />
              <path d="M13 2h6" strokeWidth="2.2" />
            </g>
            <g transform="translate(178 112)">
              <path d="M6 16c-2 12 2 22 6 26h20c4-4 8-14 6-26" />
              <ellipse cx="22" cy="16" rx="16" ry="4" />
              <path d="M22 12V2M17 2h10" />
              <path d="M38 20c5 2 6 8 6 14" />
            </g>
            <g transform="translate(66 178)">
              <path d="M6 6h24l-3 34a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4L6 6z" />
              <path d="M7 16h22" strokeWidth="1.1" />
            </g>
            <g transform="translate(150 180)">
              <path d="M4 6h28L21 24v16h-6V24L4 6z" />
              <path d="M4 12h28" strokeWidth="1.1" />
            </g>
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#brand-story-motif)" />
    </svg>
  );
}

function CornerFlourish({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 100 100"
      className={`h-10 w-10 text-[#c19056] sm:h-16 sm:w-16 ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M 8 92 V 30 C 8 18 18 8 30 8 H 92" strokeWidth="1.8" />
      <path d="M 16 92 V 38 C 16 26 26 16 38 16 H 92" strokeWidth="1" opacity="0.6" />
      <path d="M 30 8 C 42 20 20 42 8 30" />
      <path d="M 22 22 C 32 12 45 25 35 35 C 25 45 12 32 22 22 Z" fill="currentColor" fillOpacity="0.15" />
      <path d="M 55 12 C 50 25 65 30 70 20 C 75 10 60 5 55 12 Z" />
      <path d="M 12 55 C 25 50 30 65 20 70 C 10 75 5 60 12 55 Z" />
      <circle cx="35" cy="35" r="2" fill="currentColor" stroke="none" />
      <circle cx="78" cy="14" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="14" cy="78" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TinyFlourish() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 64 12"
      className="h-2 w-12 sm:h-3 sm:w-16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
    >
      <path d="M4 6c8-6 14 6 22 0s14-6 22 0" />
      <circle cx="54" cy="6" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="60" cy="6" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function HopSprig({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 32 44"
      className={`text-[#b5714a] ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 6v6" />
      <path d="M16 12c-7 0-11 5-11 12s4 14 11 14 11-7 11-14-4-12-11-12z" />
      <path d="M6 20c3-2 6-3 10-3s7 1 10 3M5 27c3-2 6-3 11-3s8 1 11 3M8 34c2-2 5-3 8-3s6 1 8 3" />
      <path d="M16 8c-3-4-8-4-11-1 3 4 8 4 11 1z" />
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

function CopperKettleEngraving() {
  return (
    <svg
      viewBox="0 0 200 224"
      className="h-[136px] w-[122px] sm:h-[240px] sm:w-[214px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M26 210h34M68 210h24M100 210h34M142 210h20M168 210h10" strokeWidth="1.8" opacity="0.7" />
      <path d="M38 217h28M76 217h30M116 217h28M152 217h18" strokeWidth="1.4" opacity="0.45" />
      <path d="M48 191h104a5 5 0 0 1 5 5v5a4 4 0 0 1-4 4H47a4 4 0 0 1-4-4v-5a5 5 0 0 1 5-5z" />
      <path d="M52 198h96" strokeWidth="1.4" opacity="0.5" />
      <path d="M42 130c-4 26 5 47 15 59 6 6 60 6 66 0 10-12 19-33 15-59" />
      <ellipse cx="100" cy="130" rx="58" ry="13" />
      <path d="M43 137c14 8 100 8 114 0" strokeWidth="1.8" opacity="0.8" />
      <path d="M50 160c16 9 84 9 100 0" strokeWidth="1.6" opacity="0.6" />
      <path d="M57 126c2-25 18-42 43-42s41 17 43 42" />
      <ellipse cx="100" cy="85" rx="19" ry="5.5" />
      <path d="M90 84V26M110 84V26" />
      <path d="M84 26h32" strokeWidth="3.4" />
      <path d="M87 19h26" strokeWidth="2.6" />
      <ellipse cx="100" cy="15" rx="15" ry="4.5" />
      <path d="M93 84V32M107 84V32" strokeWidth="1.2" opacity="0.4" />
      <path d="M153 123c17 5 23 19 23 35v31" />
      <path d="M162 119c19 7 25 23 25 39v27" opacity="0.85" />
      <path d="M168 205h26" strokeWidth="3" />
      <path d="M134 99l16-11 7 9-14 10" />
      <path d="M157 81c8-5 6-14-2-16M164 63c9-3 8-14 0-17M150 68c6-3 4-12-1-14" strokeWidth="1.8" opacity="0.62" />
      <path d="M53 143c-2 18 2 33 10 45M64 147c-2 17 1 31 8 42M75 150c-2 16 0 29 6 39M86 152c-1 15 0 27 4 36" strokeWidth="1.5" opacity="0.45" />
      <path d="M140 147c2 17-1 31-8 42M130 151c1 15-1 27-5 37" strokeWidth="1.3" opacity="0.3" />
      <path d="M64 116c2-18 11-30 25-34M75 122c2-17 10-28 22-32M86 125c1-16 7-26 16-30" strokeWidth="1.4" opacity="0.4" />
      <circle cx="60" cy="139" r="2" fill="currentColor" stroke="none" opacity="0.75" />
      <circle cx="100" cy="142" r="2" fill="currentColor" stroke="none" opacity="0.75" />
      <circle cx="140" cy="139" r="2" fill="currentColor" stroke="none" opacity="0.75" />
    </svg>
  );
}

function HopBineEngraving() {
  return (
    <svg
      viewBox="0 0 200 224"
      className="h-[136px] w-[122px] sm:h-[240px] sm:w-[214px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M32 210h34M74 210h28M110 210h32M150 210h18" strokeWidth="1.5" opacity="0.6" />
      <path d="M100 206c-6-40-4-78 2-116" />
      <path d="M102 154c-16-4-26-16-24-30M102 118c16-5 25-18 22-32" strokeWidth="1.6" />
      <path d="M78 124c-14-3-22-13-20-24 12-1 21 9 20 24z" />
      <path d="M78 124c-6-8-9-15-9-21" strokeWidth="1.1" opacity="0.5" />
      <path d="M124 86c14-4 22-14 19-25-12 0-20 10-19 25z" />
      <path d="M124 86c5-8 8-15 8-21" strokeWidth="1.1" opacity="0.5" />
      <path d="M104 32c-18 2-28 16-26 34s16 32 30 30 22-18 20-36-8-30-24-28z" />
      <path d="M80 50c7-4 14-6 22-6s15 2 22 5M79 64c7-4 15-6 23-6s15 2 22 6M84 78c6-4 12-6 19-6s13 2 19 5M90 90c5-3 10-4 15-4s10 1 14 4" />
      <path d="M102 34c2 20 4 41 4 62" strokeWidth="1.1" opacity="0.45" />
      <path d="M58 168c-13 1-20 12-19 25s12 23 22 22 16-13 15-26-6-22-18-21z" />
      <path d="M41 181c5-3 10-4 16-4s11 1 16 4M41 191c5-3 11-4 17-4s11 1 15 4M45 201c4-2 8-3 13-3s9 1 12 3" />
      <path d="M148 208V150" />
      <path d="M148 156c-10-2-15-8-15-17 9 0 15 6 15 14zM148 156c10-2 15-8 15-17-9 0-15 6-15 14z" />
      <path d="M148 174c-10-2-15-8-15-17 9 0 15 6 15 14zM148 174c10-2 15-8 15-17-9 0-15 6-15 14z" />
      <path d="M148 146c-3-7-2-14 3-18 2 7 0 14-3 18z" />
    </svg>
  );
}

function FermentationTankEngraving() {
  return (
    <svg
      viewBox="0 0 200 224"
      className="h-[136px] w-[122px] sm:h-[240px] sm:w-[214px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M26 212h34M68 212h26M102 212h34M144 212h22" strokeWidth="1.5" opacity="0.6" />
      <path d="M62 186l-8 22M138 186l8 22" />
      <path d="M52 44h96v112l-48 52-48-52V44z" />
      <ellipse cx="100" cy="44" rx="48" ry="11" />
      <path d="M62 40c4-14 18-22 38-22s34 8 38 22" />
      <ellipse cx="100" cy="18" rx="12" ry="4" />
      <path d="M100 14V4M92 4h16" strokeWidth="2.4" />
      <path d="M52 74c16 7 80 7 96 0M52 112c16 7 80 7 96 0" strokeWidth="1.6" opacity="0.85" />
      <path d="M120 60v78" strokeWidth="1.4" opacity="0.7" />
      <path d="M114 96h12M114 118h12" strokeWidth="1.2" opacity="0.6" />
      <circle cx="100" cy="176" r="7" />
      <path d="M100 183v14M92 197h16" strokeWidth="2.4" />
      <circle cx="158" cy="66" r="10" />
      <path d="M158 66l5-5" strokeWidth="1.5" />
      <path d="M148 66h-8" />
      <path d="M64 88v52M76 92v48M88 96v42" strokeWidth="1.1" opacity="0.35" />
      <circle cx="76" cy="70" r="3" opacity="0.55" />
      <circle cx="90" cy="58" r="2.2" opacity="0.5" />
      <circle cx="106" cy="66" r="2.6" opacity="0.5" />
      <circle cx="116" cy="54" r="1.8" opacity="0.45" />
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
      className="group relative flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#a9723f] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f9efd9] focus-visible:outline-none disabled:pointer-events-none disabled:opacity-20 sm:h-16 sm:w-16"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-7 w-7 fill-current text-[#a9723f] transition-all duration-200 group-hover:scale-125 group-hover:text-[#4a2c17] sm:h-10 sm:w-10"
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
