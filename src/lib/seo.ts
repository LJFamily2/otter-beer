import type { Metadata } from "next";
import { env } from "@/lib/env";
import { publicImageUrl } from "@/lib/storage/constants";
import { DEFAULT_LOCALE, SUPPORTED_LOCALE_CODES } from "@/config/locales";
import type { IBlogPost, IBlogPostTranslation } from "@/models/BlogPost";

function siteUrl(): string {
  return env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
}

/** vi (default) has no prefix; every other locale is /{locale}/... */
export function localizedPath(locale: string, path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return locale === DEFAULT_LOCALE ? cleanPath : `/${locale}${cleanPath}`;
}

function absoluteUrl(locale: string, path: string): string {
  return `${siteUrl()}${localizedPath(locale, path)}`;
}

/** hreflang alternates for every language a post actually has, keyed by locale -> that language's own slug. */
function hreflangAlternates(
  post: Pick<IBlogPost, "translations">,
  buildPath: (slug: string) => string
): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of SUPPORTED_LOCALE_CODES) {
    const translation = post.translations.find((t) => t.locale === locale);
    if (translation) {
      languages[locale] = absoluteUrl(locale, buildPath(translation.slug));
    }
  }
  return languages;
}

export function buildBlogListMetadata(locale: string): Metadata {
  const isVi = locale === "vi";
  const title = isVi
    ? "Biên niên sử Otter — Tin tức & Blog"
    : "The Otter Chronicles — News & Blog";
  const description = isVi
    ? "Câu chuyện từ vùng biển, cập nhật từ nhà máy bia, và những góc nhìn sâu về quy trình chế biến của chúng tôi."
    : "Tales from the coastal waters, brewery updates, and deep dives into our crafting process.";
  const canonical = absoluteUrl(locale, "/blog");

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        vi: absoluteUrl("vi", "/blog"),
        en: absoluteUrl("en", "/blog"),
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      siteName: "Otter Beer",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export function buildBlogPostMetadata(
  post: IBlogPost,
  locale: string,
  translation: IBlogPostTranslation
): Metadata {
  const title = translation.seoTitle || translation.title;
  const description = translation.seoDescription || translation.excerpt;
  const canonical = absoluteUrl(locale, `/blog/${translation.slug}`);
  const imageKey = translation.ogImageKey || post.coverImageKey;
  const images = imageKey ? [{ url: publicImageUrl(imageKey) }] : undefined;

  return {
    title,
    description,
    keywords: translation.seoKeywords.length
      ? translation.seoKeywords
      : undefined,
    alternates: {
      canonical,
      languages: hreflangAlternates(post, (slug) => `/blog/${slug}`),
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "article",
      siteName: "Otter Beer",
      images,
      publishedTime: post.publishedAt?.toISOString(),
    },
    twitter: {
      card: images ? "summary_large_image" : "summary",
      title,
      description,
      images: images?.map((i) => i.url),
    },
  };
}

/** schema.org BlogPosting JSON-LD — render as a <script type="application/ld+json"> in the page. */
export function buildArticleJsonLd(
  post: IBlogPost,
  locale: string,
  translation: IBlogPostTranslation,
  authorName: string
): Record<string, unknown> {
  const imageKey = translation.ogImageKey || post.coverImageKey;

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: translation.title,
    description: translation.excerpt,
    image: imageKey ? [publicImageUrl(imageKey)] : undefined,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: { "@type": "Person", name: authorName },
    publisher: {
      "@type": "Organization",
      name: "Otter Beer",
      url: siteUrl(),
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": absoluteUrl(locale, `/blog/${translation.slug}`),
    },
    keywords: translation.seoKeywords.length
      ? translation.seoKeywords.join(", ")
      : undefined,
  };
}
