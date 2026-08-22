import Image from "next/image";
import { DEFAULT_LOCALE } from "@/config/locales";

interface ContactCtaSectionProps {
  locale?: string;
  mapsUrl?: string;
  factoryUrl?: string;
}

const COPY = {
  vi: {
    kicker: "KẾT NỐI CÙNG OTTER BEER",
    headingLine1: "CHÚNG TÔI LUÔN SẴN",
    headingLine2: "SÀNG LẮNG NGHE",
    subtext:
      "Thắc mắc sản phẩm, đại lý phân phối, hay hợp tác kinh doanh Otter Beer luôn đón chào bạn.",
    phoneLabel: "SỐ ĐIỆN THOẠI",
    phone1: "(+84) 908 790 102",
    phone2: "(+84) 981 686 491",
    taproomLabel: "TAPROOM",
    taproomName: "BADENBEER Co., Ltd.",
    taproomAddress:
      "13 House, Alley 30, Lac Long Quan Street, Hiep Dinh Ward, Tay Ninh Province",
    directionsLabel: "Chỉ đường",
    factoryLabel: "Tham quan nhà máy",
  },
  en: {
    kicker: "GET IN TOUCH WITH OTTER",
    headingLine1: "WE'RE ALWAYS A",
    headingLine2: "MESSAGE AWAY",
    subtext:
      "Product inquiries, distribution partnerships, or just saying hi Otter Beer is always here.",
    phoneLabel: "PHONE NUMBERS",
    phone1: "(+84) 908 790 102",
    phone2: "(+84) 981 686 491",
    taproomLabel: "THE TAPROOM",
    taproomName: "BADENBEER Co., Ltd.",
    taproomAddress:
      "13 House, Alley 30, Lac Long Quan Street, Hiep Dinh Ward, Tay Ninh Province",
    directionsLabel: "Get Directions",
    factoryLabel: "Visit our factory",
  },
} as const;

export function ContactCtaSection({
  locale = DEFAULT_LOCALE,
  mapsUrl = "https://maps.google.com",
  factoryUrl = "https://maps.google.com",
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

          {/* Right Column: Contact Info (no card, sits on section background) */}
          <div className="flex flex-col gap-8 lg:col-span-5">

            {/* Phone Numbers */}
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-secondary">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M4 3h3l1.5 4-2 1.5a10 10 0 0 0 5 5l1.5-2 4 1.5v3c0 1-1 1.5-2 1.3C8.5 15.8 2.2 9.5 1.7 3.5 1.5 2.5 3 3 4 3Z"
                    fill="currentColor"
                  />
                </svg>
                <span>{content.phoneLabel}</span>
              </div>
              <p className="mt-3 text-xl font-semibold text-primary sm:text-2xl">
                {content.phone1}
              </p>
              <p className="text-xl font-semibold text-primary sm:text-2xl">
                {content.phone2}
              </p>
            </div>

            {/* Taproom */}
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-secondary">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M12 21s7-6.5 7-11.5a7 7 0 0 0-14 0C5 14.5 12 21 12 21Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                  />
                  <circle cx="12" cy="9.5" r="2.3" stroke="currentColor" strokeWidth="1.8" />
                </svg>
                <span>{content.taproomLabel}</span>
              </div>
              <p className="mt-3 text-lg font-bold text-primary">
                {content.taproomName}
              </p>
              <p className="mt-1 max-w-xs text-base font-medium leading-relaxed text-primary-container/85">
                {content.taproomAddress}
              </p>
            </div>

            {/* Links */}
            <div className="flex flex-col gap-2">
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex w-fit items-center gap-2 font-display text-sm font-bold uppercase tracking-wider text-secondary transition-colors duration-200 hover:text-primary"
              >
                <span>{content.directionsLabel}</span>
                <span className="transition-transform duration-200 group-hover:translate-x-1">
                  →
                </span>
              </a>

              <a
                href={factoryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex w-fit items-center gap-2 font-display text-sm font-bold uppercase tracking-wider text-secondary transition-colors duration-200 hover:text-primary"
              >
                <span>{content.factoryLabel}</span>
                <span className="transition-transform duration-200 group-hover:translate-x-1">
                  →
                </span>
              </a>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}