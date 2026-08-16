import { NextResponse, type NextRequest } from "next/server";
import { RouteGuard } from "@/lib/auth/RouteGuard";
import { MODULE_KEYS } from "@/config/permissions";
import { storageService } from "@/lib/storage/StorageService";
import { RequestViewUrlSchema } from "@/lib/validation/media";

export const POST = RouteGuard.requireAuth(
  async (request: NextRequest, _context, session) => {
    const grant = session.user.permissions?.[MODULE_KEYS.NEWS_BLOG];
    if (!grant?.view) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = RequestViewUrlSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const url = await storageService.getViewUrl(parsed.data.key);
    return NextResponse.json({ url });
  }
);
