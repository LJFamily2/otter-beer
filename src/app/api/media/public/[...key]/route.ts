import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/auth";
import { MODULE_KEYS } from "@/config/permissions";
import { storageService } from "@/lib/storage/StorageService";
import { BlogPostRepository } from "@/repositories/BlogPostRepository";
import { BeerRepository } from "@/repositories/BeerRepository";

export const dynamic = "force-dynamic";

const blogPostRepository = new BlogPostRepository();
const beerRepository = new BeerRepository();

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
 * Once past the gate, this redirects to the provider's own view URL rather
 * than fetching + streaming the bytes itself — with Cloudinary that means
 * the browser's actual image request goes straight to Cloudinary's CDN
 * (edge caching, f_auto/q_auto transforms) instead of round-tripping
 * through this server on every load.
 */
export async function GET(_request: NextRequest, context: RouteParams) {
  const { key: keyParts } = await context.params;
  const key = keyParts.join("/");

  const session = await auth();
  const canPreviewAsAdmin = Boolean(
    session?.user?.permissions?.[MODULE_KEYS.NEWS_BLOG]?.view ||
      session?.user?.permissions?.[MODULE_KEYS.BEERS]?.view
  );

  if (!canPreviewAsAdmin) {
    const [visibleAsPost, visibleAsBeer] = await Promise.all([
      blogPostRepository.isKeyPubliclyVisible(key),
      beerRepository.isKeyPubliclyVisible(key),
    ]);
    if (!visibleAsPost && !visibleAsBeer) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
  }

  const url = await storageService.getViewUrl(key);
  return NextResponse.redirect(url, {
    status: 302,
    headers: {
      // Object keys are per-upload random UUIDs (see StorageService.buildImageKey)
      // and never overwritten, so a key's content never changes — but the
      // redirect target itself could (e.g. a provider that hands back
      // short-lived signed URLs), so this caches the *gate decision* for an
      // hour rather than claiming the target is immutable.
      "Cache-Control": "public, max-age=3600",
    },
  });
}
