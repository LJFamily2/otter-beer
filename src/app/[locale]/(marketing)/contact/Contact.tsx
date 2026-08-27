interface ContactSectionProps {
  locale?: string;
  /**
   * Which heading tag the section title renders as. Defaults to `h1` for the
   * standalone /contact page; the homepage embeds this same section and passes
   * `h2`, because the page's one h1 belongs to the hero. Two h1s on a page
   * leaves a crawler no single statement of what the page is about.
   */
  headingLevel?: "h1" | "h2";
}

const COPY = {
  en: {
    heading: "Let's Talk Beer",
    body: "Whether you're inquiring about private events, wholesale distribution, or simply want to know what's pouring, call us directly.",
    call: "Call us",
    message: "Message",
    phoneLabel: "Phone numbers",
    taproomLabel: "THE TAPROOM",
    company: "BADENBEER Co., Ltd.",
    address:
      "13 House, Alley 30, Lac Long Quan Street, Hiep Dinh Ward, Tay Ninh Province",
    directions: "Get Directions",
    factory: "Visit our factory",
  },
  vi: {
    heading: "Liên Hệ Otter Beer",
    body: "Đặt bia cho sự kiện, hợp tác phân phối sỉ, hay chỉ muốn biết hôm nay nhà máy đang rót dòng bia nào — gọi thẳng cho chúng tôi.",
    call: "Gọi ngay",
    message: "Gửi email",
    phoneLabel: "Số điện thoại",
    taproomLabel: "TAPROOM TÂY NINH",
    company: "Công ty TNHH BADENBEER",
    address:
      "Số nhà 13, hẻm 30, đường Lạc Long Quân, phường Hiệp Định, tỉnh Tây Ninh",
    directions: "Chỉ đường",
    factory: "Tham quan nhà máy bia",
  },
} as const;

function PhoneIcon() {
  return (
    <svg
      viewBox="0 0 14 14"
      aria-hidden="true"
      className="h-[14px] w-[14px] text-[#f9e37a]"
    >
      <path
        d="M4.2 1.4c.3-.3.7-.3 1 0l.9 1.1c.3.3.3.8 0 1.1L5.9 4.6a.8.8 0 0 0-.2.9l.5 1.4c.2.5.6.9 1.1 1.1l1.4.5c.3.1.7 0 .9-.2l1 .9c.3.3.3.8 0 1.1l-1.5 1.5c-.5.5-1.2.7-1.8.5C5.2 12.7 1.5 11 1 7.5c-.2-.6 0-1.3.5-1.8L4.2 1.4Z"
        fill="currentColor"
      />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className="h-[15px] w-[15px] text-[#f9e37a]"
    >
      <path
        d="M8 1.2A5.6 5.6 0 0 0 2.4 6.8c0 4.1 4.2 7.7 5.2 8.6.2.2.5.2.7 0 .9-.9 5.3-4.5 5.3-8.6A5.6 5.6 0 0 0 8 1.2Zm0 7.6A2 2 0 1 1 8 5a2 2 0 0 1 0 4Z"
        fill="currentColor"
      />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 18 18"
      aria-hidden="true"
      className="h-[10px] w-[16px] text-[#f9e37a]"
    >
      <path
        d="M3 9h11.5M9.7 4.3 14.4 9l-4.7 4.7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ContactSection({
  locale = "en",
  headingLevel = "h1",
}: ContactSectionProps) {
  const copy = COPY[locale === "vi" ? "vi" : "en"];
  const Heading = headingLevel;

  return (
    <section
      id="contact"
      className="relative isolate overflow-hidden bg-[#0d0f10] text-white"
    >
      <div
        className="absolute inset-0 bg-cover bg-center opacity-70"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(11, 12, 14, 0.78) 0%, rgba(11, 12, 14, 0.72) 35%, rgba(11, 12, 14, 0.82) 100%), url('/images/contact-hero.jpeg')",
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(254,214,91,0.08),transparent_42%)]" />

      <div className="relative mx-auto flex min-h-[760px] max-w-[1440px] items-center px-4 pb-16 pt-10 sm:px-8 lg:px-16">
        <div className="flex w-full flex-col gap-10 lg:flex-row lg:items-end">
          <div className="w-full max-w-[760px] pb-2 lg:pr-16">
            <Heading className="!text-white font-display text-[clamp(4rem,7vw,7.2rem)] leading-[0.9] tracking-[-0.06em]">
              {copy.heading}
            </Heading>

            <p className="mt-6 max-w-[680px] text-[clamp(1.25rem,1.8vw,1.5rem)] leading-[1.33] text-[#e3e2e3]">
              {copy.body}
            </p>

            <div className="mt-12 flex flex-wrap gap-4">
              <a
                href="tel:+84908790102"
                className="inline-flex h-[66px] w-[218px] items-center justify-center rounded-[10px] bg-[#fed65b] text-[1.25rem] font-medium text-black transition-transform hover:-translate-y-0.5"
              >
                {copy.call}
              </a>
              <a
                href="mailto:hello@otterbeer.vn"
                className="inline-flex h-[66px] w-[218px] items-center justify-center rounded-[10px] border border-[#fed65b] bg-transparent text-[1.25rem] font-medium text-[#fed65b] transition-transform hover:-translate-y-0.5"
              >
                {copy.message}
              </a>
            </div>
          </div>

          <div className="relative w-full max-w-[420px] border-l border-white/20 pl-0 lg:pl-16">
            <div className="relative z-10 space-y-10 pt-4 lg:pt-0">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-[0.875rem] font-medium uppercase tracking-[0.14em] text-[#f9e37a]">
                  <PhoneIcon />
                  <span>{copy.phoneLabel}</span>
                </div>
                <div className="space-y-1 text-[1.5rem] font-light leading-[1.65] text-white">
                  <p>
                    <a href="tel:+84908790102" className="hover:text-[#f9e37a]">
                      (+84) 908 790 102
                    </a>
                  </p>
                  <p>
                    <a href="tel:+84981686491" className="hover:text-[#f9e37a]">
                      (+84) 981 686 491
                    </a>
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-[0.875rem] font-medium uppercase tracking-[0.14em] text-[#f9e37a]">
                  <LocationIcon />
                  <span>{copy.taproomLabel}</span>
                </div>

                <div className="max-w-[330px] text-[1.2rem] font-normal leading-[1.55] text-white">
                  <p>{copy.company}</p>
                </div>

                <address className="max-w-[330px] text-[1.125rem] not-italic leading-[1.65] text-[#e3e2e3]">
                  {copy.address}
                </address>

                <div className="flex flex-col items-start gap-3 pt-2">
                  <a
                    href="https://maps.google.com/?q=S%E1%BB%91+nh%C3%A0+13+H%E1%BA%B9m+30+L%E1%BA%A1c+Long+Qu%C3%A2n+T%C3%A2y+Ninh"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-[1rem] font-semibold text-[#f9e37a]"
                  >
                    <span>{copy.directions}</span>
                    <ArrowIcon />
                  </a>

                  <a
                    href="https://maps.google.com/?q=Badenbeer+Factory+Tay+Ninh"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-[1rem] font-semibold text-[#f9e37a]"
                  >
                    <span>{copy.factory}</span>
                    <ArrowIcon />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
