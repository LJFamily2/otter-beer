import { DEFAULT_LOCALE } from "@/config/locales";
import { DEFAULT_THEME_COLOR, DEFAULT_THEME_COLOR_CONTAINER } from "@/config/beer";
import { publicImageUrl } from "@/lib/storage/constants";
import type { IBeer, IBeerTranslation, IBeerVariant } from "@/models/Beer";

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

/**
 * Picks a variant's label for a locale using the same fallback ladder as
 * pickTranslation — exact locale, then the default locale, then whatever
 * exists.
 */
export function pickVariantName(
  variant: Pick<IBeerVariant, "names">,
  locale: string
): string | null {
  const name =
    variant.names.find((n) => n.locale === locale) ??
    variant.names.find((n) => n.locale === DEFAULT_LOCALE) ??
    variant.names[0] ??
    null;
  return name?.shortName ?? null;
}

/** One packaging option as rendered by the showcase's pill picker. */
export interface BeerVariantItem {
  shortName: string;
  imageSrc: string;
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
  /**
   * Packaging options, in editor order. Empty for beers with none, in which
   * case the showcase renders `imageSrc` and hides the picker.
   */
  variants: BeerVariantItem[];
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
    // A variant with no usable label is unrenderable (the pill would be
    // blank), so it is dropped rather than shown as an empty button.
    variants: (beer.variants ?? []).flatMap((variant) => {
      const shortName = pickVariantName(variant, locale);
      if (!shortName || !variant.imageKey) return [];
      return [{ shortName, imageSrc: publicImageUrl(variant.imageKey) }];
    }),
  };
}
