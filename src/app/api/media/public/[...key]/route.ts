import { NextResponse, type NextRequest } from "next/server";
import { storageService } from "@/lib/storage/StorageService";
import { BlogPostRepository } from "@/repositories/BlogPostRepository";

const blogPostRepository = new BlogPostRepository();

interface RouteParams {
  params: Promise<{ key: string[] }>;
}

/**
 * Public, unauthenticated image endpoint — the R2 bucket itself stays
 * private (see docs/security.md), but published-post images need a fast,
 * cacheable, crawlable URL for SEO/social previews. This streams the
 * object through only if it's actually referenced by a published post;
 * everything else (draft cover images, orphaned uploads) 404s.
 */
export async function GET(_request: NextRequest, context: RouteParams) {
  const { key: keyParts } = await context.params;
  const key = keyParts.join("/");

  const visible = await blogPostRepository.isKeyPubliclyVisible(key);
  if (!visible) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
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
