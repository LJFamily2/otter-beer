"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Playfair_Display } from "next/font/google";
import { DEFAULT_LOCALE } from "@/config/locales";
import { localizedPath } from "@/lib/seo";
import { Badge } from "@/components/ui/Badge";

const playfair = Playfair_Display({
  subsets: ["latin", "vietnamese"],
  style: ["italic", "normal"],
  weight: ["500", "600"],
  display: "swap",
});

interface NewsBlogSectionProps {
  locale?: string;
}

const COPY = {
  vi: {
    kicker: "TIN TỨC & BLOG",
    heading: "CHUYỆN NHÀ OTTER",
    viewAll: "XEM TẤT CẢ BÀI VIẾT",
    prev: "Bài viết trước",
    next: "Bài viết tiếp theo",
    swipeHint: "Vuốt để xem thêm bài viết",
    sectionLabel: "Tin tức và blog",
    railLabel: "Danh sách bài viết nổi bật",
  },
  en: {
    kicker: "NEWS & BLOG",
    heading: "THE OTTER JOURNAL",
    viewAll: "VIEW ALL STORIES",
    prev: "Previous story",
    next: "Next story",
    swipeHint: "Swipe to read more stories",
    sectionLabel: "News and blog",
    railLabel: "Featured stories carousel",
  },
} as const;

// Placeholder editorial content — this section is layout-only for now.
// TODO: swap for blogPostService.listPublished() + pickTranslation() and
// point `href` at the real per-locale slug when the section is wired up
// (same pending wiring as HeroSection/BrandStorySection).
const POSTS = [
  {
    id: "brewhouse-diary",
    imageSrc: "/images/otter-beer-premium-lager.jpg",
    date: "12.05.2026",
    vi: { title: "Nhật Ký Nhà Nấu", tag: "HẬU TRƯỜNG" },
    en: { title: "Brewhouse Diary", tag: "BEHIND THE SCENES" },
  },
  {
    id: "coastal-nights",
    imageSrc: "/images/contact-hero.jpeg",
    date: "28.04.2026",
    vi: { title: "Đêm Bên Bờ Biển", tag: "SỰ KIỆN" },
    en: { title: "Coastal Nights", tag: "EVENTS" },
  },
  {
    id: "hops-of-tay-ninh",
    imageSrc: "/images/age-verification-bg.png",
    date: "09.04.2026",
    vi: { title: "Hoa Bia Xứ Tây Ninh", tag: "NGUYÊN LIỆU" },
    en: { title: "Hops of Tay Ninh", tag: "INGREDIENTS" },
  },
  {
    id: "the-golden-pour",
    imageSrc: "/images/brand-story-bg.jpg",
    date: "21.03.2026",
    vi: { title: "Rót Một Ly Vàng Óng", tag: "SẢN PHẨM" },
    en: { title: "The Golden Pour", tag: "PRODUCT" },
  },
  {
    id: "craft-community",
    imageSrc: "/images/footer-bg.png",
    date: "02.03.2026",
    vi: { title: "Cộng Đồng Thủ Công", tag: "CON NGƯỜI" },
    en: { title: "The Craft Community", tag: "PEOPLE" },
  },
] as const;

/** How far a single arrow click nudges the rail when a card can't be measured. */
const FALLBACK_SCROLL_RATIO = 0.8;
const CARD_GAP_PX = 20;

export function NewsBlogSection({ locale = DEFAULT_LOCALE }: NewsBlogSectionProps) {
  const copy = COPY[locale as keyof typeof COPY] ?? COPY.en;
  const railRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const syncBounds = useCallback(() => {
    const rail = railRef.current;
    // scrollWidth is 0 until the rail has been laid out — measuring then
    // would wrongly park both arrows in their disabled end state.
    if (!rail || rail.scrollWidth === 0) return;

    setAtStart(rail.scrollLeft <= 8);
    setAtEnd(rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 8);
  }, []);

  useEffect(() => {
    syncBounds();
    window.addEventListener("resize", syncBounds);
    return () => window.removeEventListener("resize", syncBounds);
  }, [syncBounds]);

  const scrollByCard = (direction: 1 | -1) => {
    const rail = railRef.current;
    if (!rail) return;

    const card = rail.querySelector<HTMLElement>("[data-news-card]");
    const step = card
      ? card.offsetWidth + CARD_GAP_PX
      : rail.clientWidth * FALLBACK_SCROLL_RATIO;

    // No explicit `behavior` — the rail's CSS scroll-behavior decides, so
    // prefers-reduced-motion users get an instant jump instead of a glide.
    rail.scrollBy({ left: direction * step });
  };

  return (
    <section
      aria-label={copy.sectionLabel}
      className="relative w-full overflow-hidden bg-primary py-16 sm:py-20 lg:py-28"
    >
      {/* Ambient depth — a warm gold wash top-right, a cooler one bottom-left,
          so the flat navy band reads as lit rather than printed. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 select-none">
        <div className="absolute -top-32 right-0 h-[520px] w-[520px] rounded-full bg-radial from-secondary-container/12 to-transparent blur-3xl" />
        <div className="absolute -bottom-40 -left-24 h-[460px] w-[460px] rounded-full bg-radial from-primary-fixed-dim/10 to-transparent blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Header: heading left, standfirst right — mirrors the reference's
            two-column editorial masthead. */}
        <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-8 px-6 sm:px-10 lg:grid-cols-12 lg:items-start lg:gap-16 lg:px-16">
          <div className="lg:col-span-7 lg:pt-6">
            <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-secondary-fixed-dim">
              {copy.kicker}
            </span>

            <h2 className="mt-3 font-display text-[clamp(34px,5.5vw,60px)] uppercase leading-[1.08] tracking-[0.14em] !text-white">
              {copy.heading}
            </h2>

            <Link
              href={localizedPath(locale, "/blog")}
              className="group mt-6 inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] text-secondary-fixed-dim transition-colors hover:text-white"
            >
              <span>{copy.viewAll}</span>
              <svg
                className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m0 0l-6-6m6 6l-6 6" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Card rail: inset to the container gutter on the left, bleeding past
            the right edge so the next card is always half-visible. */}
        <div className="relative mt-12 lg:mt-16">
          <div
            ref={railRef}
            onScroll={syncBounds}
            role="region"
            aria-label={copy.railLabel}
            tabIndex={0}
            className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth scroll-pl-6 pr-6 pb-3 pl-6 [scrollbar-width:none] motion-reduce:scroll-auto sm:scroll-pl-10 sm:pl-10 lg:scroll-pl-[calc(max(0px,(100vw-1280px)/2)_+_4rem)] lg:pl-[calc(max(0px,(100vw-1280px)/2)_+_4rem)] [&::-webkit-scrollbar]:hidden"
          >
            {POSTS.map((post) => {
              const content = post[locale as "vi" | "en"] ?? post.en;
              return (
                <article
                  key={post.id}
                  data-news-card
                  className="w-[264px] shrink-0 snap-start sm:w-[300px] lg:w-[324px]"
                >
                  <Link
                    href={localizedPath(locale, "/blog")}
                    className="group relative block aspect-[5/6] overflow-hidden rounded-lg no-underline shadow-md ring-1 ring-white/10 transition-[transform,box-shadow] duration-500 hover:-translate-y-1.5 focus-visible:-translate-y-1.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary-fixed-dim"
                  >
                    <Image
                      src={post.imageSrc}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 264px, (max-width: 1024px) 300px, 324px"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                    />

                    {/* Legibility scrim — deep at the caption, clear at the top. */}
                    <div
                      aria-hidden
                      className="absolute inset-0 bg-gradient-to-t from-primary from-8% via-primary/70 via-48% to-primary/10"
                    />

                    <div className="absolute inset-x-0 bottom-0 flex flex-col items-start p-5">
                      <time className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-white/60">
                        {post.date}
                      </time>

                      <h3
                        className={`${playfair.className} mt-1.5 text-2xl font-medium italic leading-snug !text-white`}
                      >
                        {content.title}
                      </h3>

                      <Badge variant="overlay" className="mt-3">
                        {content.tag}
                      </Badge>
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>

          {/* Floating rail controls — pointer-only; touch users just swipe. */}
          <div className="pointer-events-none absolute inset-y-0 right-6 hidden items-center gap-3 lg:flex">
            <button
              type="button"
              onClick={() => scrollByCard(-1)}
              disabled={atStart}
              aria-label={copy.prev}
              className="pointer-events-auto flex size-14 cursor-pointer items-center justify-center rounded-full border border-white/40 bg-primary/30 text-white backdrop-blur-md transition-all duration-200 hover:border-white hover:bg-primary/60 active:scale-95 disabled:cursor-default disabled:opacity-30 disabled:hover:border-white/40"
            >
              <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 12H5m0 0l6-6m-6 6l6 6" />
              </svg>
            </button>

            <button
              type="button"
              onClick={() => scrollByCard(1)}
              disabled={atEnd}
              aria-label={copy.next}
              className="pointer-events-auto flex size-14 cursor-pointer items-center justify-center rounded-full border border-white/40 bg-primary/30 text-white backdrop-blur-md transition-all duration-200 hover:border-white hover:bg-primary/60 active:scale-95 disabled:cursor-default disabled:opacity-30 disabled:hover:border-white/40"
            >
              <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14m0 0l-6-6m6 6l-6 6" />
              </svg>
            </button>
          </div>

          {/* Mobile swipe affordance — mirrors ProductShowcase's hint. */}
          <p className="mt-4 flex items-center justify-center gap-1.5 px-6 text-[11px] font-semibold uppercase tracking-wider text-white/50 lg:hidden">
            <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
            </svg>
            {copy.swipeHint}
          </p>
        </div>
      </div>
    </section>
  );
}
