import { NextResponse, type NextRequest } from "next/server";
import { RouteGuard } from "@/lib/auth/RouteGuard";
import { MODULE_KEYS } from "@/config/permissions";
import { permissionService } from "@/services/PermissionService";
import { PermissionRepository } from "@/repositories/PermissionRepository";
import { RoleRepository } from "@/repositories/RoleRepository";
import { UpdatePermissionMatrixSchema } from "@/lib/validation/permission";
import { withRateLimit } from "@/lib/rate-limit/withRateLimit";
import { mutationRateLimiter } from "@/lib/rate-limit/limiters";

const permissionRepository = new PermissionRepository();
const roleRepository = new RoleRepository();

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

// Bulk-writes one role's full matrix row-by-row. The superAdmin role is
// intentionally not editable here — it always has full access
// (see PermissionService / src/config/roles.ts) and editing it would be a
// no-op that could confuse admins into thinking they can restrict it.
export const PUT = withRateLimit(
  mutationRateLimiter,
  RouteGuard.requirePermission(
    MODULE_KEYS.ROLES_PERMISSIONS,
    "edit",
    async (request: NextRequest) => {
      const body = await request.json();
      const parsed = UpdatePermissionMatrixSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Validation failed", details: parsed.error.flatten() },
          { status: 400 }
        );
      }

      const role = await roleRepository.findById(parsed.data.roleId);
      if (!role) {
        return NextResponse.json({ error: "Role not found" }, { status: 404 });
      }
      if (role.key === "super_admin") {
        return NextResponse.json(
          { error: "superAdmin always has full access and cannot be edited." },
          { status: 400 }
        );
      }

      for (const grant of parsed.data.grants) {
        await permissionRepository.upsertGrant(
          parsed.data.roleId,
          grant.moduleKey,
          grant.actions
        );
      }

      const matrix = await permissionService.getMatrixForRoleId(
        parsed.data.roleId
      );
      return NextResponse.json({ roleId: parsed.data.roleId, matrix });
    }
  ),
  "permissions-write"
);
