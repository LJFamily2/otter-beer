import React from "react";
import { BrandStoryDesktop } from "./BrandStoryDesktop";
import { BrandStoryMobile } from "./BrandStoryMobile";

interface BrandStorySectionProps {
  locale: string;
}

export function BrandStorySection({ locale }: BrandStorySectionProps) {
  return (
    <section className="relative w-full bg-background">
      {/* Desktop Version */}
      <div className="hidden lg:block w-full px-4 py-20">
        {/* Background Image for desktop */}
        <div
          className="absolute inset-0 z-0 bg-[url('/images/brand-story-bg.jpg')] bg-cover bg-fixed bg-center opacity-10"
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
