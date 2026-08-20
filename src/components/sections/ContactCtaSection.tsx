import Image from "next/image";
import { DEFAULT_LOCALE } from "@/config/locales";

interface ContactCtaSectionProps {
  locale?: string;
  zaloUrl?: string;
}

const COPY = {
  vi: {
    kicker: "KẾT NỐI CÙNG OTTER BEER",
    headingLine1: "CHÚNG TÔI LUÔN SẴN",
    headingLine2: "SÀNG LẮNG NGHE",
    subtext:
      "Thắc mắc sản phẩm, đại lý phân phối, hay hợp tác kinh doanh Otter Beer luôn đón chào bạn.",
    cardHeadingLine1: "NHẮN TIN VỚI",
    cardHeadingLine2: "CHÚNG TÔI QUA ZALO",
    cardAction: "NHẮN TIN TRỰC TIẾP",
  },
  en: {
    kicker: "GET IN TOUCH WITH OTTER",
    headingLine1: "WE'RE ALWAYS A",
    headingLine2: "MESSAGE AWAY",
    subtext:
      "Product inquiries, distribution partnerships, or just saying hi Otter Beer is always here.",
    cardHeadingLine1: "CHAT WITH US",
    cardHeadingLine2: "ON ZALO",
    cardAction: "DIRECT MESSAGE",
  },
} as const;

export function ContactCtaSection({
  locale = DEFAULT_LOCALE,
  zaloUrl = "https://zalo.me",
}: ContactCtaSectionProps) {
  const content = COPY[locale as keyof typeof COPY] ?? COPY.en;

  return (
    <section
      aria-label="Contact Call to Action"
      className="relative w-full overflow-hidden bg-background text-primary border-t border-primary/10 py-14 sm:py-18 lg:py-24"
    >
      {/* Ambient background glow */}
      <div aria-hidden className="pointer-events-none absolute inset-0 select-none overflow-hidden opacity-30">
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-secondary-container/40 blur-3xl" />
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1280px] px-6 sm:px-10 lg:px-16">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">

          {/* Left Column: Heading & Subtext */}
          <div className="flex flex-col items-start lg:col-span-7">
            <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-secondary">
              {content.kicker}
            </span>

            <h2 className="mt-3 font-display text-4xl uppercase leading-[1.12] tracking-wide text-primary sm:text-5xl sm:leading-[1.12] md:text-6xl lg:text-[60px] lg:leading-[1.08]">
              {content.headingLine1}
              <br />
              {content.headingLine2}
            </h2>

            <p className="mt-4 max-w-lg text-base font-medium leading-relaxed text-primary-container/85 sm:text-lg">
              {content.subtext}
            </p>
          </div>

          {/* Right Column: Interactive Zalo Glass Card */}
          <div className="lg:col-span-5">
            <div className="relative overflow-hidden rounded-3xl border border-white/60 bg-primary-container p-8 !text-white shadow-2xl transition-all duration-300 hover:scale-[1.02] sm:p-10">

              {/* Subtle Card Glow Effect */}
              <div aria-hidden className="pointer-events-none absolute -right-10 -bottom-10 h-48 w-48 rounded-full bg-secondary-container/20 blur-2xl" />

              {/* Logo Badge in top right corner */}
              <div className="absolute top-6 right-6 h-16 w-16 sm:top-8 sm:right-8 sm:h-20 sm:w-20">
                <Image
                  src="/images/otter-beer-logo-yellow-bg.png"
                  alt="Otter Beer"
                  width={80}
                  height={80}
                  className="h-16 w-16 rounded-2xl object-contain drop-shadow-lg sm:h-20 sm:w-20"
                />
              </div>

              {/* Card Text Content */}
              <div className="relative z-10 pr-16 sm:pr-20">
                <h3
                  style={{ color: "#ffffff" }}
                  className="font-display text-2xl uppercase leading-tight tracking-wide !text-white sm:text-3xl"
                >
                  {content.cardHeadingLine1}
                  <br />
                  {content.cardHeadingLine2}
                </h3>

                <p className="mt-3 text-xs font-medium text-white/80 sm:text-sm">
                  Tải catalogue báo giá & hỗ trợ giao hàng nhanh trong ngày.
                </p>

                <a
                  href={zaloUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${content.cardAction} on Zalo`}
                  className="group mt-8 inline-flex items-center gap-2 rounded-xl bg-[#fed65b] px-6 py-3.5 font-display text-sm font-bold uppercase tracking-wider text-primary shadow-md transition-all duration-200 hover:bg-white hover:shadow-lg sm:text-base"
                >
                  <span>{content.cardAction}</span>
                  <span className="transition-transform duration-200 group-hover:translate-x-1">
                    →
                  </span>
                </a>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

