import { NextResponse, type NextRequest } from "next/server";
import { RouteGuard } from "@/lib/auth/RouteGuard";
import { MODULE_KEYS } from "@/config/permissions";
import {
  blogPostService,
  SlugConflictError,
} from "@/services/BlogPostService";
import { BlogPostUpdateSchema } from "@/lib/validation/blogPost";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export const GET = RouteGuard.requirePermission<RouteParams>(
  MODULE_KEYS.NEWS_BLOG,
  "view",
  async (_request, context) => {
    const { id } = await context.params;
    const post = await blogPostService.getById(id);
    if (!post) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(post);
  }
);

export const PATCH = RouteGuard.requirePermission<RouteParams>(
  MODULE_KEYS.NEWS_BLOG,
  "edit",
  async (request: NextRequest, context, session) => {
    const { id } = await context.params;
    const body = await request.json();
    const parsed = BlogPostUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    try {
      const post = await blogPostService.update(
        id,
        parsed.data,
        session.user.id
      );
      if (!post) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      return NextResponse.json(post);
    } catch (err) {
      if (err instanceof SlugConflictError) {
        return NextResponse.json({ error: err.message }, { status: 409 });
      }
      throw err;
    }
  }
);

export const DELETE = RouteGuard.requirePermission<RouteParams>(
  MODULE_KEYS.NEWS_BLOG,
  "delete",
  async (_request, context) => {
    const { id } = await context.params;
    const deleted = await blogPostService.delete(id);
    if (!deleted) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return new NextResponse(null, { status: 204 });
  }
);
