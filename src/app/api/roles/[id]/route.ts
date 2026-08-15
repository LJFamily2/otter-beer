import { NextResponse, type NextRequest } from "next/server";
import { RouteGuard } from "@/lib/auth/RouteGuard";
import { MODULE_KEYS } from "@/config/permissions";
import { roleService, RoleMutationError } from "@/services/RoleService";
import { UpdateRoleSchema } from "@/lib/validation/role";
import { withRateLimit } from "@/lib/rate-limit/withRateLimit";
import { mutationRateLimiter } from "@/lib/rate-limit/limiters";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export const PATCH = withRateLimit(
  mutationRateLimiter,
  RouteGuard.requirePermission<RouteParams>(
    MODULE_KEYS.ROLES_PERMISSIONS,
    "edit",
    async (request: NextRequest, context) => {
      const { id } = await context.params;
      const body = await request.json();
      const parsed = UpdateRoleSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Validation failed", details: parsed.error.flatten() },
          { status: 400 }
        );
      }

      const role = await roleService.rename(id, parsed.data.name);
      if (!role) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      return NextResponse.json(role);
    }
  ),
  "roles-write"
);

export const DELETE = withRateLimit(
  mutationRateLimiter,
  RouteGuard.requirePermission<RouteParams>(
    MODULE_KEYS.ROLES_PERMISSIONS,
    "delete",
    async (_request, context) => {
      const { id } = await context.params;
      try {
        await roleService.delete(id);
        return new NextResponse(null, { status: 204 });
      } catch (err) {
        if (err instanceof RoleMutationError) {
          return NextResponse.json({ error: err.message }, { status: 400 });
        }
        throw err;
      }
    }
  ),
  "roles-write"
);
