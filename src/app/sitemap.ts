import type { MetadataRoute } from "next";
import { env } from "@/lib/env";
import { SUPPORTED_LOCALE_CODES } from "@/config/locales";
import { localizedPath } from "@/lib/seo";
import { blogPostService } from "@/services/BlogPostService";

const MAX_SITEMAP_POSTS = 5000;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");

  const staticEntries: MetadataRoute.Sitemap = SUPPORTED_LOCALE_CODES.flatMap(
    (locale) => [
      { url: `${siteUrl}${localizedPath(locale, "/")}`, priority: 1 },
      { url: `${siteUrl}${localizedPath(locale, "/blog")}`, priority: 0.8 },
    ]
  );

  try {
    const { items: posts } = await blogPostService.listPublished({
      page: 1,
      pageSize: MAX_SITEMAP_POSTS,
    });

    const postEntries: MetadataRoute.Sitemap = posts.flatMap((post) =>
      post.translations.map((translation) => ({
        url: `${siteUrl}${localizedPath(translation.locale, `/blog/${translation.slug}`)}`,
        lastModified: post.updatedAt,
        priority: 0.6,
      }))
    );

    return [...staticEntries, ...postEntries];
  } catch {
    return staticEntries;
  }
}
