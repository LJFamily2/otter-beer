import { NextResponse, type NextRequest } from "next/server";
import { RouteGuard } from "@/lib/auth/RouteGuard";
import { MODULE_KEYS } from "@/config/permissions";
import { userService, UserMutationError } from "@/services/UserService";
import { UpdateUserSchema } from "@/lib/validation/user";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export const PATCH = RouteGuard.requirePermission<RouteParams>(
  MODULE_KEYS.USERS,
  "edit",
  async (request: NextRequest, context, session) => {
    const { id } = await context.params;

    if (id === session.user.id) {
      return NextResponse.json(
        { error: "You cannot change your own role or access." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const parsed = UpdateUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    try {
      let user = null;
      if (parsed.data.roleId !== undefined) {
        user = await userService.updateRole(id, parsed.data.roleId);
      }
      if (parsed.data.isActive !== undefined) {
        user = await userService.setActive(id, parsed.data.isActive);
      }
      if (!user) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      return NextResponse.json(user);
    } catch (err) {
      if (err instanceof UserMutationError) {
        return NextResponse.json({ error: err.message }, { status: 400 });
      }
      throw err;
    }
  }
);

export const DELETE = RouteGuard.requirePermission<RouteParams>(
  MODULE_KEYS.USERS,
  "delete",
  async (_request, context, session) => {
    const { id } = await context.params;

    if (id === session.user.id) {
      return NextResponse.json(
        { error: "You cannot remove your own access." },
        { status: 400 }
      );
    }

    const deleted = await userService.delete(id);
    if (!deleted) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return new NextResponse(null, { status: 204 });
  }
);
