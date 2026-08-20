import { Playfair_Display } from "next/font/google";
import { DEFAULT_LOCALE } from "@/config/locales";

const playfair = Playfair_Display({
  subsets: ["latin", "vietnamese"],
  style: ["italic", "normal"],
  weight: ["600", "700"],
  display: "swap",
});

interface TaglineSectionProps {
  locale?: string;
}

const COPY = {
  vi: {
    kicker: "TRIẾT LÝ NẤU BIA THỦ CÔNG",
    heading: "Mỗi Ngụm Bia, Một Câu Chuyện",
    subtext:
      "Otter Beer không chỉ là thức uống — mỗi hương vị đều mang theo câu chuyện về vùng đất, con người và những kết nối đằng sau nó.",
    pillars: [
      "100% MẠCH NHA VÀNG",
      "NƯỚC SUỐI TÂY NINH",
      "HOA BIA SAAZ TUYỂN CHỌN",
      "Ủ LÊN MEN TỰ NHIÊN",
    ],
  },
  en: {
    kicker: "CRAFT BREWING PHILOSOPHY",
    heading: "Every Sip Tells a Story",
    subtext:
      "Otter Beer isn't just something to drink — every flavor carries a story of the land, the people, and the connections behind it.",
    pillars: [
      "100% GOLDEN MALT",
      "TAY NINH SPRING WATER",
      "SELECT SAAZ HOPS",
      "NATURAL SLOW FERMENTATION",
    ],
  },
} as const;

export function TaglineSection({ locale = DEFAULT_LOCALE }: TaglineSectionProps) {
  const content = COPY[locale as keyof typeof COPY] ?? COPY.en;

  return (
    <section
      aria-label="Brand Tagline"
      className="relative w-full overflow-hidden bg-background text-primary py-12 sm:py-16 lg:py-20"
    >
      {/* Decorative Watermark Text */}
      <div aria-hidden className="pointer-events-none absolute -right-10 top-1/2 -translate-y-1/2 select-none overflow-hidden opacity-5">
        <span className="font-display text-[14vw] font-black uppercase text-primary">
          OTTER
        </span>
      </div>

      <div className="relative z-10 mx-auto max-w-[1280px] px-6 sm:px-10 lg:px-16">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

          {/* Left Column: Heading & Philosophy */}
          <div className="max-w-3xl">
            <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-secondary">
              {content.kicker}
            </span>

            <h2
              className={`${playfair.className} mt-3 text-3xl font-bold italic tracking-tight text-primary sm:text-4xl md:text-5xl lg:text-[56px] lg:leading-[1.12]`}
            >
              {content.heading}
            </h2>

            <p className="mt-4 max-w-2xl text-base font-medium leading-relaxed text-primary-container/90 sm:text-lg md:text-xl">
              {content.subtext}
            </p>
          </div>

          {/* Right Column: Monospaced Craft Badge Pills */}
          <div className="mt-4 flex flex-wrap gap-2.5 lg:mt-0 lg:max-w-md lg:justify-end">
            {content.pillars.map((pillar, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 rounded-full border border-primary/20 bg-white/70 px-4 py-2 text-xs font-mono font-bold tracking-wider text-primary shadow-xs backdrop-blur-md transition-all hover:border-secondary hover:bg-secondary/10"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
                <span>{pillar}</span>
              </div>
            ))}
          </div>

        </div>

        {/* Decorative Bottom Leader Line */}
        <div className="mt-10 flex items-center gap-4">
          <div className="h-px flex-1 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-primary/40">
            EST. 2024 • TAY NINH, VIETNAM
          </span>
        </div>
      </div>
    </section>
  );
}

