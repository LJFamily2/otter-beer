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
import { UserRepository } from "@/repositories/UserRepository";
import type { IPermission } from "@/models/Permission";

export type PermissionMatrix = Record<ModuleKey, ActionGrant>;

export interface EffectiveUserMatrix {
  matrix: PermissionMatrix;
  isCustom: boolean;
}

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

function parseRowsToMatrix(rows: IPermission[]): PermissionMatrix {
  const matrix = emptyMatrix();
  for (const row of rows) {
    if ((MODULE_KEYS_LIST as readonly string[]).includes(row.moduleKey)) {
      // Pick known fields to keep it a plain object (prevents Mongoose cycle in React RSC)
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

/**
 * Resolves permissions in a Hybrid Access Control architecture:
 * 1. Role Defaults: Baseline permissions configured per Role.
 * 2. User Overrides: Custom permission overrides set for an individual User.
 * 3. superAdmin Bypass: Hardcoded safety valve so superAdmins are never locked out.
 */
export class PermissionService {
  constructor(
    private readonly permissionRepository: PermissionRepository = new PermissionRepository(),
    private readonly roleRepository: RoleRepository = new RoleRepository(),
    private readonly userRepository: UserRepository = new UserRepository()
  ) {}

  /** Resolves role baseline defaults by role ID. */
  async getMatrixForRoleId(roleId: string): Promise<PermissionMatrix> {
    const rows = await this.permissionRepository.findByRole(roleId);
    return parseRowsToMatrix(rows);
  }

  /** Resolves role baseline defaults by role key. */
  async getMatrixForRoleKey(roleKey: string): Promise<PermissionMatrix> {
    if (isSuperAdminRoleKey(roleKey)) {
      return fullMatrix();
    }
    const role = await this.roleRepository.findByKey(roleKey);
    if (!role) return emptyMatrix();
    return this.getMatrixForRoleId(String(role._id));
  }

  /**
   * Resolves effective matrix for a user.
   * - If user has custom overrides, uses user matrix (`isCustom: true`).
   * - Otherwise, inherits their role's default matrix (`isCustom: false`).
   */
  async getMatrixForUser(
    userId: string,
    roleKey?: string
  ): Promise<EffectiveUserMatrix> {
    // 1. Check if user has custom overrides
    const userRows = (await this.permissionRepository.findByUser(userId)) || [];
    if (userRows.length > 0) {
      return { matrix: parseRowsToMatrix(userRows), isCustom: true };
    }

    // 2. Resolve role key if not provided
    let resolvedRoleKey = roleKey;
    if (!resolvedRoleKey) {
      const user = await this.userRepository.findByIdWithRole(userId);
      if (!user) {
        return { matrix: emptyMatrix(), isCustom: false };
      }
      const role = user.roleId as unknown as { key: string };
      resolvedRoleKey = role.key;
    }

    if (isSuperAdminRoleKey(resolvedRoleKey)) {
      return { matrix: fullMatrix(), isCustom: false };
    }

    // 3. Fall back to role baseline defaults
    const roleMatrix = await this.getMatrixForRoleKey(resolvedRoleKey);
    return { matrix: roleMatrix, isCustom: false };
  }

  async can(
    userId: string,
    roleKey: string,
    moduleKey: ModuleKey,
    action: PermissionAction
  ): Promise<boolean> {
    if (isSuperAdminRoleKey(roleKey)) return true;
    const { matrix } = await this.getMatrixForUser(userId, roleKey);
    return Boolean(matrix[moduleKey]?.[action]);
  }

  /** Bulk-writes role default matrix rows. */
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
      await this.permissionRepository.upsertRoleGrant(
        roleId,
        grant.moduleKey,
        grant.actions
      );
    }
    return this.getMatrixForRoleId(roleId);
  }

  /** Bulk-writes custom per-user override matrix rows. */
  async setMatrixForUser(
    userId: string,
    grants: { moduleKey: ModuleKey; actions: ActionGrant }[],
    actorLevel: number
  ): Promise<EffectiveUserMatrix> {
    const user = await this.userRepository.findByIdWithRole(userId);
    if (!user) {
      throw new PermissionMutationError("User not found");
    }
    const role = user.roleId as unknown as { key: string; level: number };
    if (isSuperAdminRoleKey(role.key)) {
      throw new PermissionMutationError(
        "superAdmin always has full access and cannot be edited."
      );
    }
    if (!canManageRole(actorLevel, role.level)) {
      throw new PermissionMutationError(
        "You cannot manage permissions for a user whose role is at or above your own rank."
      );
    }

    for (const grant of grants) {
      await this.permissionRepository.upsertUserGrant(
        userId,
        grant.moduleKey,
        grant.actions
      );
    }
    return this.getMatrixForUser(userId, role.key);
  }

  /** Removes custom overrides for a user, reverting them to their role defaults. */
  async resetUserToRoleDefaults(
    userId: string,
    actorLevel: number
  ): Promise<EffectiveUserMatrix> {
    const user = await this.userRepository.findByIdWithRole(userId);
    if (!user) {
      throw new PermissionMutationError("User not found");
    }
    const role = user.roleId as unknown as { key: string; level: number };
    if (isSuperAdminRoleKey(role.key)) {
      throw new PermissionMutationError(
        "superAdmin always has full access and cannot be edited."
      );
    }
    if (!canManageRole(actorLevel, role.level)) {
      throw new PermissionMutationError(
        "You cannot manage permissions for a user whose role is at or above your own rank."
      );
    }

    await this.permissionRepository.deleteByUser(userId);
    return this.getMatrixForUser(userId, role.key);
  }

  async deleteForUser(userId: string): Promise<void> {
    await this.permissionRepository.deleteByUser(userId);
  }

  async deleteForRole(roleId: string): Promise<void> {
    await this.permissionRepository.deleteByRole(roleId);
  }
}

export const permissionService = new PermissionService();
