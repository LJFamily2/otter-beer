import React from "react";
import { BrandStoryDesktop } from "./BrandStoryDesktop";
import { BrandStoryMobile } from "./BrandStoryMobile";

interface BrandStorySectionProps {
  locale: string;
}

export function BrandStorySection({ locale }: BrandStorySectionProps) {
  return (
    /* scroll-mt keeps the fixed header from covering the section when the nav
       jumps to #story — and from swallowing clicks on the book's controls. */
    <section id="story" className="relative w-full scroll-mt-24 bg-background">
      {/* Desktop Version — a flat dark stage, deliberately unpatterned so the
          cream book is the only light source in the section. The old
          brand-story-bg line-art sat behind the book and fought it for
          attention; keep this background plain. */}
      <div className="relative hidden w-full overflow-hidden bg-[#0e0c0b] px-6 py-24 lg:block 2xl:px-10">
        <BrandStoryDesktop locale={locale} />
      </div>

      {/* Mobile Version */}
      <div className="block lg:hidden w-full">
        <BrandStoryMobile locale={locale} />
      </div>
    </section>
  );
}
