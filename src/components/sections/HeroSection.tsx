"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { AnimatePresence, motion, type Variants } from "framer-motion";

const SLIDES = [
  {
    src: "/images/otter-beer-hero.png",
    alt: "Otter Beer – Flagship Hero",
  },
  {
    src: "/images/otter-beer-premium-lager.jpg",
    alt: "Otter Beer – Premium Lager",
  },
  {
    src: "/images/contact-hero.jpeg",
    alt: "Otter Beer – Brewery Atmosphere",
  },
  {
    src: "/images/brand-story-bg.jpg",
    alt: "Otter Beer – Brand Heritage",
  },
];

const AUTO_PLAY_INTERVAL = 5000; // ms

/** Direction helper: +1 = forward, -1 = backward */
type Direction = 1 | -1;

const slideVariants: Variants = {
  enter: (direction: Direction) => ({
    x: direction > 0 ? "100%" : "-100%",
  }),
  center: {
    x: 0,
    transition: { duration: 0.72, ease: [0.32, 0, 0.18, 1] },
  },
  exit: (direction: Direction) => ({
    x: direction > 0 ? "-100%" : "100%",
    transition: { duration: 0.72, ease: [0.32, 0, 0.18, 1] },
  }),
};

export function HeroSection() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<Direction>(1);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goTo = useCallback(
    (next: number, dir: Direction) => {
      setDirection(dir);
      setIndex((next + SLIDES.length) % SLIDES.length);
    },
    []
  );

  const advance = useCallback(
    (dir: Direction) => {
      goTo(index + dir, dir);
    },
    [index, goTo]
  );

  /** Reset and restart the auto-play timer */
  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setDirection(1);
      setIndex((prev) => (prev + 1) % SLIDES.length);
    }, AUTO_PLAY_INTERVAL);
  }, []);

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [resetTimer]);

  const handlePrev = () => {
    advance(-1);
    resetTimer();
  };

  const handleNext = () => {
    advance(1);
    resetTimer();
  };

  const handleDot = (i: number) => {
    goTo(i, i > index ? 1 : -1);
    resetTimer();
  };

  return (
    <section
      aria-label="Hero carousel"
      className="relative w-full overflow-hidden bg-black"
      style={{ height: "100dvh" }}
    >
      {/* 16:9 image stage — centred inside the full-screen section */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        aria-hidden="true"
      >
        {/* Aspect-ratio box: 16:9, constrained to viewport */}
        <div
          className="relative w-full"
          style={{
            /* Allow the 16:9 box to grow up to the full width, but never
               taller than the viewport (clip at top/bottom instead). */
            aspectRatio: "16 / 9",
            maxHeight: "100dvh",
            /* When the viewport is taller than 16:9 allows, fill the height
               and let width overflow (creating a cinematic letterbox-free fill). */
            height: "100dvh",
            width: "calc(100dvh * 16 / 9)",
          }}
        >
          {/* Slide track — all slides sit side by side inside here */}
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={index}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute inset-0"
            >
              <Image
                src={SLIDES[index].src}
                alt={SLIDES[index].alt}
                fill
                sizes="100vw"
                className="object-cover"
                priority={index === 0}
                draggable={false}
              />
            </motion.div>
          </AnimatePresence>
        </div>
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

      {/* Bottom gradient for dot readability */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-32"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 100%)",
        }}
      />

      {/* Prev arrow */}
      <button
        type="button"
        onClick={handlePrev}
        aria-label="Previous slide"
        className="group absolute left-4 top-1/2 z-20 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/20 backdrop-blur-sm transition-all duration-200 hover:bg-black/40 hover:border-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 sm:left-8 sm:h-14 sm:w-14"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5 fill-none stroke-white stroke-2 transition-transform duration-200 group-hover:-translate-x-0.5 sm:h-6 sm:w-6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      {/* Next arrow */}
      <button
        type="button"
        onClick={handleNext}
        aria-label="Next slide"
        className="group absolute right-4 top-1/2 z-20 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/20 backdrop-blur-sm transition-all duration-200 hover:bg-black/40 hover:border-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 sm:right-8 sm:h-14 sm:w-14"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5 fill-none stroke-white stroke-2 transition-transform duration-200 group-hover:translate-x-0.5 sm:h-6 sm:w-6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      {/* Dot indicators */}
      <div
        role="tablist"
        aria-label="Slide indicators"
        className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2.5 sm:bottom-8"
      >
        {SLIDES.map((slide, i) => (
          <button
            key={slide.src}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => handleDot(i)}
            className={[
              "h-2 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60",
              i === index
                ? "w-6 bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)]"
                : "w-2 bg-white/45 hover:bg-white/70",
            ].join(" ")}
          />
        ))}
      </div>
    </section>
  );
}
