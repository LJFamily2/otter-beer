import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/auth";
import { MODULE_KEYS } from "@/config/permissions";
import { storageService } from "@/lib/storage/StorageService";
import { BlogPostRepository } from "@/repositories/BlogPostRepository";
import { BeerRepository } from "@/repositories/BeerRepository";
import { BrandStoryRepository } from "@/repositories/BrandStoryRepository";

export const dynamic = "force-dynamic";

const blogPostRepository = new BlogPostRepository();
const beerRepository = new BeerRepository();
const brandStoryRepository = new BrandStoryRepository();

interface RouteParams {
  params: Promise<{ key: string[] }>;
}

/**
 * Image endpoint behind a dual gate — access control needs to serve two
 * different audiences the same way regardless of which storage provider is
 * active:
 *  1. Public visitors: only images actually referenced by a *published*
 *     post/beer (fast, cacheable, crawlable — required for SEO/social
 *     previews).
 *  2. Logged-in admins with news_blog or beers view access: any key, so
 *     the Tiptap editor / BeerForm can preview images that aren't
 *     published yet.
 * Everything else (orphaned uploads, guesses) 404s either way.
 *
 * Streams the bytes rather than redirecting to the provider's view URL —
 * a redirect was tried (to let the browser hit Cloudinary's CDN directly)
 * but broke every page using next/image's <Image>: Next's built-in image
 * optimizer fetches `src` server-side and, for SSRF-safety, does not
 * follow redirects, so a 302's empty body was logged as "internal image
 * response is empty" and rendered as a broken image. Streaming is the one
 * response shape that works for both next/image and plain <img> callers
 * (e.g. ImageUploadField's admin preview) — and next/image already does
 * its own resizing/format-negotiation/caching on top of this anyway, so
 * the loss versus a direct CDN redirect is small.
 */
export async function GET(_request: NextRequest, context: RouteParams) {
  const { key: keyParts } = await context.params;
  const key = keyParts.join("/");

  const session = await auth();
  const canPreviewAsAdmin = Boolean(
    session?.user?.permissions?.[MODULE_KEYS.NEWS_BLOG]?.view ||
      session?.user?.permissions?.[MODULE_KEYS.BEERS]?.view ||
      session?.user?.permissions?.[MODULE_KEYS.BRAND_STORY]?.view
  );

  if (!canPreviewAsAdmin) {
    const [visibleAsPost, visibleAsBeer, visibleAsBrandStoryPage] = await Promise.all([
      blogPostRepository.isKeyPubliclyVisible(key),
      beerRepository.isKeyPubliclyVisible(key),
      brandStoryRepository.isKeyPubliclyVisible(key),
    ]);
    if (!visibleAsPost && !visibleAsBeer && !visibleAsBrandStoryPage) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
  }

  const object = await storageService.getObject(key);
  if (!object) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return new NextResponse(Buffer.from(object.body), {
    headers: {
      "Content-Type": object.contentType,
      // Object keys are per-upload random UUIDs (see StorageService.buildImageKey)
      // and never overwritten, so a key's content never changes — safe to
      // cache aggressively at the browser and any CDN in front of this route.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
