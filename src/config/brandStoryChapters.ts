/**
 * The homepage flipbook's chapter list.
 *
 * A chapter is a *group* of images, not a single spread. The reader has to
 * turn through every page of a chapter before the next chapter's tab becomes
 * the current one — so "Community" holding 3 images means 3 images' worth of
 * page-turning before the "Journal" tab takes over.
 *
 * Because the book shows two pages at a time, a chapter with an odd number of
 * images is padded with one blank leaf. That keeps every chapter opening on a
 * left-hand page, the way a printed magazine section does.
 */
export interface BrandStoryChapter {
  title: string;
  images: string[];
}

export const BRAND_STORY_CHAPTERS: BrandStoryChapter[] = [
  {
    title: "Our Story",
    images: [
      "/images/otter-beer-premium-lager.jpg",
      "/images/contact-hero.jpeg",
      "/images/otter-beer-hero.png",
    ],
  },
  {
    title: "Ingredients",
    images: ["/images/otter-beer-single-3d.png", "/images/otter-beer-single-can.png"],
  },
  {
    title: "Brewing",
    images: [
      "/images/otter-beer-premium-lager-transparent.png",
      "/images/new-bg.png",
      "/images/brand-story-bg.jpg",
      "/images/age-verification-bg.jpg",
    ],
  },
  {
    title: "Community",
    images: [
      "/images/contact-hero.jpeg",
      "/images/otter-beer-premium-lager.jpg",
      "/images/otter-beer-hero.png",
    ],
  },
  {
    title: "Journal",
    images: ["/images/footer-bg.png", "/images/otter-beer-single-3d.png"],
  },
];

export interface BrandStoryPage {
  /** `null` marks a padding leaf — a blank page, not a missing image. */
  src: string | null;
  chapterIndex: number;
  chapterTitle: string;
  /** 1-based position of this image inside its chapter; 0 for a padding leaf. */
  positionInChapter: number;
}

export interface BrandStoryChapterLayout extends BrandStoryChapter {
  index: number;
  /** First spread of the chapter, 0-based across the whole book. */
  startSpread: number;
  /** Last spread of the chapter, inclusive. */
  endSpread: number;
  spreadCount: number;
}

export interface BrandStoryBook {
  pages: BrandStoryPage[];
  chapters: BrandStoryChapterLayout[];
  totalSpreads: number;
}

/**
 * Flattens chapters into the book's page list, padding odd chapters so each
 * one occupies a whole number of two-page spreads.
 */
export function buildBrandStoryBook(chapters: BrandStoryChapter[]): BrandStoryBook {
  const pages: BrandStoryPage[] = [];

  const laidOut = chapters.map((chapter, index) => {
    const spreadCount = Math.max(1, Math.ceil(chapter.images.length / 2));
    const startSpread = pages.length / 2;

    for (let slot = 0; slot < spreadCount * 2; slot++) {
      const src = chapter.images[slot] ?? null;
      pages.push({
        src,
        chapterIndex: index,
        chapterTitle: chapter.title,
        positionInChapter: src === null ? 0 : slot + 1,
      });
    }

    return {
      ...chapter,
      index,
      startSpread,
      endSpread: startSpread + spreadCount - 1,
      spreadCount,
    };
  });

  return { pages, chapters: laidOut, totalSpreads: pages.length / 2 };
}

/** Which chapter a given spread belongs to. Clamped, so it never returns -1. */
export function chapterIndexForSpread(book: BrandStoryBook, spreadIndex: number): number {
  const found = book.chapters.findIndex(
    (chapter) => spreadIndex >= chapter.startSpread && spreadIndex <= chapter.endSpread
  );
  if (found !== -1) return found;
  return spreadIndex < 0 ? 0 : book.chapters.length - 1;
}

export const BRAND_STORY_BOOK = buildBrandStoryBook(BRAND_STORY_CHAPTERS);
