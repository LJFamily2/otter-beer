"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  type PanInfo,
} from "framer-motion";

export interface HeroSlideItem {
  src: string;
  alt: string;
  mediaType?: "image" | "video";
}

/** Alt text describes what is actually in each frame and names the brand and
 *  the place — image search reads these, and so does an answer engine trying
 *  to caption the page. "Flagship Hero" described the slot, not the picture.
 *  Rendered only as a fallback — see `slides` prop — when the backend has no
 *  published hero slides yet, so the section is never empty. */
const FALLBACK_SLIDES: HeroSlideItem[] = [
  {
    src: "/images/otter-beer-hero.png",
    alt: "Lon bia thủ công Otter Beer trên nền tối — dòng bia chủ lực nấu tại Tây Ninh",
  },
  {
    src: "/images/otter-beer-premium-lager.jpg",
    alt: "Bia Otter Beer Premium Lager rót ra ly, bọt mịn, màu vàng hổ phách",
  },
  {
    src: "/images/contact-hero.jpeg",
    alt: "Không gian taproom của nhà máy bia Otter Beer tại Tây Ninh",
  },
  {
    src: "/images/brand-story-bg.jpg",
    alt: "Mạch nha vàng và hoa bia Saaz — nguyên liệu nấu bia thủ công Otter Beer",
  },
];

/** How long each slide rests before autoplay advances. Mirrored into CSS as
 *  `--hero-dwell` so the indicator fill and this timer share a duration. */
const AUTO_PLAY_INTERVAL = 6000; // ms

/** One spring for autoplay advances *and* drag releases, so a slide moved by
 *  the timer and a slide moved by your finger settle identically. Damped hard
 *  enough that a full-bleed image never visibly overshoots. */
const SLIDE_SPRING = {
  type: "spring",
  stiffness: 300,
  damping: 40,
  mass: 1,
} as const;

/** Fraction of the visible width a drag must cross to commit a slide change. */
const DRAG_DISTANCE_RATIO = 0.2;
/** …or the px/s flick speed that commits regardless of distance travelled. */
const DRAG_VELOCITY_THRESHOLD = 500;
/** Off-centre slides sit slightly enlarged and settle to 1 as they arrive. */
const OFFSCREEN_SCALE = 1.06;

/** Direction helper: +1 = forward, -1 = backward */
type Direction = 1 | -1;

/** Why autoplay is currently suspended. Several can apply simultaneously. */
type PauseReason = "drag" | "tab-hidden" | "indicator-focus";

/** True only for focus the browser considers keyboard-driven. A mouse click
 *  also focuses the button it hits, and pausing on that would mean one click
 *  on an indicator stops autoplay for good. */
function isKeyboardFocus(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  try {
    return target.matches(":focus-visible");
  } catch {
    // Older engines (and jsdom) don't know the selector; treat as pointer focus.
    return false;
  }
}

/** `page` is monotonic — it counts every advance ever made rather than wrapping.
 *  That is what lets the track translate to a single ever-decreasing offset
 *  instead of teleporting back to zero after each slide, which is where the old
 *  `AnimatePresence` implementation produced its visible hitch. */
function slideIndexFor(page: number, slideCount: number) {
  return ((page % slideCount) + slideCount) % slideCount;
}

/**
 * The 16:9 image box. It is deliberately wider than the section on tall,
 * narrow viewports — the image fills the height and overflows sideways rather
 * than letterboxing — so it is clipped by the slide cell around it. Keeping
 * the overflow *inside* the cell is what lets the track travel exactly one
 * visible width per slide, which in turn is what makes dragging track the
 * finger 1:1 on phones.
 */
function SlideMedia({
  slide,
  priority,
}: {
  slide: HeroSlideItem;
  priority: boolean;
}) {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      <div
        className="relative"
        style={{
          aspectRatio: "16 / 9",
          maxHeight: "100dvh",
          height: "100dvh",
          width: "calc(100dvh * 16 / 9)",
        }}
      >
        {slide.mediaType === "video" ? (
          <video
            src={slide.src}
            aria-label={slide.alt}
            className="absolute inset-0 h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            draggable={false}
          />
        ) : (
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            sizes="100vw"
            className="object-cover"
            priority={priority}
            loading="eager"
            draggable={false}
          />
        )}
      </div>
    </div>
  );
}

/**
 * The homepage's one <h1> — present in the markup, not painted on the slides.
 *
 * The hero is deliberately image-only: no type is drawn over the photography.
 * But it is still the top of the page, and a page whose only headings are a
 * rotating beer name and a set of section titles gives a crawler, an answer
 * engine, and a screen-reader user no single statement of what it is. So the
 * heading is rendered `sr-only`: invisible on screen, and read first by
 * everything that consumes the page as text.
 *
 * This is not hidden keyword text — it is one honest sentence naming the
 * entity, the product category and the place, which is exactly what the page
 * is about and exactly what a sighted visitor sees in the images.
 */
const HERO_COPY = {
  vi: { headline: "Bia thủ công Otter Beer, nấu tại Tây Ninh, Việt Nam" },
  en: { headline: "Otter Beer craft brewery, brewed in Tay Ninh, Vietnam" },
} as const;

interface HeroSectionProps {
  locale?: string;
  /** Published hero slides from the backend. Falls back to a static sample set when omitted or empty, so the section is never blank. */
  slides?: HeroSlideItem[];
}

export function HeroSection({ locale = "vi", slides: slidesProp = [] }: HeroSectionProps) {
  const slides = slidesProp.length > 0 ? slidesProp : FALLBACK_SLIDES;
  const copy = HERO_COPY[locale as keyof typeof HERO_COPY] ?? HERO_COPY.en;
  const prefersReducedMotion = useReducedMotion() ?? false;

  const [page, setPage] = useState(0);
  const [width, setWidth] = useState(0);

  // Autoplay is suspended for several independent reasons at once — a drag, a
  // backgrounded tab, focus parked in the indicators — so it tracks the set of
  // live reasons rather than a single flag, and only runs when the set empties.
  // `runId` ticks on each resume; the indicator fill is keyed on it so the CSS
  // sweep restarts in lockstep with the restarted timer, without an effect.
  const [autoplay, setAutoplay] = useState<{ reasons: PauseReason[]; runId: number }>(
    { reasons: [], runId: 0 }
  );
  const isPaused = autoplay.reasons.length > 0;

  const pauseAutoplay = useCallback((reason: PauseReason) => {
    setAutoplay((state) =>
      state.reasons.includes(reason)
        ? state
        : { ...state, reasons: [...state.reasons, reason] }
    );
  }, []);

  const resumeAutoplay = useCallback((reason: PauseReason) => {
    setAutoplay((state) => {
      if (!state.reasons.includes(reason)) return state;
      const reasons = state.reasons.filter((r) => r !== reason);
      return {
        reasons,
        runId: reasons.length === 0 ? state.runId + 1 : state.runId,
      };
    });
  }, []);

  const sectionRef = useRef<HTMLElement>(null);
  const widthRef = useRef(0);
  const pageRef = useRef(0);
  /** Hand-off from a drag release into the commit spring, so a hard flick
   *  arrives faster than a gentle nudge. */
  const releaseVelocityRef = useRef(0);

  const x = useMotionValue(0);
  const slideIndex = slideIndexFor(page, slides.length);

  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  // ─── Measurement ─────────────────────────────────────────────
  // One slide of travel is one *visible* width. Resizes reposition instantly —
  // animating a resize would read as a glitch rather than a transition.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const apply = (next: number) => {
      widthRef.current = next;
      setWidth(next);
      x.set(-pageRef.current * next);
    };

    apply(section.offsetWidth);

    const observer = new ResizeObserver((entries) => {
      const next = entries[0]?.contentRect.width ?? 0;
      if (next > 0) apply(next);
    });
    observer.observe(section);
    return () => observer.disconnect();
  }, [x]);

  // ─── Slide commit ────────────────────────────────────────────
  // Runs on every page change and drives the track to its new resting offset.
  useEffect(() => {
    const target = -page * widthRef.current;
    const velocity = releaseVelocityRef.current;
    releaseVelocityRef.current = 0;

    if (prefersReducedMotion || widthRef.current === 0) {
      x.set(target);
      return;
    }

    const controls = animate(x, target, { ...SLIDE_SPRING, velocity });
    return () => controls.stop();
  }, [page, prefersReducedMotion, x]);

  // ─── Autoplay ────────────────────────────────────────────────
  // A plain timeout keyed on `page`/`runId`: every slide change or resume
  // restarts the full dwell, which keeps it in step with the CSS fill that
  // restarts on the same keys. Never runs under reduced motion.
  useEffect(() => {
    if (prefersReducedMotion || isPaused) return;
    const id = setTimeout(() => setPage((p) => p + 1), AUTO_PLAY_INTERVAL);
    return () => clearTimeout(id);
  }, [page, autoplay.runId, isPaused, prefersReducedMotion]);

  // ─── Pause while the tab is in the background ────────────────
  useEffect(() => {
    const sync = () => {
      if (document.hidden) pauseAutoplay("tab-hidden");
      else resumeAutoplay("tab-hidden");
    };
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, [pauseAutoplay, resumeAutoplay]);

  // ─── Navigation ──────────────────────────────────────────────
  const handleDragStart = useCallback(
    () => pauseAutoplay("drag"),
    [pauseAutoplay]
  );

  const handleDragEnd = useCallback(
    (_event: unknown, info: PanInfo) => {
      resumeAutoplay("drag");

      const visibleWidth = widthRef.current || 1;
      const { x: distance } = info.offset;
      const { x: velocity } = info.velocity;
      const threshold = visibleWidth * DRAG_DISTANCE_RATIO;

      let direction: Direction | 0 = 0;
      if (distance < -threshold || velocity < -DRAG_VELOCITY_THRESHOLD) {
        direction = 1;
      } else if (distance > threshold || velocity > DRAG_VELOCITY_THRESHOLD) {
        direction = -1;
      }

      if (direction !== 0) {
        releaseVelocityRef.current = velocity;
        setPage((p) => p + direction);
        return;
      }

      // Below threshold — spring back to the slide we started on. The commit
      // effect won't fire here, because `page` never changed.
      animate(x, -pageRef.current * visibleWidth, {
        ...SLIDE_SPRING,
        velocity,
      });
    },
    [x, resumeAutoplay]
  );

  /** Jump to a slide by index, taking the shorter way around the loop. */
  const handleIndicator = useCallback((target: number) => {
    setPage((p) => {
      const half = slides.length / 2;
      let delta = target - slideIndexFor(p, slides.length);
      if (delta > half) delta -= slides.length;
      if (delta < -half) delta += slides.length;
      return p + delta;
    });
  }, [slides.length]);

  const handleIndicatorKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        setPage((p) => p + 1);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        setPage((p) => p - 1);
      }
    },
    []
  );

  // The three-slide window: the neighbours are always mounted, so the next
  // image is already decoded before it is ever needed and a drag has something
  // real to pull into view.
  const windowPages = [page - 1, page, page + 1];

  return (
    <section
      ref={sectionRef}
      aria-label="Hero carousel"
      aria-roledescription="carousel"
      className="relative w-full overflow-hidden bg-black"
      style={{ height: "100dvh" }}
    >
      {/* The stage is hidden from assistive tech: three slides are mounted at
          once and reading all of them would be noise. The live region below
          announces the current one instead. */}
      <div className="absolute inset-0" aria-hidden="true">
        {prefersReducedMotion ? (
          /* Reduced motion: no travel, no scale — slides cross-fade in place. */
          <div className="absolute inset-0" data-testid="hero-crossfade">
            {slides.map((slide, i) => (
              <div
                key={slide.src}
                className="absolute inset-0 transition-opacity duration-300"
                style={{ opacity: i === slideIndex ? 1 : 0 }}
              >
                <SlideMedia slide={slide} priority={i === 0} />
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            data-testid="hero-track"
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
            style={{ x }}
            drag="x"
            dragConstraints={{
              left: -(page + 1) * width,
              right: -(page - 1) * width,
            }}
            dragElastic={0.15}
            dragMomentum={false}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            {windowPages.map((p) => (
              /* The cell is exactly one visible width and clips its own
                 contents. The scale accent lives *inside* it: scaling the cell
                 itself would grow it past its edges — a 1.06 scale spills ~3%
                 of the width beyond each side — and the neighbouring slides
                 would bleed into view down the left and right of the screen. */
              <div
                key={p}
                className="absolute top-0 h-full w-full overflow-hidden"
                style={{ left: `${p * 100}%` }}
              >
                <motion.div
                  className="absolute inset-0"
                  animate={{ scale: p === page ? 1 : OFFSCREEN_SCALE }}
                  transition={SLIDE_SPRING}
                >
                  <SlideMedia slide={slides[slideIndexFor(p, slides.length)]} priority={p === 0} />
                </motion.div>
              </div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Subtle dark vignette for depth */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.45) 100%)",
        }}
      />

      {/* Bottom gradient for indicator readability */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-32"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 100%)",
        }}
      />

      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {`Slide ${slideIndex + 1} of ${slides.length}: ${slides[slideIndex].alt}`}
      </div>

      {/* See HERO_COPY: the hero stays image-only on screen, but the page
          keeps its one <h1> for crawlers and screen readers. */}
      <h1 className="sr-only">{copy.headline}</h1>

      {/* Segmented progress indicators. Not a tablist — there are no tabpanels;
          it is a labelled group of jump buttons. */}
      <div
        role="group"
        aria-label="Hero slides"
        onFocus={(event) => {
          if (isKeyboardFocus(event.target)) pauseAutoplay("indicator-focus");
        }}
        onBlur={() => resumeAutoplay("indicator-focus")}
        onKeyDown={handleIndicatorKeyDown}
        className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 sm:bottom-8 sm:gap-3"
        style={{ "--hero-dwell": `${AUTO_PLAY_INTERVAL}ms` } as React.CSSProperties}
      >
        {slides.map((slide, i) => (
          <button
            key={slide.src}
            type="button"
            onClick={() => handleIndicator(i)}
            aria-label={`Go to slide ${i + 1}: ${slide.alt}`}
            aria-current={i === slideIndex ? "true" : undefined}
            /* The bar is 3px tall; the button carries a transparent 44px
               touch target around it. */
            className="group flex h-11 w-10 items-center justify-center focus-visible:outline-none sm:w-14"
          >
            <span className="relative block h-[3px] w-full overflow-hidden rounded-[1px] bg-white/25 transition-colors duration-200 group-hover:bg-white/45 group-focus-visible:bg-white/60 group-focus-visible:ring-2 group-focus-visible:ring-white/60">
              {i === slideIndex && (
                <span
                  key={`${page}-${autoplay.runId}`}
                  data-testid="hero-indicator-fill"
                  data-paused={isPaused ? "true" : "false"}
                  className="hero-indicator-fill absolute inset-0 block"
                  style={{ background: "var(--color-secondary-fixed-dim)" }}
                />
              )}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
