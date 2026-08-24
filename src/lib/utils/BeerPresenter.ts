import { DEFAULT_LOCALE } from "@/config/locales";
import { DEFAULT_THEME_COLOR, DEFAULT_THEME_COLOR_CONTAINER } from "@/config/beer";
import { publicImageUrl } from "@/lib/storage/constants";
import type { IBeer, IBeerTranslation } from "@/models/Beer";

const FALLBACK_IMAGE_SRC = "/images/otter-beer-single-can.png";

/**
 * Picks the translation to render for a given locale, falling back to the
 * default locale (Vietnamese is required on every beer) and then to
 * whatever exists — mirrors BlogPostPresenter.pickTranslation.
 */
export function pickTranslation(
  beer: Pick<IBeer, "translations">,
  locale: string
): IBeerTranslation | null {
  return (
    beer.translations.find((t) => t.locale === locale) ??
    beer.translations.find((t) => t.locale === DEFAULT_LOCALE) ??
    beer.translations[0] ??
    null
  );
}

/** Plain, serializable shape ProductShowcase (a Client Component) can receive as a prop. */
export interface BeerShowcaseItem {
  id: string;
  abv: string;
  ibu: number;
  imageSrc: string;
  style: string;
  headline: string;
  description: string;
  shopUrl?: string;
  findLocallyUrl?: string;
  themeColor: string;
  themeColorContainer: string;
}

/**
 * Maps a published Beer document to the plain shape ProductShowcase renders.
 * Returns null when the beer has no usable translation for any locale (data
 * integrity guard — translations is required to have at least one entry at
 * the schema level, so this should not happen for a saved beer).
 */
export function toShowcaseItem(beer: IBeer, locale: string): BeerShowcaseItem | null {
  const translation = pickTranslation(beer, locale);
  if (!translation) return null;

  return {
    id: String(beer._id),
    abv: `${beer.abv}%`,
    ibu: beer.ibu,
    imageSrc: beer.imageKey ? publicImageUrl(beer.imageKey) : FALLBACK_IMAGE_SRC,
    style: translation.style,
    headline: translation.headline,
    description: translation.description,
    shopUrl: beer.shopUrl,
    findLocallyUrl: beer.findLocallyUrl,
    themeColor: beer.themeColor ?? DEFAULT_THEME_COLOR,
    themeColorContainer: beer.themeColorContainer ?? DEFAULT_THEME_COLOR_CONTAINER,
  };
}
