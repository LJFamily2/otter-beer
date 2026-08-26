import React from "react";
import { BrandStoryDesktop } from "./BrandStoryDesktop";
import { BrandStoryMobile } from "./BrandStoryMobile";

interface BrandStorySectionProps {
  locale: string;
}

export function BrandStorySection({ locale }: BrandStorySectionProps) {
  return (
    <section id="story" className="relative w-full bg-background">
      {/* Desktop Version — dark stage so the cream book reads as the light source */}
      <div className="relative hidden w-full overflow-hidden bg-[#0e0c0b] px-10 py-24 lg:block">
        {/* Background Image for desktop */}
        <div
          className="absolute inset-0 z-0 bg-[url('/images/brand-story-bg.jpg')] bg-cover bg-fixed bg-center opacity-[0.07]"
          aria-hidden="true"
        />
        <div className="relative z-10">
          <BrandStoryDesktop locale={locale} />
        </div>
      </div>

      {/* Mobile Version */}
      <div className="block lg:hidden w-full">
        <BrandStoryMobile locale={locale} />
      </div>
    </section>
  );
}
