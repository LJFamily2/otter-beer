import { DEFAULT_LOCALE } from "@/config/locales";
import { publicMediaUrl } from "@/lib/storage/constants";
import type { BrandStoryChapter } from "@/config/brandStoryChapters";
import type { IBrandStory, IBrandStoryChapter, IBrandStoryChapterTranslation } from "@/models/BrandStory";

/**
 * Picks the translation to render for a given locale, falling back to the
 * default locale (Vietnamese is required on every chapter) and then to
 * whatever exists — mirrors BeerPresenter.pickTranslation.
 */
export function pickTranslation(
  chapter: Pick<IBrandStoryChapter, "translations">,
  locale: string
): IBrandStoryChapterTranslation | null {
  return (
    chapter.translations.find((t) => t.locale === locale) ??
    chapter.translations.find((t) => t.locale === DEFAULT_LOCALE) ??
    chapter.translations[0] ??
    null
  );
}

export const DEFAULT_BRAND_STORY_CHAPTERS: Record<string, BrandStoryChapter[]> = {
  vi: [
    {
      title: "Câu Chuyện",
      images: [
        "/images/contact-hero.jpg",
        "/images/new-bg.png",
        "/images/age-verification-bg.jpg",
      ],
    },
    {
      title: "Nguyên Liệu",
      images: ["/images/contact-hero.jpg", "/images/new-bg.png"],
    },
    {
      title: "Nấu Bia",
      images: [
        "/images/contact-hero.jpg",
        "/images/new-bg.png",
        "/images/age-verification-bg.jpg",
        "/images/contact-hero.jpg",
      ],
    },
    {
      title: "Cộng Đồng",
      images: [
        "/images/contact-hero.jpg",
        "/images/new-bg.png",
        "/images/age-verification-bg.jpg",
      ],
    },
    {
      title: "Nhật Ký",
      images: ["/images/contact-hero.jpg", "/images/new-bg.png"],
    },
  ],
  en: [
    {
      title: "Our Story",
      images: [
        "/images/contact-hero.jpg",
        "/images/new-bg.png",
        "/images/age-verification-bg.jpg",
      ],
    },
    {
      title: "Ingredients",
      images: ["/images/contact-hero.jpg", "/images/new-bg.png"],
    },
    {
      title: "Brewing",
      images: [
        "/images/contact-hero.jpg",
        "/images/new-bg.png",
        "/images/age-verification-bg.jpg",
        "/images/contact-hero.jpg",
      ],
    },
    {
      title: "Community",
      images: [
        "/images/contact-hero.jpg",
        "/images/new-bg.png",
        "/images/age-verification-bg.jpg",
      ],
    },
    {
      title: "Journal",
      images: ["/images/contact-hero.jpg", "/images/new-bg.png"],
    },
  ],
};

/**
 * Maps the saved Brand Story's chapters to the flipbook's book shape — see
 * src/config/brandStoryChapters.ts, whose `buildBrandStoryBook` both
 * BrandStoryDesktop and BrandStoryMobile lay this out with. A chapter with
 * no usable translation or no images is dropped rather than rendered blank.
 */
export function toBookChapters(
  brandStory: Pick<IBrandStory, "chapters"> | null,
  locale: string
): BrandStoryChapter[] {
  if (!brandStory) return [];

  const chapters: BrandStoryChapter[] = [];
  for (const chapter of brandStory.chapters) {
    if (chapter.images.length === 0) continue;
    const translation = pickTranslation(chapter, locale);
    if (!translation) continue;
    chapters.push({
      title: translation.title,
      images: chapter.images.map(publicMediaUrl),
    });
  }
  return chapters;
}
