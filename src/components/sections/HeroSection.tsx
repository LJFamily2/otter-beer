import Image from "next/image";

interface HeroSectionProps {
  locale: string;
}

const COPY = {
  vi: { shop: ["MUA", "NGAY"], find: ["TÌM", "CỬA HÀNG"], style: "DÒNG BIA", abv: "ABV", ibu: "IBU", discover: "KHÁM PHÁ" },
  en: { shop: ["SHOP", "NOW"], find: ["FIND", "LOCALLY"], style: "STYLE", abv: "ABV", ibu: "IBU", discover: "DISCOVER" },
} as const;

/**
 * TEMPORARY static content, copied verbatim from the Figma mock (no
 * Vietnamese copy exists there yet, so both locales render this same
 * English text for now) — for a design review before this section is wired
 * to BeerService.getFeaturedPublished() (the backend for that is already
 * built: Beer model/service/API + /admin/beers CRUD, which does support
 * per-locale content). Swap this out for the real fetch when asked to
 * "connect" the section; nothing else in this file needs to change shape.
 */
const PLACEHOLDER_BEER = {
  abv: 4.3,
  ibu: 20,
  imageSrc: "/images/otter-beer-premium-lager.jpg",
  shopUrl: "#",
  findLocallyUrl: "#",
  style: "PREMIUM LAGER",
  headline: "BREWING\nCONNECTIONS.",
  description: "A crisp, golden pour born in Tay Ninh.\nCrafted for moments that matter.",
} as const;

/**
 * Homepage "Production List" hero — ported from Figma node 28:877 ("Main
 * Hero Section").
 */
export function HeroSection({ locale }: HeroSectionProps) {
  const beer = PLACEHOLDER_BEER;
  const translation = beer;

  const copy = COPY[locale as keyof typeof COPY] ?? COPY.en;

  return (
    <section className="relative flex items-center justify-center overflow-hidden bg-[#fdf9f4] px-5 py-24 lg:py-36">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden select-none"
      >
        <span className="font-display text-[22vw] leading-none whitespace-nowrap text-[rgba(0,40,103,0.05)] [text-shadow:4px_4px_0px_rgba(0,40,103,0.1)]">
          OTTER BEER
        </span>
      </div>

      <div className="relative grid w-full max-w-[1280px] grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_1.1fr_1fr]">
        <div className="hidden flex-col gap-6 lg:flex">
          <div className="-rotate-3 rounded-lg border border-[rgba(196,198,210,0.3)] bg-white/80 p-6 shadow-md backdrop-blur-sm">
            <p className="text-xs font-medium tracking-[0.1em] text-on-surface-variant uppercase">
              {copy.style}
            </p>
            <p className="mt-1 font-display text-2xl tracking-wide text-primary">
              {translation.style}
            </p>
            <div className="mt-2 h-0.5 w-12 bg-secondary-container" />
          </div>
          <div className="rotate-2 rounded-lg border border-[rgba(196,198,210,0.3)] bg-white/80 p-6 shadow-md backdrop-blur-sm">
            <div className="flex items-center justify-between gap-6">
              <div>
                <p className="text-xs font-medium tracking-[0.1em] text-on-surface-variant uppercase">
                  {copy.abv}
                </p>
                <p className="font-display text-2xl text-primary">{beer.abv}%</p>
              </div>
              <div className="h-8 w-px bg-[rgba(196,198,210,0.5)]" />
              <div>
                <p className="text-xs font-medium tracking-[0.1em] text-on-surface-variant uppercase">
                  {copy.ibu}
                </p>
                <p className="font-display text-2xl text-primary">{beer.ibu}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="order-first flex justify-center lg:order-none">
          <div className="relative flex h-[280px] w-full max-w-[420px] items-center justify-center sm:h-[360px]">
            <div className="absolute size-[70%] rounded-xl bg-[rgba(254,214,91,0.2)] blur-[48px]" />
            <div className="relative h-full w-full -skew-x-3">
              <Image
                src={beer.imageSrc}
                alt={translation.style}
                fill
                className="object-contain drop-shadow-[0px_25px_25px_rgba(0,0,0,0.15)]"
                sizes="(max-width: 1024px) 80vw, 420px"
                priority
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 text-center lg:items-end lg:text-right">
          <h1 className="font-display text-[clamp(32px,5vw,48px)] leading-tight tracking-[0.15em] whitespace-pre-line text-primary uppercase">
            {translation.headline}
          </h1>
          <p className="max-w-[320px] whitespace-pre-line text-base leading-relaxed text-on-surface-variant">
            {translation.description}
          </p>
          <div className="flex gap-4 pt-2">
            <a
              href={beer.shopUrl}
              className="flex items-center gap-2 rounded-xl bg-primary px-8 py-[17px] text-center text-sm font-bold tracking-wide text-on-primary uppercase no-underline shadow-[0px_8px_8px_rgba(0,40,103,0.2)]"
            >
              <span>
                {copy.shop[0]}
                <br />
                {copy.shop[1]}
              </span>
            </a>
            <a
              href={beer.findLocallyUrl}
              className="flex items-center gap-2 rounded-xl border border-primary px-8 py-[17px] text-center text-sm font-bold tracking-wide text-primary uppercase no-underline"
            >
              <span>
                {copy.find[0]}
                <br />
                {copy.find[1]}
              </span>
            </a>
          </div>
        </div>
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute bottom-8 hidden flex-col items-center gap-2 lg:flex"
      >
        <span className="text-xs font-medium tracking-[0.1em] text-primary uppercase">
          {copy.discover}
        </span>
        <span className="text-lg text-primary">↓</span>
      </div>
    </section>
  );
}
