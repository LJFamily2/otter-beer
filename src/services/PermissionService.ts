import {
  MODULE_KEYS_LIST,
  noAccessGrant,
  fullAccessGrant,
  type ActionGrant,
  type ModuleKey,
  type PermissionAction,
} from "@/config/permissions";
import { isSuperAdminRoleKey, canManageRole } from "@/config/roles";
import { PermissionRepository } from "@/repositories/PermissionRepository";
import { RoleRepository } from "@/repositories/RoleRepository";

export type PermissionMatrix = Record<ModuleKey, ActionGrant>;

export class PermissionMutationError extends Error {}

function emptyMatrix(): PermissionMatrix {
  return MODULE_KEYS_LIST.reduce((acc, key) => {
    acc[key] = noAccessGrant();
    return acc;
  }, {} as PermissionMatrix);
}

function fullMatrix(): PermissionMatrix {
  return MODULE_KEYS_LIST.reduce((acc, key) => {
    acc[key] = fullAccessGrant();
    return acc;
  }, {} as PermissionMatrix);
}

/**
 * Resolves what a role can do, module by module. The superAdmin role always
 * gets a full grant and never touches the Permission collection — this is a
 * deliberate safety valve so a bad edit to the matrix can never lock every
 * admin out of the app (see src/config/roles.ts).
 */
export class PermissionService {
  constructor(
    private readonly roleRepository: RoleRepository = new RoleRepository(),
    private readonly permissionRepository: PermissionRepository = new PermissionRepository()
  ) {}

  async getMatrixForRoleKey(roleKey: string): Promise<PermissionMatrix> {
    if (isSuperAdminRoleKey(roleKey)) {
      return fullMatrix();
    }

    const role = await this.roleRepository.findByKey(roleKey);
    if (!role) {
      return emptyMatrix();
    }

    return this.getMatrixForRoleId(String(role._id));
  }

  async getMatrixForRoleId(roleId: string): Promise<PermissionMatrix> {
    const rows = await this.permissionRepository.findByRole(roleId);
    const matrix = emptyMatrix();
    for (const row of rows) {
      if ((MODULE_KEYS_LIST as readonly string[]).includes(row.moduleKey)) {
        // row.actions is a Mongoose subdocument, not a plain object — a
        // shallow spread copies its internal bookkeeping (incl. a $__parent
        // back-reference to this same row), producing a self-referential
        // object. That's invisible to JSON.stringify (Mongoose documents
        // define toJSON, which JSON.stringify calls automatically) but not
        // to React's RSC flight serializer, which walks raw properties and
        // recurses forever on the cycle. Picking the known fields keeps this
        // a genuinely plain object.
        const actions = row.actions;
        matrix[row.moduleKey as ModuleKey] = {
          access: actions.access,
          view: actions.view,
          add: actions.add,
          edit: actions.edit,
          delete: actions.delete,
        };
      }
    }
    return matrix;
  }

  async can(
    roleKey: string,
    moduleKey: ModuleKey,
    action: PermissionAction
  ): Promise<boolean> {
    if (isSuperAdminRoleKey(roleKey)) return true;
    const matrix = await this.getMatrixForRoleKey(roleKey);
    return Boolean(matrix[moduleKey]?.[action]);
  }

  /**
   * Bulk-writes one role's full matrix, row by row. Guards mirror
   * RoleService: superAdmin's matrix is never editable (it's hardcoded to
   * full access regardless of stored rows — see getMatrixForRoleKey), and
   * the actor must outrank the target role (see config/roles.ts's
   * canManageRole()).
   */
  async setMatrixForRole(
    roleId: string,
    grants: { moduleKey: ModuleKey; actions: ActionGrant }[],
    actorLevel: number
  ): Promise<PermissionMatrix> {
    const role = await this.roleRepository.findById(roleId);
    if (!role) {
      throw new PermissionMutationError("Role not found");
    }
    if (isSuperAdminRoleKey(role.key)) {
      throw new PermissionMutationError(
        "superAdmin always has full access and cannot be edited."
      );
    }
    if (!canManageRole(actorLevel, role.level)) {
      throw new PermissionMutationError(
        "You cannot manage a role at or above your own rank."
      );
    }

    for (const grant of grants) {
      await this.permissionRepository.upsertGrant(
        roleId,
        grant.moduleKey,
        grant.actions
      );
    }
    return this.getMatrixForRoleId(roleId);
  }
}

export const permissionService = new PermissionService();
