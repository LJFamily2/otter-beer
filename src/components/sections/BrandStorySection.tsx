"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Great_Vibes, Roboto_Slab } from "next/font/google";
import { playPageTurn } from "@/lib/utils/pageTurnSound";

const script = Great_Vibes({ subsets: ["latin"], weight: "400" });
const slab = Roboto_Slab({ subsets: ["latin"], weight: ["700"] });

/** Keep in sync with the --flip-ms custom property set on the leaf below. */
const FLIP_MS = 780;

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

/**
 * TEMPORARY static content — no admin-authored pages exist yet (this
 * component isn't wired to BrandStoryService in this change). Both locales
 * render this same English content for now, the same shortcut HeroSection
 * takes for its placeholder beer copy. Swap for a real fetch when asked to
 * "connect" the section: each spread already carries the
 * {title, illustration, lines} split that an uploaded page image plus
 * admin-authored title/caption would fill in.
 */
const SPREADS: BookSpread[] = [
  {
    id: "kettle",
    title: "Copper Kettle\nBrewing History",
    illustration: <CopperKettleEngraving />,
    lines: ["Mashing", "Boiling", "Fermenting"],
  },
  {
    id: "hops",
    title: "Hand-Selected\nHops & Malt",
    illustration: <HopBineEngraving />,
    lines: ["Harvesting", "Milling", "Blending"],
  },
  {
    id: "cellar",
    title: "Patient\nFermentation",
    illustration: <FermentationTankEngraving />,
    lines: ["Yeast", "Time", "Otter Beer"],
  },
];

interface FlipState {
  /** Bumped every flip so React re-mounts the leaf and restarts its keyframes. */
  id: number;
  direction: "next" | "prev";
  /** Spread index the book was showing when this flip started. */
  fromIndex: number;
}

/**
 * Homepage "Brand Story" flipbook — a bound book the visitor pages through
 * with the two arrow controls.
 *
 * The page turn is a real leaf hinged at the spine, not a whole-spread
 * rotation: a single half-width element rotates 180° around the gutter with
 * `backface-visibility: hidden` on both faces, so the outgoing page's front
 * and the incoming page's back are two sides of one sheet. Nothing between
 * the `perspective` wrapper and the leaf may set `overflow` — that would
 * flatten the 3D context and collapse the turn back into a flat wipe.
 *
 * Deliberately breaks from the site's "Coastal Premium" tokens
 * (docs/DESIGN.md) for a warm heritage-brewing mood; every illustration and
 * texture here is original SVG (no source art files exist for this section).
 */
export function BrandStorySection({ locale }: BrandStorySectionProps) {
  const copy = COPY[locale as keyof typeof COPY] ?? COPY.en;
  const [index, setIndex] = useState(0);
  const [flip, setFlip] = useState<FlipState | null>(null);

  const isFirst = index === 0;
  const isLast = index === SPREADS.length - 1;

  // The leaf is decorative only — `index` commits on click, so the spread
  // under it is already correct and nav never depends on the animation
  // actually running (it doesn't in jsdom, and it's skipped under
  // prefers-reduced-motion).
  useEffect(() => {
    if (!flip) return;
    const timer = setTimeout(() => setFlip(null), FLIP_MS);
    return () => clearTimeout(timer);
  }, [flip]);

  function turn(direction: "next" | "prev") {
    if (direction === "next" && isLast) return;
    if (direction === "prev" && isFirst) return;
    // Safe to call here and only here: this runs inside the click handler,
    // which is the user gesture browsers require before audio may start.
    playPageTurn();
    setFlip({ id: Date.now(), direction, fromIndex: index });
    setIndex((i) => i + (direction === "next" ? 1 : -1));
  }

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
          {/* `!` is load-bearing: globals.css styles h1–h4 unlayered, and an
              unlayered rule beats Tailwind's layered utilities regardless of
              specificity — without it these headings render Coastal navy. */}
          <h2 className="font-display text-[clamp(26px,4vw,42px)] tracking-[0.08em] text-[#4a2c17]! uppercase">
            {copy.heading}
          </h2>
        </div>

        <div className="flex w-full items-center justify-center gap-2 sm:gap-9">
          <ArrowButton
            direction="prev"
            label={copy.prev}
            disabled={isFirst}
            onClick={() => turn("prev")}
          />

          <div
            className="relative min-w-0 flex-1 sm:max-w-[780px]"
            style={{ perspective: "2400px" }}
          >
            <div
              aria-hidden
              className="absolute inset-x-6 -bottom-3 h-8 rounded-[50%] bg-[#3b1420]/25 blur-lg"
            />

            {/* Oxblood hardcover. No overflow here — it would flatten the 3D
                context; each page face rounds its own outer corners. */}
            <div className="relative rounded-[13px] bg-[linear-gradient(180deg,#5c1b28,#4a1520_38%,#3b1119)] p-2.5 shadow-[0_28px_54px_-18px_rgba(59,20,32,0.62),inset_0_1px_0_rgba(255,255,255,0.16),inset_0_0_0_1px_rgba(255,255,255,0.07)] sm:p-3.5">
              {/* Binding, seen through the wedge the bowed pages leave open at
                  the head and tail of the spine. Sits behind the page block. */}
              <div
                aria-hidden
                className="absolute inset-y-2 left-1/2 w-7 -translate-x-1/2 rounded-full bg-[linear-gradient(to_right,rgba(0,0,0,0.45),rgba(255,255,255,0.09)_42%,rgba(255,255,255,0.13)_50%,rgba(255,255,255,0.09)_58%,rgba(0,0,0,0.45))]"
              />

              <div
                className="relative grid grid-cols-2"
                style={{ transformStyle: "preserve-3d" }}
                role="group"
                aria-roledescription="book spread"
                aria-label={copy.pageOf(index + 1, SPREADS.length)}
              >
                {/* The only pages in the accessibility tree, and always the
                    current spread — every animation layer below is
                    aria-hidden, so a screen reader never sees a page
                    mid-turn or reads the outgoing spread. */}
                <PageFace side="left" spread={SPREADS[index]} />
                <PageFace side="right" spread={SPREADS[index]} />

                {/* Visually, the half the leaf is about to land on has to keep
                    showing the *outgoing* page until it gets there. */}
                {flip ? (
                  <div
                    aria-hidden
                    className={`absolute inset-y-0 z-10 w-1/2 ${
                      flip.direction === "next" ? "left-0" : "left-1/2"
                    }`}
                  >
                    <PageFace
                      side={flip.direction === "next" ? "left" : "right"}
                      spread={SPREADS[flip.fromIndex]}
                    />
                  </div>
                ) : null}

                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 left-1/2 z-10 w-10 -translate-x-1/2 bg-[linear-gradient(to_right,transparent,rgba(74,21,32,0.16)_38%,rgba(74,21,32,0.26)_50%,rgba(74,21,32,0.16)_62%,transparent)]"
                />

                {flip ? (
                  <div
                    key={flip.id}
                    aria-hidden
                    className={`absolute inset-y-0 z-20 w-1/2 ${
                      flip.direction === "next"
                        ? "left-1/2 origin-left brand-leaf-next"
                        : "left-0 origin-right brand-leaf-prev"
                    }`}
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    <div className="absolute inset-0 [backface-visibility:hidden]">
                      <PageFace
                        side={flip.direction === "next" ? "right" : "left"}
                        spread={SPREADS[flip.fromIndex]}
                        asLeaf
                      />
                    </div>
                    <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                      <PageFace
                        side={flip.direction === "next" ? "left" : "right"}
                        spread={SPREADS[index]}
                        asLeaf
                      />
                    </div>
                    <div className="brand-leaf-shade pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(90,42,28,0.15),rgba(74,21,32,0.85))]" />
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <ArrowButton
            direction="next"
            label={copy.next}
            disabled={isLast}
            onClick={() => turn("next")}
          />
        </div>

        <p
          aria-live="polite"
          className="text-[11px] font-bold tracking-[0.28em] text-[#a9723f] uppercase"
        >
          {copy.pageOf(index + 1, SPREADS.length)}
        </p>
      </div>
    </section>
  );
}

function PageFace({
  side,
  spread,
  asLeaf = false,
}: {
  side: "left" | "right";
  spread: BookSpread;
  asLeaf?: boolean;
}) {
  // Sheets bow into the gutter, so the spine-side edge is shorter than the
  // outer one — a wide, shallow elliptical radius bends the head and tail in
  // toward the binding, and the inset shadow shades the trough it makes.
  // Composed as one boxShadow string because two Tailwind `shadow-[…]`
  // utilities on one element would collide rather than merge.
  const gutterShade =
    side === "left"
      ? "inset -18px 0 22px -18px rgba(74,21,32,0.5)"
      : "inset 18px 0 22px -18px rgba(74,21,32,0.5)";

  return (
    <div
      style={{ boxShadow: asLeaf ? `${gutterShade}, 0 0 30px rgba(59,20,32,0.24)` : gutterShade }}
      className={`relative flex h-full min-h-[330px] flex-col items-center justify-center bg-[#fdfbf4] px-4 py-8 text-center sm:min-h-[500px] sm:px-8 sm:py-12 ${
        side === "left"
          ? "rounded-l-[5px] rounded-tr-[100%_16px] rounded-br-[100%_16px]"
          : "rounded-r-[5px] rounded-tl-[100%_16px] rounded-bl-[100%_16px]"
      }`}
    >
      <PaperGrain />
      {/* Fanned page edges along the book's outer trim. */}
      <div
        aria-hidden
        className={`absolute inset-y-1 w-[11px] bg-[repeating-linear-gradient(to_right,rgba(74,21,32,0.26)_0px,rgba(74,21,32,0.26)_1px,transparent_1px,transparent_3px)] ${
          side === "left" ? "left-0 rounded-l-[4px]" : "right-0 rounded-r-[4px]"
        }`}
      />

      {side === "left" ? (
        <>
          {/* text-[...]! — see the note on the section heading above. */}
          <h3
            className={`${slab.className} relative whitespace-pre-line text-[17px] leading-[1.28] tracking-[-0.01em] text-[#3d2314]! sm:text-[27px]`}
          >
            {spread.title}
          </h3>
          <div className="relative mt-6 text-[#a9622f] sm:mt-9">
            {spread.illustration}
          </div>
        </>
      ) : (
        <>
          <CornerFlourish className="absolute top-2 left-2 sm:top-4 sm:left-4" />
          <CornerFlourish className="absolute top-2 right-2 -scale-x-100 sm:top-4 sm:right-4" />
          <CornerFlourish className="absolute bottom-2 left-2 -scale-y-100 sm:bottom-4 sm:left-4" />
          <CornerFlourish className="absolute right-2 bottom-2 -scale-x-100 -scale-y-100 sm:right-4 sm:bottom-4" />

          <div className="relative flex flex-col items-center gap-1 sm:gap-2">
            {spread.lines.map((line, lineIndex) => (
              <div key={line} className="flex flex-col items-center">
                <div className="flex items-center gap-2 sm:gap-3">
                  {lineIndex === 1 ? <HopSprig className="h-5 w-4 sm:h-8 sm:w-6" /> : null}
                  <p
                    className={`${script.className} text-[clamp(26px,5.6vw,52px)] leading-[1.12] text-[#3d2314]`}
                  >
                    {line}
                  </p>
                  {lineIndex !== 1 ? <HopSprig className="h-5 w-4 sm:h-8 sm:w-6" /> : null}
                </div>
                {lineIndex < spread.lines.length - 1 ? (
                  <span aria-hidden className="text-[#c8a26a]">
                    <TinyFlourish />
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

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

/** Tiled brewing line-art wallpaper behind the book. */
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
            {/* hop cone */}
            <g transform="translate(18 16)">
              <path d="M16 4v6" />
              <path d="M16 10c-7 0-11 5-11 11s4 14 11 14 11-7 11-14-4-11-11-11z" />
              <path d="M6 18c3-2 6-3 10-3s7 1 10 3M6 25c3-2 6-3 10-3s7 1 10 3M8 31c2-2 5-3 8-3s6 1 8 3" />
              <path d="M16 6c-3-3-7-3-9-1 2 3 6 4 9 1z" />
            </g>
            {/* wheat ear */}
            <g transform="translate(104 12)">
              <path d="M14 52V16" />
              <path d="M14 20c-6-1-9-5-9-10 5 0 9 3 9 8zM14 20c6-1 9-5 9-10-5 0-9 3-9 8z" />
              <path d="M14 30c-6-1-9-5-9-10 5 0 9 3 9 8zM14 30c6-1 9-5 9-10-5 0-9 3-9 8z" />
              <path d="M14 40c-6-1-9-5-9-10 5 0 9 3 9 8zM14 40c6-1 9-5 9-10-5 0-9 3-9 8z" />
              <path d="M14 12c-2-4-1-8 2-10 1 4 0 8-2 10z" />
            </g>
            {/* beer mug */}
            <g transform="translate(176 20)">
              <path d="M4 14h24v28a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V14z" />
              <path d="M28 20h6a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4h-6" />
              <path d="M4 14c2-6 6-8 12-8s10 2 12 8" />
              <path d="M11 22v18M20 22v18" strokeWidth="1.1" />
            </g>
            {/* barrel */}
            <g transform="translate(24 108)">
              <path d="M10 6h28c4 8 4 30 0 38H10c-4-8-4-30 0-38z" />
              <path d="M6 16h36M6 34h36" />
              <path d="M24 6v38" strokeWidth="1.1" />
            </g>
            {/* bottle */}
            <g transform="translate(112 104)">
              <path d="M12 4h8v12c8 5 10 10 10 18v14a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V34c0-8 2-13 10-18V4z" />
              <path d="M2 34h28" strokeWidth="1.1" />
              <path d="M13 2h6" strokeWidth="2.2" />
            </g>
            {/* kettle */}
            <g transform="translate(178 112)">
              <path d="M6 16c-2 12 2 22 6 26h20c4-4 8-14 6-26" />
              <ellipse cx="22" cy="16" rx="16" ry="4" />
              <path d="M22 12V2M17 2h10" />
              <path d="M38 20c5 2 6 8 6 14" />
            </g>
            {/* pint glass */}
            <g transform="translate(66 178)">
              <path d="M6 6h24l-3 34a4 4 0 0 1-4 4h-10a4 4 0 0 1-4-4L6 6z" />
              <path d="M7 16h22" strokeWidth="1.1" />
            </g>
            {/* funnel */}
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
      viewBox="0 0 76 76"
      className={`h-9 w-9 text-[#c19056] sm:h-14 sm:w-14 ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 34V12a6 6 0 0 1 6-6h22" />
      <path d="M6 24C24 24 38 38 40 58" />
      <path d="M24 6c0 18 14 32 34 34" />
      <path d="M13 13c12 3 21 11 25 21" />
      <path d="M46 8c-3 7 0 13 7 14s11-4 9-10" />
      <path d="M8 46c7-3 13 0 14 7s-4 11-10 9" />
      <circle cx="17" cy="17" r="2.2" fill="currentColor" stroke="none" />
      <circle cx="53" cy="15" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="15" cy="53" r="1.6" fill="currentColor" stroke="none" />
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

// ─── Engraving-style illustrations ────────────────────────────────────────
// Hatched line art in the manner of a Victorian brewing manual, matching the
// reference frame's copper etchings.

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
      {/* ground */}
      <path d="M26 210h34M68 210h24M100 210h34M142 210h20M168 210h10" strokeWidth="1.8" opacity="0.7" />
      <path d="M38 217h28M76 217h30M116 217h28M152 217h18" strokeWidth="1.4" opacity="0.45" />
      {/* plinth */}
      <path d="M48 191h104a5 5 0 0 1 5 5v5a4 4 0 0 1-4 4H47a4 4 0 0 1-4-4v-5a5 5 0 0 1 5-5z" />
      <path d="M52 198h96" strokeWidth="1.4" opacity="0.5" />
      {/* body */}
      <path d="M42 130c-4 26 5 47 15 59 6 6 60 6 66 0 10-12 19-33 15-59" />
      <ellipse cx="100" cy="130" rx="58" ry="13" />
      <path d="M43 137c14 8 100 8 114 0" strokeWidth="1.8" opacity="0.8" />
      <path d="M50 160c16 9 84 9 100 0" strokeWidth="1.6" opacity="0.6" />
      {/* dome + collar */}
      <path d="M57 126c2-25 18-42 43-42s41 17 43 42" />
      <ellipse cx="100" cy="85" rx="19" ry="5.5" />
      {/* tall chimney */}
      <path d="M90 84V26M110 84V26" />
      <path d="M84 26h32" strokeWidth="3.4" />
      <path d="M87 19h26" strokeWidth="2.6" />
      <ellipse cx="100" cy="15" rx="15" ry="4.5" />
      <path d="M93 84V32M107 84V32" strokeWidth="1.2" opacity="0.4" />
      {/* outlet pipe */}
      <path d="M153 123c17 5 23 19 23 35v31" />
      <path d="M162 119c19 7 25 23 25 39v27" opacity="0.85" />
      <path d="M168 205h26" strokeWidth="3" />
      {/* spout + smoke */}
      <path d="M134 99l16-11 7 9-14 10" />
      <path d="M157 81c8-5 6-14-2-16M164 63c9-3 8-14 0-17M150 68c6-3 4-12-1-14" strokeWidth="1.8" opacity="0.62" />
      {/* body hatching — denser on the shaded left flank */}
      <path d="M53 143c-2 18 2 33 10 45M64 147c-2 17 1 31 8 42M75 150c-2 16 0 29 6 39M86 152c-1 15 0 27 4 36" strokeWidth="1.5" opacity="0.45" />
      <path d="M140 147c2 17-1 31-8 42M130 151c1 15-1 27-5 37" strokeWidth="1.3" opacity="0.3" />
      {/* dome hatching */}
      <path d="M64 116c2-18 11-30 25-34M75 122c2-17 10-28 22-32M86 125c1-16 7-26 16-30" strokeWidth="1.4" opacity="0.4" />
      {/* rivets */}
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
      {/* ground */}
      <path d="M32 210h34M74 210h28M110 210h32M150 210h18" strokeWidth="1.5" opacity="0.6" />
      {/* main bine */}
      <path d="M100 206c-6-40-4-78 2-116" />
      {/* twining tendrils */}
      <path d="M102 154c-16-4-26-16-24-30M102 118c16-5 25-18 22-32" strokeWidth="1.6" />
      {/* leaves */}
      <path d="M78 124c-14-3-22-13-20-24 12-1 21 9 20 24z" />
      <path d="M78 124c-6-8-9-15-9-21" strokeWidth="1.1" opacity="0.5" />
      <path d="M124 86c14-4 22-14 19-25-12 0-20 10-19 25z" />
      <path d="M124 86c5-8 8-15 8-21" strokeWidth="1.1" opacity="0.5" />
      {/* big cone */}
      <path d="M104 32c-18 2-28 16-26 34s16 32 30 30 22-18 20-36-8-30-24-28z" />
      <path d="M80 50c7-4 14-6 22-6s15 2 22 5M79 64c7-4 15-6 23-6s15 2 22 6M84 78c6-4 12-6 19-6s13 2 19 5M90 90c5-3 10-4 15-4s10 1 14 4" />
      <path d="M102 34c2 20 4 41 4 62" strokeWidth="1.1" opacity="0.45" />
      {/* small cone */}
      <path d="M58 168c-13 1-20 12-19 25s12 23 22 22 16-13 15-26-6-22-18-21z" />
      <path d="M41 181c5-3 10-4 16-4s11 1 16 4M41 191c5-3 11-4 17-4s11 1 15 4M45 201c4-2 8-3 13-3s9 1 12 3" />
      {/* barley ear */}
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
      {/* ground */}
      <path d="M26 212h34M68 212h26M102 212h34M144 212h22" strokeWidth="1.5" opacity="0.6" />
      {/* legs */}
      <path d="M62 186l-8 22M138 186l8 22" />
      {/* conical body */}
      <path d="M52 44h96v112l-48 52-48-52V44z" />
      <ellipse cx="100" cy="44" rx="48" ry="11" />
      {/* domed lid */}
      <path d="M62 40c4-14 18-22 38-22s34 8 38 22" />
      <ellipse cx="100" cy="18" rx="12" ry="4" />
      <path d="M100 14V4M92 4h16" strokeWidth="2.4" />
      {/* hoop bands */}
      <path d="M52 74c16 7 80 7 96 0M52 112c16 7 80 7 96 0" strokeWidth="1.6" opacity="0.85" />
      {/* sight glass */}
      <path d="M120 60v78" strokeWidth="1.4" opacity="0.7" />
      <path d="M114 96h12M114 118h12" strokeWidth="1.2" opacity="0.6" />
      {/* valve + tap */}
      <circle cx="100" cy="176" r="7" />
      <path d="M100 183v14M92 197h16" strokeWidth="2.4" />
      {/* pressure gauge */}
      <circle cx="158" cy="66" r="10" />
      <path d="M158 66l5-5" strokeWidth="1.5" />
      <path d="M148 66h-8" />
      {/* hatching */}
      <path d="M64 88v52M76 92v48M88 96v42" strokeWidth="1.1" opacity="0.35" />
      {/* rising bubbles */}
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
      className="group flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[#c8a26a] bg-[#fdf6e6] text-[#4a1520] shadow-[0_5px_16px_-4px_rgba(74,21,32,0.32)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#a9723f] hover:shadow-[0_9px_22px_-5px_rgba(74,21,32,0.42)] focus-visible:ring-2 focus-visible:ring-[#a9723f] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f9efd9] focus-visible:outline-none disabled:pointer-events-none disabled:opacity-30 sm:h-14 sm:w-14"
    >
      <svg
        viewBox="0 0 24 24"
        className={`h-4 w-4 transition-transform duration-200 group-hover:scale-110 sm:h-[18px] sm:w-[18px] ${
          direction === "prev" ? "-scale-x-100" : ""
        }`}
        aria-hidden
      >
        <path
          d="M9.5 5.6l8.4 5.9a.6.6 0 0 1 0 1l-8.4 5.9a.6.6 0 0 1-.9-.5V6.1a.6.6 0 0 1 .9-.5z"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}
