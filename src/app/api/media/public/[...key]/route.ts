import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/auth";
import { MODULE_KEYS } from "@/config/permissions";
import { storageService } from "@/lib/storage/StorageService";
import { BlogPostRepository } from "@/repositories/BlogPostRepository";

const blogPostRepository = new BlogPostRepository();

interface RouteParams {
  params: Promise<{ key: string[] }>;
}

/**
 * Image endpoint behind a dual gate — the R2 bucket itself stays private
 * (see docs/security.md), but this route needs to serve two different
 * audiences the same way:
 *  1. Public visitors: only images actually referenced by a *published*
 *     post (fast, cacheable, crawlable — required for SEO/social previews).
 *  2. Logged-in admins with news_blog view access: any key, so the Tiptap
 *     editor can preview inline/cover images on a post that isn't
 *     published yet.
 * Everything else (orphaned uploads, guesses) 404s either way.
 */
export async function GET(_request: NextRequest, context: RouteParams) {
  const { key: keyParts } = await context.params;
  const key = keyParts.join("/");

  const session = await auth();
  const canPreviewAsAdmin = Boolean(
    session?.user?.permissions?.[MODULE_KEYS.NEWS_BLOG]?.view
  );

  if (!canPreviewAsAdmin) {
    const visible = await blogPostRepository.isKeyPubliclyVisible(key);
    if (!visible) {
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
