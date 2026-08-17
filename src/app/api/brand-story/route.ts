import { NextResponse, type NextRequest } from "next/server";
import { RouteGuard } from "@/lib/auth/RouteGuard";
import { MODULE_KEYS } from "@/config/permissions";
import { brandStoryService } from "@/services/BrandStoryService";
import { BrandStoryUpdateSchema } from "@/lib/validation/brandStory";
import { withRateLimit } from "@/lib/rate-limit/withRateLimit";
import { mutationRateLimiter } from "@/lib/rate-limit/limiters";

/**
 * Singleton resource — no [id] segment, unlike Beers/BlogPost. GET returns
 * the one Brand Story document's pages (empty array if never saved); PUT
 * replaces the whole pages array in one call, mirroring how PUT
 * /api/permissions replaces a whole role's matrix.
 */
export const GET = RouteGuard.requirePermission(
  MODULE_KEYS.BRAND_STORY,
  "view",
  async () => {
    const brandStory = await brandStoryService.get();
    return NextResponse.json({ pages: brandStory?.pages ?? [] });
  }
);

export const PUT = withRateLimit(
  mutationRateLimiter,
  RouteGuard.requirePermission(
    MODULE_KEYS.BRAND_STORY,
    "edit",
    async (request: NextRequest, _context, session) => {
      const body = await request.json();
      const parsed = BrandStoryUpdateSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại các thông tin bắt buộc.", details: parsed.error.flatten() },
          { status: 400 }
        );
      }

      const brandStory = await brandStoryService.replacePages(parsed.data, session.user.id);
      return NextResponse.json({ pages: brandStory.pages });
    }
  ),
  "brand-story-write"
);
