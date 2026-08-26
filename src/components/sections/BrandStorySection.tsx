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
    turnToPage: (page: number) => void;
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
  const sectionRef = useRef<HTMLElement>(null);
  
  // Toolbar state
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isSinglePage, setIsSinglePage] = useState(false);
  const [isSoundMuted, setIsSoundMuted] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  // Math.floor(pageIndex / 2) is the current spread (0, 1, 2).
  const isFirst = pageIndex === 0;
  const isLast = pageIndex >= SPREADS.length * 2 - (isSinglePage ? 1 : 2);

  const currentScale = isSinglePage ? zoomLevel * 1.6 : zoomLevel;
  const currentTranslate = isSinglePage ? (pageIndex % 2 === 0 ? '25%' : '-25%') : '0%';

  function turn(direction: "next" | "prev") {
    if (!bookRef.current) return;
    
    if (isSinglePage) {
      if (direction === "next" && !isLast) {
        if (pageIndex % 2 === 0) {
          // Left page -> Right page. Just pan camera.
          setPageIndex(pageIndex + 1);
        } else {
          // Right page -> Left page of NEXT spread. Flip page + pan camera.
          bookRef.current.pageFlip().flipNext();
          if (!isSoundMuted) playPageTurn();
          setPageIndex(pageIndex + 1);
        }
      } else if (direction === "prev" && !isFirst) {
        if (pageIndex % 2 === 1) {
          // Right page -> Left page. Just pan camera.
          setPageIndex(pageIndex - 1);
        } else {
          // Left page -> Right page of PREV spread. Flip page + pan camera.
          bookRef.current.pageFlip().flipPrev();
          if (!isSoundMuted) playPageTurn();
          setPageIndex(pageIndex - 1);
        }
      }
    } else {
      if (direction === "next" && !isLast) {
        bookRef.current.pageFlip().flipNext();
        if (!isSoundMuted) playPageTurn();
        const nextIndex = Math.min(pageIndex + 2, SPREADS.length * 2 - 2);
        setPageIndex(nextIndex);
      } else if (direction === "prev" && !isFirst) {
        bookRef.current.pageFlip().flipPrev();
        if (!isSoundMuted) playPageTurn();
        const prevIndex = Math.max(pageIndex - 2, 0);
        setPageIndex(prevIndex);
      }
    }
  }

  const onPageFlip = (e: PageFlipEvent) => {
    if (!isSinglePage) {
      setPageIndex(e.data);
    } else {
      const currentSpread = Math.floor(pageIndex / 2) * 2;
      if (e.data > currentSpread) {
        // Flipped Forward: land on the Left page of the new spread
        setPageIndex(e.data);
      } else if (e.data < currentSpread) {
        // Flipped Backward: land on the Right page of the new spread
        setPageIndex(e.data + 1);
      }
    }
  };

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-background px-4 py-20 sm:px-6 lg:py-28">
      {/* Background Image */}
      <div
        className="absolute inset-0 z-0 bg-[url('/images/brand-story-bg.jpg')] bg-cover bg-fixed bg-center opacity-10"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto flex max-w-[1120px] flex-col items-center gap-10">
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

          <div className="relative min-w-0 w-full sm:max-w-[1000px] perspective-[1200px]">
            {/* Deep ground shadow */}
            <div
              aria-hidden
              className="absolute inset-x-12 -bottom-6 h-12 rounded-[50%] bg-black/50 blur-2xl sm:inset-x-20 sm:-bottom-10 sm:h-20 transition-transform duration-1000"
              style={{ transform: `scale(${currentScale}) translateX(${currentTranslate})` }}
            />

            {/* The Hardcover */}
            <div 
              className="relative mx-auto w-full max-w-[960px] aspect-[8/5] rounded-[6px] sm:rounded-[10px] bg-[#2a0b12] p-1.5 pb-2 sm:p-2 sm:pb-3 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.1)] border border-[#1a060a] transition-transform duration-1000 origin-center"
              style={{ transform: `scale(${currentScale}) translateX(${currentTranslate})` }}
            >
              
              {/* Paper Stack Edge (Bottom & Sides) */}
              <div className="absolute inset-1.5 bg-[#f4f2ec] rounded-[3px] sm:inset-2 shadow-[inset_0_0_8px_rgba(0,0,0,0.1)]">
                {/* Horizontal paper lines at the bottom */}
                <div className="absolute inset-x-0 bottom-0 h-1.5 sm:h-2 bg-[repeating-linear-gradient(to_bottom,rgba(0,0,0,0.06)_0px,rgba(0,0,0,0.06)_1px,transparent_1px,transparent_2px)] rounded-b-[3px]" />
              </div>

              {/* Center Spine Binding (Hardcover) */}
              <div
                aria-hidden
                className="absolute inset-y-0 left-1/2 w-8 sm:w-12 -translate-x-1/2 rounded-sm bg-[linear-gradient(to_right,rgba(0,0,0,0.7),rgba(255,255,255,0.08)_40%,rgba(255,255,255,0.12)_50%,rgba(255,255,255,0.08)_60%,rgba(0,0,0,0.7))] shadow-[inset_0_0_15px_rgba(0,0,0,0.8)] z-0"
              />

              <div className="relative w-full aspect-[8/5] z-10 -mt-0.5 sm:-mt-[2px] -mb-0.5 sm:-mb-[2px]">
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
                  flippingTime={1000}
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
      
      <FlipbookToolbar
        pageIndex={pageIndex}
        totalPages={SPREADS.length * 2}
        setZoomLevel={setZoomLevel}
        isSinglePage={isSinglePage}
        setIsSinglePage={setIsSinglePage}
        isSoundMuted={isSoundMuted}
        setIsSoundMuted={setIsSoundMuted}
        isMoreMenuOpen={isMoreMenuOpen}
        setIsMoreMenuOpen={setIsMoreMenuOpen}
        sectionRef={sectionRef}
        bookRef={bookRef}
        setPageIndex={setPageIndex}
      />
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

function FlipbookToolbar({
  pageIndex,
  totalPages,
  setZoomLevel,
  isSinglePage,
  setIsSinglePage,
  isSoundMuted,
  setIsSoundMuted,
  isMoreMenuOpen,
  setIsMoreMenuOpen,
  sectionRef,
  bookRef,
  setPageIndex
}: {
  pageIndex: number;
  totalPages: number;
  setZoomLevel: React.Dispatch<React.SetStateAction<number>>;
  isSinglePage: boolean;
  setIsSinglePage: React.Dispatch<React.SetStateAction<boolean>>;
  isSoundMuted: boolean;
  setIsSoundMuted: React.Dispatch<React.SetStateAction<boolean>>;
  isMoreMenuOpen: boolean;
  setIsMoreMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  sectionRef: React.RefObject<HTMLElement | null>;
  bookRef: React.RefObject<PageFlipInstance | null>;
  setPageIndex: React.Dispatch<React.SetStateAction<number>>;
}) {
  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.5, 3));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.5, 1));
  
  const toggleFullscreen = () => {
    if (!document.fullscreenElement && sectionRef.current) {
      sectionRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!"); 
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const goToFirstPage = () => {
    if (bookRef.current) {
      bookRef.current.pageFlip().turnToPage(0);
      setPageIndex(0);
      setIsMoreMenuOpen(false);
    }
  };

  const goToLastPage = () => {
    if (bookRef.current) {
      const target = totalPages - (isSinglePage ? 1 : 2);
      bookRef.current.pageFlip().turnToPage(target);
      setPageIndex(target);
      setIsMoreMenuOpen(false);
    }
  };

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 sm:gap-4 rounded-full bg-[#1a080c] px-4 sm:px-6 py-2 sm:py-3 shadow-lg border border-[#2a0b12]">
      <span className="text-[#f4f2ec] text-xs sm:text-sm font-medium mr-1 sm:mr-2 select-none whitespace-nowrap">
        {isSinglePage ? pageIndex + 1 : Math.floor(pageIndex / 2) + 1} / {isSinglePage ? totalPages : totalPages / 2}
      </span>
      
      <div className="w-[1px] h-5 bg-white/20" />

      <button onClick={handleZoomIn} className="text-[#f4f2ec] hover:text-white transition-colors" aria-label="Zoom In">
        <ZoomInIcon />
      </button>
      
      <button onClick={handleZoomOut} className="text-[#f4f2ec] hover:text-white transition-colors" aria-label="Zoom Out">
        <ZoomOutIcon />
      </button>
      
      <button onClick={toggleFullscreen} className="hidden sm:block text-[#f4f2ec] hover:text-white transition-colors" aria-label="Fullscreen">
        <FullscreenIcon />
      </button>
      
      <button onClick={handleShare} className="text-[#f4f2ec] hover:text-white transition-colors" aria-label="Share">
        <ShareIcon />
      </button>
      
      <div className="relative">
        <button onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)} className="text-[#f4f2ec] hover:text-white transition-colors" aria-label="More Options">
          <MoreHorizontalIcon />
        </button>
        
        {isMoreMenuOpen && (
          <div className="absolute bottom-[calc(100%+16px)] right-0 w-56 rounded-lg bg-[#1a080c] border border-[#2a0b12] p-2 shadow-xl flex flex-col gap-1 z-50">
            <a href="/BrandStory.pdf" download className="flex items-center gap-3 px-3 py-2 text-sm text-[#f4f2ec] hover:bg-white/10 rounded-md transition-colors">
              <DownloadIcon /> Download PDF File
            </a>
            <button onClick={() => { 
              if (isSinglePage) {
                // Switching to Two Page mode: snap to the left page of the current spread
                setPageIndex(Math.floor(pageIndex / 2) * 2);
              }
              setIsSinglePage(!isSinglePage); 
              setIsMoreMenuOpen(false); 
            }} className="flex items-center gap-3 px-3 py-2 text-sm text-[#f4f2ec] hover:bg-white/10 rounded-md transition-colors w-full text-left">
              <SinglePageIcon /> {isSinglePage ? 'Two Page Mode' : 'Single Page Mode'}
            </button>
            <button onClick={goToFirstPage} className="flex items-center gap-3 px-3 py-2 text-sm text-[#f4f2ec] hover:bg-white/10 rounded-md transition-colors w-full text-left">
              <FirstPageIcon /> Goto First Page
            </button>
            <button onClick={goToLastPage} className="flex items-center gap-3 px-3 py-2 text-sm text-[#f4f2ec] hover:bg-white/10 rounded-md transition-colors w-full text-left">
              <LastPageIcon /> Goto Last Page
            </button>
            <button onClick={() => setIsSoundMuted(!isSoundMuted)} className="flex items-center gap-3 px-3 py-2 text-sm text-[#f4f2ec] hover:bg-white/10 rounded-md transition-colors w-full text-left">
              {isSoundMuted ? <SoundOffIcon /> : <SoundOnIcon />} {isSoundMuted ? 'Turn on Sound' : 'Turn off Sound'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ZoomInIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>;
}

function ZoomOutIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>;
}

function FullscreenIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>;
}

function ShareIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>;
}

function MoreHorizontalIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>;
}

function DownloadIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>;
}

function SinglePageIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>;
}

function FirstPageIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="11 17 6 12 11 7"></polyline><polyline points="18 17 13 12 18 7"></polyline></svg>;
}

function LastPageIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="13 17 18 12 13 7"></polyline><polyline points="6 17 11 12 6 7"></polyline></svg>;
}

function SoundOnIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>;
}

function SoundOffIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>;
}

