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
    heading: "Mỗi Ngụm Bia, Một Câu Chuyện",
    subtext:
      "Otter Beer không chỉ là thức uống — mỗi hương vị đều mang theo câu chuyện về vùng đất, con người và những kết nối đằng sau nó.",
  },
  en: {
    heading: "Every Sip Tells a Story",
    subtext:
      "Otter Beer isn't just something to drink — every flavor carries a story of the land, the people, and the connections behind it.",
  },
} as const;

export function TaglineSection({ locale = DEFAULT_LOCALE }: TaglineSectionProps) {
  const content = COPY[locale as keyof typeof COPY] ?? COPY.en;

  return (
    <section
      aria-label="Brand Tagline"
      className="w-full bg-[#fde9c9] text-[#002867]"
    >
      <div className="mx-auto max-w-[1280px] px-6 py-10 sm:px-10 sm:py-14 lg:px-16 lg:py-16">
        <h2
          className={`${playfair.className} text-3xl font-bold italic tracking-tight text-[#002867] sm:text-4xl md:text-5xl lg:text-[54px] lg:leading-[1.15]`}
        >
          {content.heading}
        </h2>
        <p className="mt-3 max-w-4xl text-sm font-medium leading-relaxed text-[#1d3f82] sm:mt-4 sm:text-base md:text-lg">
          {content.subtext}
        </p>
      </div>
    </section>
  );
}
