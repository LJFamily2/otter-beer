import { DEFAULT_LOCALE } from "@/config/locales";
import type { IBlogPost, IBlogPostTranslation } from "@/models/BlogPost";

/**
 * Picks the translation to render for a given locale, falling back to the
 * default locale (Vietnamese is required on every post) and then to
 * whatever exists — English is optional, so a vi-only post must still
 * render on the /en tree instead of disappearing.
 */
export function pickTranslation(
  post: Pick<IBlogPost, "translations">,
  locale: string
): IBlogPostTranslation | null {
  return (
    post.translations.find((t) => t.locale === locale) ??
    post.translations.find((t) => t.locale === DEFAULT_LOCALE) ??
    post.translations[0] ??
    null
  );
}
