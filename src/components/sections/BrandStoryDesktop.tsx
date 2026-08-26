"use client";

import React, { useState, useRef } from "react";
import { playPageTurn } from "@/lib/utils/pageTurnSound";
import HTMLFlipBook from "react-pageflip";

interface BrandStoryDesktopProps {
  locale: string;
}

const COPY = {
  vi: {
    kicker: "CÂU CHUYỆN THƯƠNG HIỆU",
    heading: "TỪ HẠT LÚA MẠCH ĐẾN LY BIA",
    subtitle: "Kết hợp bố cục phóng khoáng và trải nghiệm lật sách 2 trang để kể câu chuyện một cách tự nhiên, cảm xúc.",
    prev: "Trang trước",
    next: "Trang sau",
    pageOf: (page: number, total: number) => `Trang ${page} / ${total}`,
  },
  en: {
    kicker: "BRAND STORY",
    heading: "FROM GRAIN TO GLASS",
    subtitle: "Combining a free-flowing layout and a 2-page flipbook experience to tell our story naturally and emotionally.",
    prev: "Previous page",
    next: "Next page",
    pageOf: (page: number, total: number) => `Page ${page} of ${total}`,
  },
} as const;

const SPREADS = [
  { title: "Our Story", left: "/images/otter-beer-premium-lager.jpg", right: "/images/contact-hero.jpeg" },
  { title: "Ingredients", left: "/images/otter-beer-hero.png", right: "/images/otter-beer-single-3d.png" },
  { title: "Brewing", left: "/images/otter-beer-single-can.png", right: "/images/otter-beer-premium-lager-transparent.png" },
  { title: "Community", left: "/images/otter-beer-premium-lager.jpg", right: "/images/contact-hero.jpeg" },
  { title: "Journal", left: "/images/otter-beer-hero.png", right: "/images/otter-beer-single-3d.png" },
];

interface PageFlipInstance {
  pageFlip: () => {
    flipNext: () => void;
    flipPrev: () => void;
    turnToPage: (page: number) => void;
  };
}

interface PageFlipEvent {
  data: number;
}

const FlipBook = HTMLFlipBook as unknown as React.ComponentType<
  Partial<Omit<React.ComponentProps<typeof HTMLFlipBook>, "children">> & {
    children: React.ReactNode;
  }
>;

export function BrandStoryDesktop({ locale }: BrandStoryDesktopProps) {
  const copy = COPY[locale as keyof typeof COPY] ?? COPY.en;
  const [pageIndex, setPageIndex] = useState(0);
  const bookRef = useRef<PageFlipInstance | null>(null);
  
  const currentSpreadIndex = Math.floor(pageIndex / 2);
  const isFirst = pageIndex === 0;
  const isLast = pageIndex >= SPREADS.length * 2 - 2;

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

  function turnToChapter(spreadIndex: number) {
    if (!bookRef.current) return;
    const targetPage = spreadIndex * 2;
    bookRef.current.pageFlip().turnToPage(targetPage);
    playPageTurn();
    setPageIndex(targetPage);
  }

  const onPageFlip = (e: PageFlipEvent) => {
    setPageIndex(e.data);
  };

  return (
    <div className="relative mx-auto flex w-full max-w-[1400px] items-center gap-10">
      
      {/* Left Title Section */}
      <div className="flex w-[240px] shrink-0 flex-col gap-4 pt-4">
        <span className="text-[10px] font-bold tracking-[0.2em] text-[#002867] uppercase mb-4">
          {copy.kicker}
        </span>
        <h2 className="font-display text-[64px] sm:text-[72px] leading-[0.85] tracking-tight text-[#002867] uppercase">
          {copy.heading.split(' ').map((word, i) => (
            <React.Fragment key={i}>
              {word}<br/>
            </React.Fragment>
          ))}
        </h2>
        <p className="mt-8 text-[13px] text-[#4a5568] leading-[1.8] opacity-80">
          {copy.subtitle}
        </p>
      </div>

      {/* Right Book Section */}
      <div className="relative flex-1 min-w-0 pr-16 perspective-[1200px]">
        {/* Deep ground shadow */}
        <div
          aria-hidden
          className="absolute inset-x-20 -bottom-10 h-20 rounded-[50%] bg-black/50 blur-2xl transition-transform duration-1000"
        />

        {/* The Hardcover Container */}
        <div className="relative mx-auto w-full max-w-[960px] aspect-[8/5] rounded-[10px] bg-[#2a0b12] p-2 pb-3 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.1)] border border-[#1a060a]">
          
          {/* Paper Stack Edge */}
          <div className="absolute inset-2 bg-[#f4f2ec] rounded-[3px] shadow-[inset_0_0_8px_rgba(0,0,0,0.1)]">
            <div className="absolute inset-x-0 bottom-0 h-2 bg-[repeating-linear-gradient(to_bottom,rgba(0,0,0,0.06)_0px,rgba(0,0,0,0.06)_1px,transparent_1px,transparent_2px)] rounded-b-[3px]" />
          </div>

          {/* Center Spine Binding */}
          <div
            aria-hidden
            className="absolute inset-y-0 left-1/2 w-12 -translate-x-1/2 rounded-sm bg-[linear-gradient(to_right,rgba(0,0,0,0.7),rgba(255,255,255,0.08)_40%,rgba(255,255,255,0.12)_50%,rgba(255,255,255,0.08)_60%,rgba(0,0,0,0.7))] shadow-[inset_0_0_15px_rgba(0,0,0,0.8)] z-0"
          />

          <div className="relative w-full aspect-[8/5] z-10 -mt-[2px] -mb-[2px]">
            <FlipBook
              width={480}
              height={600}
              size="stretch"
              minWidth={300}
              maxWidth={480}
              minHeight={375}
              maxHeight={600}
              maxShadowOpacity={0.5}
              showCover={false}
              usePortrait={false}
              mobileScrollSupport={false}
              flippingTime={1000}
              onFlip={onPageFlip}
              className="mx-auto h-full w-full"
              ref={bookRef}
            >
              {SPREADS.flatMap((spread, sIndex) => {
                const isCurrentSpread = currentSpreadIndex === sIndex;
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

          {/* Side Tabs */}
          <div className="absolute top-12 -right-[36px] flex flex-col gap-1 z-0">
            {SPREADS.map((spread, index) => {
              const isActive = currentSpreadIndex === index;
              return (
                <button
                  key={spread.title}
                  onClick={() => turnToChapter(index)}
                  className={`group relative flex flex-col items-center justify-start h-28 w-9 shrink-0 overflow-hidden rounded-r-[4px] border border-l-0 border-[#d3cdbe] shadow-[2px_2px_5px_rgba(0,0,0,0.1)] transition-all duration-300 cursor-pointer pt-3 ${
                    isActive ? "bg-[#f5f1ea] text-[#002867] w-11" : "bg-[#ebe6df] text-[#4a5568] hover:w-11"
                  }`}
                >
                  <span className="relative z-10 text-[9px] font-bold tracking-wider mb-2">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="relative z-10 w-[1px] h-3 bg-[#4a5568]/20 mb-2" />
                  <span 
                    className="relative z-10 text-[9px] font-bold tracking-widest uppercase whitespace-nowrap"
                    style={{ writingMode: 'vertical-rl', transform: 'rotate(-180deg)' }}
                  >
                    {spread.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Simplified Toolbar & Instructions */}
        <div className="mt-8 flex w-full flex-col items-center gap-4">
          <div className="flex items-center gap-8">
            <button
              onClick={() => turn("prev")}
              disabled={isFirst}
              className="text-[#002867] hover:opacity-70 disabled:opacity-30 p-2"
              aria-label={copy.prev}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <p
              aria-live="polite"
              className="text-[12px] font-bold tracking-[0.2em] text-[#002867] uppercase"
            >
              {copy.pageOf(currentSpreadIndex + 1, SPREADS.length)}
            </p>
            <button
              onClick={() => turn("next")}
              disabled={isLast}
              className="text-[#002867] hover:opacity-70 disabled:opacity-30 p-2"
              aria-label={copy.next}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>

          <div className="flex items-center gap-10 mt-2">
            <div className="flex items-center gap-2 text-[9px] font-bold tracking-widest uppercase text-[#002867]/60">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="7"></rect><line x1="12" y1="6" x2="12" y2="10"></line></svg>
              <span>DRAG</span>
            </div>
            <div className="flex items-center gap-2 text-[9px] font-bold tracking-widest uppercase text-[#002867]/60">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"></rect><path d="M12 8v8"></path><path d="M8 12h8"></path></svg>
              <span>CLICK / ARROW KEY</span>
            </div>
            <div className="flex items-center gap-2 text-[9px] font-bold tracking-widest uppercase text-[#002867]/60">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 17a4 4 0 0 0 8 0v-4"></path><path d="M8 17a4 4 0 0 1-8 0v-4"></path><path d="M14 10V6a2 2 0 1 0-4 0v4"></path></svg>
              <span>SWIPE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
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
      className={`relative flex h-full w-full flex-col items-center justify-center bg-background overflow-hidden ${
        side === "left" ? "rounded-l-[4px]" : "rounded-r-[4px]"
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
        className={`pointer-events-none absolute inset-y-1 z-10 w-[11px] opacity-30 bg-[repeating-linear-gradient(to_right,rgba(42,11,18,0.22)_0px,rgba(42,11,18,0.22)_1px,transparent_1px,transparent_3px)] ${
          side === "left" ? "left-0 rounded-l-[3px]" : "right-0 rounded-r-[3px]"
        }`}
      />

      {/* Book spine gutter shadow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-20 mix-blend-multiply"
        style={{
          background: side === "left"
            ? "linear-gradient(to right, transparent 50%, rgba(0,0,0,0.05) 85%, rgba(0,0,0,0.4) 96%, rgba(0,0,0,0.8) 100%)"
            : "linear-gradient(to left, transparent 50%, rgba(0,0,0,0.05) 85%, rgba(0,0,0,0.4) 96%, rgba(0,0,0,0.8) 100%)"
        }}
      />

      {/* Page Lighting curve simulating a bent page */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-20 mix-blend-overlay opacity-50"
        style={{
          background: side === "left"
            ? "linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 15%, rgba(255,255,255,0) 40%)"
            : "linear-gradient(to left, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 15%, rgba(255,255,255,0) 40%)"
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
      <filter id="brand-story-grain-desktop">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#brand-story-grain-desktop)" />
    </svg>
  );
}

function FlourishRule() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 180 14"
      className="h-4 w-40"
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
      className="group relative flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none disabled:pointer-events-none disabled:opacity-20"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-8 w-8 fill-current text-primary-container transition-all duration-200 group-hover:scale-125 group-hover:text-primary"
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
