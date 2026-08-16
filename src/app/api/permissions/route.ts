import { NextResponse, type NextRequest } from "next/server";
import { RouteGuard } from "@/lib/auth/RouteGuard";
import { MODULE_KEYS, type ModuleKey, type ActionGrant } from "@/config/permissions";
import { permissionService, PermissionMutationError } from "@/services/PermissionService";
import { UpdatePermissionMatrixSchema } from "@/lib/validation/permission";
import { withRateLimit } from "@/lib/rate-limit/withRateLimit";
import { mutationRateLimiter } from "@/lib/rate-limit/limiters";

export const GET = RouteGuard.requirePermission(
  MODULE_KEYS.ROLES_PERMISSIONS,
  "view",
  async (request: NextRequest) => {
    const roleId = request.nextUrl.searchParams.get("roleId");
    if (!roleId) {
      return NextResponse.json(
        { error: "roleId query param is required" },
        { status: 400 }
      );
    }
    const matrix = await permissionService.getMatrixForRoleId(roleId);
    return NextResponse.json({ roleId, matrix });
  }
);

// Bulk-writes one role's full matrix row-by-row. setMatrixForRole() guards
// both the superAdmin-is-never-editable rule and the role-hierarchy rule
// (the acting user must outrank the target role — see config/roles.ts's
// canManageRole()).
export const PUT = withRateLimit(
  mutationRateLimiter,
  RouteGuard.requirePermission(
    MODULE_KEYS.ROLES_PERMISSIONS,
    "edit",
    async (request: NextRequest, _context, session) => {
      const body = await request.json();
      const parsed = UpdatePermissionMatrixSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Validation failed", details: parsed.error.flatten() },
          { status: 400 }
        );
      }

      try {
        // UpdatePermissionMatrixSchema's moduleKey enum is built from
        // MODULE_KEYS_LIST via a runtime cast (see lib/validation/
        // permission.ts), so Zod only infers it as `string` — safe to
        // assert here since the schema already validated it's one of the
        // known module keys.
        const grants = parsed.data.grants as {
          moduleKey: ModuleKey;
          actions: ActionGrant;
        }[];
        const matrix = await permissionService.setMatrixForRole(
          parsed.data.roleId,
          grants,
          session.user.roleLevel
        );
        return NextResponse.json({ roleId: parsed.data.roleId, matrix });
      } catch (err) {
        if (err instanceof PermissionMutationError) {
          const status = err.message === "Role not found" ? 404 : 403;
          return NextResponse.json({ error: err.message }, { status });
        }
        throw err;
      }
    }
  ),
  "permissions-write"
);
