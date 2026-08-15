import {
  MODULE_KEYS_LIST,
  noAccessGrant,
  fullAccessGrant,
  type ActionGrant,
  type ModuleKey,
  type PermissionAction,
} from "@/config/permissions";
import { isSuperAdminRoleKey } from "@/config/roles";
import { PermissionRepository } from "@/repositories/PermissionRepository";
import { RoleRepository } from "@/repositories/RoleRepository";

export type PermissionMatrix = Record<ModuleKey, ActionGrant>;

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
        matrix[row.moduleKey as ModuleKey] = { ...row.actions };
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
}

export const permissionService = new PermissionService();
