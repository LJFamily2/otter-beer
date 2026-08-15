import { NextResponse, type NextRequest } from "next/server";
import { RouteGuard } from "@/lib/auth/RouteGuard";
import { MODULE_KEYS } from "@/config/permissions";
import { storageService } from "@/lib/storage/StorageService";
import { RequestUploadSchema } from "@/lib/validation/media";

// Image uploads are shared by any content editing flow — grant on either
// "add" or "edit" of news_blog (the only module with images today).
export const POST = RouteGuard.requireAuth(
  async (request: NextRequest, _context, session) => {
    const grant = session.user.permissions?.[MODULE_KEYS.NEWS_BLOG];
    if (!grant?.add && !grant?.edit) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = RequestUploadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const upload = await storageService.requestImageUpload(
      "news-blog",
      parsed.data.contentType
    );
    return NextResponse.json(upload);
  }
);
