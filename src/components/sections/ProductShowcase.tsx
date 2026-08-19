"use client";

import { useState } from "react";
import Image from "next/image";
import { buttonVariants } from "@/components/ui/Button";

interface ProductShowcaseProps {
  locale: string;
}

const COPY = {
  vi: {
    shop: "MUA NGAY",
    find: "TÌM CỬA HÀNG",
    style: "DÒNG BIA",
    abv: "NỒNG ĐỘ (ABV)",
    ibu: "ĐỘ ĐẮNG (IBU)",
  },
  en: {
    shop: "SHOP NOW",
    find: "FIND LOCALLY",
    style: "STYLE",
    abv: "ALCOHOL (ABV)",
    ibu: "BITTERNESS (IBU)",
  },
} as const;

const FEATURED_BEERS = [
  {
    id: "premium-lager",
    abv: "4.3%",
    ibu: 20,
    imageSrc: "/images/otter-beer-single-can.png",
    style: "PREMIUM LAGER",
    bgText: "DOANH NHÂN TRẺ",
    headline: "BREWING\nCONNECTIONS.",
    description: "A crisp, golden pour born in Tay Ninh.\nCrafted for moments that matter.",
    flavorNotes: "Mạch Nha Vàng • Thảo Mộc • Sảng Khoái",
    shopUrl: "#",
    findLocallyUrl: "#",
  },
  {
    id: "craft-ipa",
    abv: "6.2%",
    ibu: 45,
    imageSrc: "/images/otter-beer-single-3d.png",
    style: "COASTAL CRAFT IPA",
    bgText: "COASTAL CRAFT IPA",
    headline: "BOLD TROPICAL\nFLAVORS.",
    description: "Infused with rich citrus hops & Tay Ninh craftsmanship.\nBold, aromatic, and invigorating.",
    flavorNotes: "Hương Cam Quýt • Hoa Bia Đậm • Sảng Khoái",
    shopUrl: "#",
    findLocallyUrl: "#",
  },
  {
    id: "gold-craft",
    abv: "5.0%",
    ibu: 28,
    imageSrc: "/images/otter-beer-hero.png",
    style: "GOLDEN ALE",
    bgText: "GOLDEN ALE",
    headline: "PURE CRAFT\nREFRESHMENT.",
    description: "Smooth caramel malt profile paired with light herbal notes.\nPerfect for sunny coastal days.",
    flavorNotes: "Mạch Nha Cháy • Ca Cao • Ém Ám",
    shopUrl: "#",
    findLocallyUrl: "#",
  },
];

export function ProductShowcase({ locale }: ProductShowcaseProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const copy = COPY[locale as keyof typeof COPY] ?? COPY.en;
  const currentBeer = FEATURED_BEERS[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? FEATURED_BEERS.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === FEATURED_BEERS.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className="relative flex min-h-[75vh] flex-col items-center justify-center overflow-hidden bg-background px-5 py-12 sm:py-16 lg:py-20">
      {/* Dynamic Ambient Glow Background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 select-none overflow-hidden">
        {/* Soft Gold Radial Glow Center */}
        <div className="absolute top-1/2 left-1/2 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-radial from-secondary-container/30 via-secondary-container/5 to-transparent blur-3xl" />
        
        {/* Subtle Coastal Blue Vignette Accent */}
        <div className="absolute top-0 right-0 h-[400px] w-[400px] rounded-full bg-radial from-primary/5 to-transparent blur-2xl" />

        {/* Top-Shifted Editorial Background Watermark */}
        <div className="absolute top-2 sm:top-6 inset-x-0 flex items-start justify-center overflow-hidden pointer-events-none select-none">
          <span className="font-display text-[10vw] sm:text-[12vw] leading-none whitespace-nowrap text-transparent [-webkit-text-stroke:1px_rgba(0,40,103,0.05)] tracking-wider uppercase transition-all duration-500">
            {currentBeer.bgText}
          </span>
        </div>
      </div>

      <div className="relative z-10 grid w-full max-w-[1280px] grid-cols-1 items-center gap-8 lg:grid-cols-3">
        
        {/* Left Column: Glassmorphic Spec Cards (Luxury Glass & Dials) */}
        <div className="hidden flex-col gap-6 lg:flex">
          {/* Card 1: Beer Style (Glassmorphism) */}
          <div className="relative overflow-hidden rounded-2xl border border-white/60 bg-white/40 p-6 shadow-sm backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <p className="text-xs font-bold tracking-[0.15em] text-secondary uppercase">
                {copy.style}
              </p>
            </div>
            <p className="mt-3 font-display text-2xl tracking-wide text-primary">
              {currentBeer.style}
            </p>
            <p className="mt-1.5 text-sm font-medium text-primary/70">
              {currentBeer.flavorNotes}
            </p>
          </div>

          {/* Card 2: ABV & IBU Specs (Dials) */}
          <div className="relative overflow-hidden rounded-2xl border border-white/60 bg-white/40 p-6 shadow-sm backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4">
              
              {/* ABV Drop Icon & Stat */}
              <div className="flex flex-1 flex-col justify-center gap-2">
                <div className="flex items-center gap-2.5">
                  <p className="text-[11px] font-bold tracking-[0.12em] text-primary/70 uppercase">
                    {copy.abv}
                  </p>
                </div>
                <p className="font-display text-3xl font-semibold text-primary">
                  {currentBeer.abv}
                </p>
              </div>

              {/* Vertical Divider */}
              <div className="h-16 w-px bg-primary/10" />

              {/* IBU Stat */}
              <div className="flex flex-1 flex-col items-end justify-center gap-2">
                <div className="flex items-center gap-2.5">
                  <p className="text-[11px] font-bold tracking-[0.12em] text-primary/70 uppercase">
                    {copy.ibu}
                  </p>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <p className="font-display text-3xl font-semibold text-primary">
                    {currentBeer.ibu}
                  </p>
                  <span className="text-xs font-semibold text-primary/40 uppercase">
                    / 100
                  </span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Center Column: Perfectly Sized Hero Product Display */}
        <div className="order-first flex flex-col items-center justify-center lg:order-none">
          <div className="group relative flex h-[320px] w-full max-w-[320px] items-center justify-center sm:h-[380px] lg:h-[400px]">
            {/* Soft Ambient Light Halo */}
            <div className="absolute size-[85%] rounded-full bg-radial from-secondary-container/50 via-primary-container/20 to-transparent blur-3xl transition-transform duration-700 group-hover:scale-110" />
            
            {/* Perfectly Proportioned Can Image with Hover Float */}
            <div key={currentBeer.id} className="relative h-full w-full transform-gpu transition-all duration-500 ease-out group-hover:-translate-y-2 group-hover:scale-105">
              <Image
                src={currentBeer.imageSrc}
                alt={currentBeer.style}
                fill
                className="object-contain drop-shadow-[0_25px_30px_rgba(0,40,103,0.3)]"
                sizes="(max-width: 1024px) 80vw, 360px"
                priority
              />
            </div>
          </div>

          {/* Realistic 3D Ground Reflection Shadow */}
          <div className="h-4 w-48 rounded-full bg-gradient-to-r from-transparent via-primary/30 to-transparent blur-md transition-all duration-500 group-hover:w-56 group-hover:opacity-80" />

          {/* Mobile Spec Pill */}
          <div className="mt-6 flex items-center justify-center gap-4 border border-primary/20 bg-white/90 px-6 py-2.5 shadow-sm backdrop-blur-md lg:hidden">
            <span className="text-xs font-bold tracking-wide text-primary">
              {currentBeer.style}
            </span>
            <span className="h-3 w-px bg-outline-variant/40" />
            <span className="text-xs font-semibold text-on-surface-variant">
              ABV {currentBeer.abv}
            </span>
            <span className="h-3 w-px bg-outline-variant/40" />
            <span className="text-xs font-semibold text-on-surface-variant">
              IBU {currentBeer.ibu}
            </span>
          </div>
        </div>

        {/* Right Column: Copy & Sharp Action Buttons */}
        <div className="flex flex-col items-center text-center lg:items-end lg:text-right">
          {/* Main Headline */}
          <h1 className="font-display text-[clamp(34px,5vw,52px)] leading-[1.08] tracking-[0.12em] whitespace-pre-line text-primary uppercase">
            {currentBeer.headline}
          </h1>

          {/* Description */}
          <p className="mt-4 max-w-[340px] whitespace-pre-line text-base leading-relaxed text-on-surface-variant">
            {currentBeer.description}
          </p>

          {/* Sharp Architectural Buttons */}
          <div className="mt-7 flex flex-col gap-4 sm:flex-row">
            {/* Primary CTA */}
            <a
              href={currentBeer.shopUrl}
              className={buttonVariants("primary", "md")}
            >
              <span>{copy.shop}</span>
              <svg className="size-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>

            {/* Secondary CTA */}
            <a
              href={currentBeer.findLocallyUrl}
              className={buttonVariants("secondary", "md")}
            >
              <svg className="size-4 text-primary transition-colors group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{copy.find}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Product Carousel Navigation: Spread to Outer Left & Right Ends */}
      <div className="relative z-20 mt-10 flex w-full max-w-[1380px] items-center justify-between px-4 sm:px-8 lg:px-12">
        {/* Left Ultra-Thin Long Arrow Button */}
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Previous Product"
          className="group flex cursor-pointer items-center p-2 text-primary transition-all duration-200 hover:opacity-100 active:scale-95"
        >
          <svg
            width="80"
            height="18"
            viewBox="0 0 80 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-primary stroke-[1] transition-all duration-300 group-hover:stroke-secondary group-hover:-translate-x-2"
          >
            <path d="M80 9H2M2 9L11 1M2 9L11 17" strokeLinecap="square" strokeLinejoin="miter" />
          </svg>
        </button>

        {/* Slide Counter Indicator */}
        <div className="font-display text-xs tracking-widest text-primary/70">
          <span>0{currentIndex + 1}</span>
          <span className="mx-1 text-primary/30">/</span>
          <span className="text-primary/40">0{FEATURED_BEERS.length}</span>
        </div>

        {/* Right Ultra-Thin Long Arrow Button */}
        <button
          type="button"
          onClick={handleNext}
          aria-label="Next Product"
          className="group flex cursor-pointer items-center p-2 text-primary transition-all duration-200 hover:opacity-100 active:scale-95"
        >
          <svg
            width="80"
            height="18"
            viewBox="0 0 80 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-primary stroke-[1] transition-all duration-300 group-hover:stroke-secondary group-hover:translate-x-2"
          >
            <path d="M0 9H78M78 9L69 1M78 9L69 17" strokeLinecap="square" strokeLinejoin="miter" />
          </svg>
        </button>
      </div>
    </section>
  );
}




