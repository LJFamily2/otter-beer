import Image from "next/image";
import { DEFAULT_LOCALE } from "@/config/locales";

interface ContactCtaSectionProps {
  locale?: string;
  zaloUrl?: string;
}

const COPY = {
  vi: {
    kicker: "LIÊN HỆ VỚI CHÚNG TÔI",
    headingLine1: "CHÚNG TÔI LUÔN SẴN",
    headingLine2: "SÀNG LẮNG NGHE",
    subtext:
      "Thắc mắc, hợp tác kinh doanh, hay chỉ là lời chào — Otter Beer luôn ở đây.",
    cardHeadingLine1: "NHẮN TIN VỚI",
    cardHeadingLine2: "CHÚNG TÔI QUA ZALO",
    cardAction: "NHẮN TIN NGAY",
  },
  en: {
    kicker: "GET IN TOUCH",
    headingLine1: "WE'RE JUST A",
    headingLine2: "MESSAGE AWAY",
    subtext: "Questions, partnerships, or just want to say hi — we're around.",
    cardHeadingLine1: "CHAT WITH US",
    cardHeadingLine2: "ON ZALO",
    cardAction: "MESSAGE NOW",
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
      className="w-full bg-background text-primary"
    >
      <div className="mx-auto max-w-[1280px] px-6 py-14 sm:px-10 sm:py-18 lg:px-16 lg:py-20">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-20">
          {/* Left Column: Heading & Description */}
          <div className="flex flex-col items-start lg:col-span-7">
            <span className="font-sans text-xs font-bold uppercase tracking-widest text-primary-container sm:text-sm">
              {content.kicker}
            </span>

            <h2 className="mt-3 font-display text-4xl uppercase leading-[1.15] tracking-wide text-primary sm:text-5xl sm:leading-[1.15] md:text-6xl md:leading-[1.12] lg:text-[62px] lg:leading-[1.1]">
              {content.headingLine1}
              <br />
              {content.headingLine2}
            </h2>

            <p className="mt-5 max-w-lg text-sm font-medium leading-relaxed text-primary-container/85 sm:text-base md:text-lg">
              {content.subtext}
            </p>
          </div>

          {/* Right Column: Interactive Card */}
          <div className="lg:col-span-5">
            <div className="relative overflow-hidden rounded-2xl bg-primary-container p-8 !text-white shadow-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl sm:rounded-3xl sm:p-10">
              {/* Logo Badge in top right corner */}
              <div className="absolute top-6 right-6 h-16 w-16 sm:top-8 sm:right-8 sm:h-20 sm:w-20">
                <Image
                  src="/images/otter-beer-logo-yellow-bg.png"
                  alt="Otter Beer"
                  width={80}
                  height={80}
                  className="h-16 w-16 rounded-xl object-contain drop-shadow-md sm:h-20 sm:w-20"
                />
              </div>

              {/* Text content */}
              <div className="pr-16 sm:pr-20">
                <h3
                  style={{ color: "#ffffff" }}
                  className="font-display text-2xl uppercase leading-tight tracking-wide !text-white sm:text-3xl"
                >
                  {content.cardHeadingLine1}
                  <br />
                  {content.cardHeadingLine2}
                </h3>

                <a
                  href={zaloUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${content.cardAction} on Zalo`}
                  className="group mt-6 inline-flex items-center gap-1.5 font-display text-sm uppercase tracking-wider text-[#fed65b] underline underline-offset-4 decoration-[#fed65b] transition-colors duration-200 hover:text-white hover:decoration-white sm:text-base"
                >
                  <span>{content.cardAction}</span>
                  <span className="transition-transform duration-200 group-hover:translate-x-1">
                    &gt;
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
