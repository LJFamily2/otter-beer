"use client";

import React, { useState } from "react";

interface BrandStoryMobileProps {
  locale: string;
}

const SPREADS = [
  { title: "Our Story", left: "/images/otter-beer-premium-lager.jpg", right: "/images/contact-hero.jpeg" },
  { title: "Ingredients", left: "/images/otter-beer-hero.png", right: "/images/otter-beer-single-3d.png" },
  { title: "Brewing", left: "/images/otter-beer-single-can.png", right: "/images/otter-beer-premium-lager-transparent.png" },
  { title: "Community", left: "/images/otter-beer-premium-lager.jpg", right: "/images/contact-hero.jpeg" },
  { title: "Journal", left: "/images/otter-beer-hero.png", right: "/images/otter-beer-single-3d.png" },
];

const MOBILE_IMAGES = SPREADS.flatMap(s => [s.left, s.right]);

export function BrandStoryMobile({ locale }: BrandStoryMobileProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < MOBILE_IMAGES.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  return (
    <div className="relative w-full bg-[#f4f2ec] text-[#002867] overflow-hidden min-h-[100dvh] flex flex-col justify-between pt-24 pb-12">
      {/* Background Graphic */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]"
        style={{ 
          backgroundImage: 'url(\'data:image/svg+xml;utf8,<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><path d="M10 10 Q 50 50 90 10" stroke="rgba(0,40,103,1)" fill="none" stroke-width="2"/></svg>\')',
          backgroundRepeat: 'repeat'
        }}
      />

      <div className="relative z-10 flex flex-col items-center w-full px-4 text-center mb-8">
        <span className="text-[10px] font-bold tracking-[0.2em] text-[#002867] uppercase mb-4">
          CÂU CHUYỆN THƯƠNG HIỆU
        </span>
        <h2 className="font-display text-[48px] leading-[0.85] tracking-tight text-[#002867] uppercase">
          TỪ<br/>HẠT<br/>LÚA<br/>MẠCH<br/>ĐẾN<br/>LY<br/>BIA
        </h2>
        <p className="mt-6 text-[13px] text-[#4a5568] leading-[1.8] opacity-80 max-w-xs mx-auto">
          Kết hợp bố cục phóng khoáng và trải nghiệm lật sách 2 trang để kể câu chuyện một cách tự nhiên, cảm xúc.
        </p>
      </div>

      <div className="relative w-full max-w-sm mx-auto px-6 z-10 flex-1 flex flex-col justify-center">
        {/* The Image Container */}
        <div className="relative aspect-[3/4] w-full shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] rounded-md border border-[#1a060a]/20 overflow-hidden bg-white">
          <img 
            src={MOBILE_IMAGES[currentIndex]} 
            alt={`Trang ${currentIndex + 1}`}
            className="w-full h-full object-cover transition-opacity duration-500"
          />
        </div>

        {/* Toolbar Controls */}
        <div className="mt-8 flex w-full flex-col items-center gap-4">
          <div className="flex items-center gap-8">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="text-[#002867] hover:opacity-70 disabled:opacity-30 p-2"
              aria-label="Previous"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <p
              aria-live="polite"
              className="text-[12px] font-bold tracking-[0.2em] text-[#002867] uppercase"
            >
              TRANG {currentIndex + 1} / {MOBILE_IMAGES.length}
            </p>
            <button
              onClick={handleNext}
              disabled={currentIndex === MOBILE_IMAGES.length - 1}
              className="text-[#002867] hover:opacity-70 disabled:opacity-30 p-2"
              aria-label="Next"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>
          <div className="flex items-center gap-6 mt-2 opacity-60">
            <div className="flex items-center gap-2 text-[9px] font-bold tracking-widest uppercase text-[#002867]">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"></rect><path d="M12 8v8"></path><path d="M8 12h8"></path></svg>
              <span>CLICK</span>
            </div>
            <div className="flex items-center gap-2 text-[9px] font-bold tracking-widest uppercase text-[#002867]">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 17a4 4 0 0 0 8 0v-4"></path><path d="M8 17a4 4 0 0 1-8 0v-4"></path><path d="M14 10V6a2 2 0 1 0-4 0v4"></path></svg>
              <span>SWIPE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
