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
    bookLabel: "Cuốn sách câu chuyện thương hiệu",
    goToChapter: (title: string) => `Mở chương ${title}`,
    turnHint: "KÉO HOẶC CLICK ĐỂ LẬT TRANG",
    features: [
      { label: "LẬT SÁCH MƯỢT MÀ", hint: "Kéo hoặc click để lật trang" },
      { label: "BỐ CỤC TỰ DO", hint: "Mỗi trang một cảm giác khác nhau" },
      { label: "TRẢI NGHIỆM TỰ NHIÊN", hint: "Như đang đọc một cuốn tạp chí thật sự" },
    ],
    toolbar: [
      { label: "DRAG", hint: "Kéo chuột để lật trang" },
      { label: "CLICK / ARROW KEY", hint: "Click hoặc dùng phím ← →" },
      { label: "SWIPE", hint: "Vuốt trái / phải trên mobile" },
    ],
  },
  en: {
    kicker: "BRAND STORY",
    heading: "FROM GRAIN TO GLASS",
    subtitle: "Combining a free-flowing layout and a 2-page flipbook experience to tell our story naturally and emotionally.",
    prev: "Previous page",
    next: "Next page",
    pageOf: (page: number, total: number) => `Page ${page} of ${total}`,
    bookLabel: "Brand story book",
    goToChapter: (title: string) => `Open chapter ${title}`,
    turnHint: "DRAG OR CLICK TO TURN THE PAGE",
    features: [
      { label: "SMOOTH PAGE TURNS", hint: "Drag or click to turn the page" },
      { label: "FREE-FORM LAYOUT", hint: "Every page has a feel of its own" },
      { label: "NATURAL EXPERIENCE", hint: "Like reading a real magazine" },
    ],
    toolbar: [
      { label: "DRAG", hint: "Drag the mouse to turn the page" },
      { label: "CLICK / ARROW KEY", hint: "Click or use the ← → keys" },
      { label: "SWIPE", hint: "Swipe left / right on mobile" },
    ],
  },
} as const;

const SPREADS = [
  { title: "Our Story", left: "/images/otter-beer-premium-lager.jpg", right: "/images/contact-hero.jpeg" },
  { title: "Ingredients", left: "/images/otter-beer-hero.png", right: "/images/otter-beer-single-3d.png" },
  { title: "Brewing", left: "/images/otter-beer-single-can.png", right: "/images/otter-beer-premium-lager-transparent.png" },
  { title: "Community", left: "/images/otter-beer-premium-lager.jpg", right: "/images/contact-hero.jpeg" },
  { title: "Journal", left: "/images/otter-beer-hero.png", right: "/images/otter-beer-single-3d.png" },
];

/* Fore-edge of the un-read page block: hairline rules stacked so the part of
   the tab column that chapters have vacated still reads as paper, not a gap. */
const FORE_EDGE =
  "bg-[repeating-linear-gradient(to_right,rgba(42,11,18,0.16)_0px,rgba(42,11,18,0.16)_1px,transparent_1px,transparent_4px)]";

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

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      turn("next");
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      turn("prev");
    }
  }

  const onPageFlip = (e: PageFlipEvent) => {
    setPageIndex(e.data);
  };

  return (
    <div className="relative mx-auto flex w-full max-w-[1400px] flex-col gap-14">
      <div className="flex items-start gap-16">
        {/* Left Title Section */}
        <div className="flex w-[260px] shrink-0 flex-col pt-6">
          <span className="mb-5 text-[10px] font-bold tracking-[0.24em] text-[#f5f1ea]/50 uppercase">
            {copy.kicker}
          </span>
          <h2 className="font-display text-[56px] leading-[0.86] tracking-tight text-[#f5f1ea] uppercase">
            {copy.heading.split(" ").map((word, i) => (
              <React.Fragment key={i}>
                {word}
                <br />
              </React.Fragment>
            ))}
          </h2>
          <p className="mt-8 text-[13px] leading-[1.8] text-[#f5f1ea]/55">{copy.subtitle}</p>

          {/* Feature list — circled icon + label + hint, as in the reference */}
          <ul className="mt-12 flex flex-col gap-6">
            {copy.features.map((feature, index) => (
              <li key={feature.label} className="flex items-start gap-4">
                <span
                  aria-hidden
                  className="mt-[2px] flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#f5f1ea]/25 text-[#f5f1ea]/70"
                >
                  <FeatureIcon index={index} />
                </span>
                <span className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold tracking-[0.16em] text-[#f5f1ea] uppercase">
                    {feature.label}
                  </span>
                  <span className="text-[11px] leading-[1.6] text-[#f5f1ea]/45">{feature.hint}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right Book Section */}
        <div
          className="perspective-[1600px] relative min-w-0 flex-1 rounded-[8px] focus-visible:ring-2 focus-visible:ring-[#f5f1ea]/40 focus-visible:outline-none"
          role="group"
          aria-label={copy.bookLabel}
          tabIndex={0}
          onKeyDown={onKeyDown}
        >
          {/* Deep ground shadow */}
          <div
            aria-hidden
            className="absolute inset-x-24 -bottom-8 h-16 rounded-[50%] bg-black/60 blur-2xl"
          />

          {/* The Hardcover Container */}
          <div className="relative mx-auto aspect-[25/13] w-full max-w-[1000px] rounded-[8px] border border-[#150506] bg-[#2a0b12] p-[7px] shadow-[0_30px_60px_-18px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.08)]">
            {/* Paper block that both the spread and the chapter tabs sit on */}
            <div
              aria-hidden
              className="absolute inset-[7px] rounded-[3px] bg-[#efeade] shadow-[inset_0_0_10px_rgba(0,0,0,0.12)]"
            />

            <div className="relative flex h-full w-full">
              {/* The open spread */}
              <div className="relative h-full min-w-0 flex-1">
                {/* Center Spine Binding */}
                <div
                  aria-hidden
                  className="absolute inset-y-0 left-1/2 z-0 w-12 -translate-x-1/2 rounded-sm bg-[linear-gradient(to_right,rgba(0,0,0,0.7),rgba(255,255,255,0.08)_40%,rgba(255,255,255,0.12)_50%,rgba(255,255,255,0.08)_60%,rgba(0,0,0,0.7))] shadow-[inset_0_0_15px_rgba(0,0,0,0.8)]"
                />

                <div className="relative z-10 h-full w-full">
                  <FlipBook
                    width={378}
                    height={504}
                    size="stretch"
                    minWidth={260}
                    maxWidth={420}
                    minHeight={347}
                    maxHeight={560}
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
                        />,
                      ];
                    })}
                  </FlipBook>
                </div>

                {/* Turn hint sitting on the spread, as in the reference */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute right-5 bottom-4 z-20 rounded-[2px] bg-[#f5f1ea]/85 px-2 py-1 text-[8px] font-bold tracking-[0.16em] text-[#2a0b12]/70 uppercase"
                >
                  {copy.turnHint}
                </span>
              </div>

              {/* Un-read chapter block: full-height page edges standing to the
                  right of the spread. Chapters already read collapse away, so
                  the stack thins out as the reader advances. */}
              <div className="relative flex h-full w-[236px] shrink-0 justify-end overflow-hidden rounded-r-[3px] bg-[#e7e1d3]">
                <div aria-hidden className={`absolute inset-0 opacity-60 ${FORE_EDGE}`} />
                {SPREADS.map((spread, index) => {
                  const isRead = index < currentSpreadIndex;
                  const isCurrent = index === currentSpreadIndex;
                  return (
                    <button
                      key={spread.title}
                      type="button"
                      onClick={() => turnToChapter(index)}
                      aria-hidden={isRead || undefined}
                      tabIndex={isRead ? -1 : undefined}
                      aria-current={isCurrent ? "true" : undefined}
                      aria-label={copy.goToChapter(spread.title)}
                      className={`group relative flex h-full shrink-0 cursor-pointer flex-col items-center overflow-hidden border-l border-[#cfc7b4] pt-6 shadow-[-4px_0_8px_-3px_rgba(0,0,0,0.28)] transition-[width,background-color] duration-500 ease-out ${
                        isRead
                          ? "pointer-events-none w-0 border-l-0"
                          : isCurrent
                            ? "w-[104px] bg-[#f7f3ea]"
                            : "w-[33px] bg-[#ebe5d7] hover:w-[42px] hover:bg-[#f2ede2]"
                      }`}
                    >
                      {isCurrent ? (
                        <span className="flex w-full flex-col items-center px-3">
                          <span className="text-center text-[9px] leading-[1.5] font-bold tracking-[0.16em] text-[#2a0b12]/80 uppercase">
                            {spread.title}
                          </span>
                          <span aria-hidden className="mt-3 h-px w-6 bg-[#2a0b12]/40" />
                        </span>
                      ) : (
                        <>
                          <span className="text-[9px] font-bold tracking-[0.1em] text-[#2a0b12]/60">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <span aria-hidden className="mt-3 h-3 w-px bg-[#2a0b12]/20" />
                          <span
                            className="mt-3 text-[9px] font-bold tracking-[0.18em] whitespace-nowrap text-[#2a0b12]/55 uppercase"
                            style={{ writingMode: "vertical-rl" }}
                          >
                            {spread.title}
                          </span>
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Arrows + dot pagination */}
          <div className="mt-10 flex items-center justify-center gap-6">
            <button
              type="button"
              onClick={() => turn("prev")}
              disabled={isFirst}
              className="cursor-pointer p-2 text-[#f5f1ea]/70 hover:text-[#f5f1ea] disabled:opacity-25"
              aria-label={copy.prev}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>

            <div aria-hidden className="flex items-center gap-2">
              {SPREADS.map((spread, index) => (
                <span
                  key={spread.title}
                  className={`h-[5px] w-[5px] rounded-full transition-colors duration-300 ${
                    index === currentSpreadIndex ? "bg-[#f5f1ea]" : "bg-[#f5f1ea]/25"
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => turn("next")}
              disabled={isLast}
              className="cursor-pointer p-2 text-[#f5f1ea]/70 hover:text-[#f5f1ea] disabled:opacity-25"
              aria-label={copy.next}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>

            <p aria-live="polite" className="sr-only">
              {copy.pageOf(currentSpreadIndex + 1, SPREADS.length)}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom instruction bar spanning the section */}
      <div className="flex items-center justify-center gap-16 border-t border-[#f5f1ea]/10 pt-8">
        {copy.toolbar.map((item, index) => (
          <div key={item.label} className="flex items-center gap-3">
            <span aria-hidden className="text-[#f5f1ea]/60">
              <ToolbarIcon index={index} />
            </span>
            <span className="text-[10px] font-bold tracking-[0.18em] text-[#f5f1ea] uppercase">
              {item.label}
            </span>
            <span className="text-[11px] text-[#f5f1ea]/40">{item.hint}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FeatureIcon({ index }: { index: number }) {
  const common = {
    width: 14,
    height: 14,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  if (index === 0) {
    return (
      <svg {...common}>
        <path d="M4 5h6a2 2 0 0 1 2 2v12a2 2 0 0 0-2-2H4z" />
        <path d="M20 5h-6a2 2 0 0 0-2 2v12a2 2 0 0 1 2-2h6z" />
      </svg>
    );
  }
  if (index === 1) {
    return (
      <svg {...common}>
        <rect x="3" y="3" width="7" height="18" rx="1" />
        <rect x="14" y="3" width="7" height="8" rx="1" />
        <rect x="14" y="15" width="7" height="6" rx="1" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M3 6c3-1 6-1 9 1 3-2 6-2 9-1v12c-3-1-6-1-9 1-3-2-6-2-9-1z" />
      <path d="M12 7v12" />
    </svg>
  );
}

function ToolbarIcon({ index }: { index: number }) {
  const common = {
    width: 13,
    height: 13,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  if (index === 0) {
    return (
      <svg {...common}>
        <rect x="5" y="2" width="14" height="20" rx="7" />
        <line x1="12" y1="6" x2="12" y2="10" />
      </svg>
    );
  }
  if (index === 1) {
    return (
      <svg {...common}>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M12 8v8" />
        <path d="M8 12h8" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M11 17a4 4 0 0 0 8 0v-4" />
      <path d="M8 17a4 4 0 0 1-8 0v-4" />
      <path d="M14 10V6a2 2 0 1 0-4 0v4" />
    </svg>
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
      className={`relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-[#f4f2ec] ${
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
