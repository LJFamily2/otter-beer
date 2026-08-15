import { NextResponse, type NextRequest } from "next/server";
import { RouteGuard } from "@/lib/auth/RouteGuard";
import { MODULE_KEYS } from "@/config/permissions";
import { userService, UserMutationError } from "@/services/UserService";
import { InviteUserSchema } from "@/lib/validation/user";

export const GET = RouteGuard.requirePermission(
  MODULE_KEYS.USERS,
  "view",
  async () => {
    const users = await userService.list();
    return NextResponse.json(users);
  }
);

export const POST = RouteGuard.requirePermission(
  MODULE_KEYS.USERS,
  "add",
  async (request: NextRequest) => {
    const body = await request.json();
    const parsed = InviteUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    try {
      const user = await userService.invite(
        parsed.data.email,
        parsed.data.name,
        parsed.data.roleId
      );
      return NextResponse.json(user, { status: 201 });
    } catch (err) {
      if (err instanceof UserMutationError) {
        return NextResponse.json({ error: err.message }, { status: 409 });
      }
      throw err;
    }
  }
);
