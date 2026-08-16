import { RoleRepository } from "@/repositories/RoleRepository";
import { PermissionRepository } from "@/repositories/PermissionRepository";
import { canManageRole } from "@/config/roles";
import type { IRole } from "@/models/Role";

export class RoleMutationError extends Error {}

const HIERARCHY_ERROR =
  "You cannot manage a role at or above your own rank.";

/**
 * Roles are data (see src/models/Role.ts) so a superAdmin can add custom
 * roles beyond the three seeded ones without a code change. isSystem guards
 * the seeded superAdmin/admin/officeMember roles from being deleted or
 * having their key changed, so bootstrap and PermissionService's superAdmin
 * bypass (src/config/roles.ts) can never go stale.
 *
 * Every write also takes the acting user's roleLevel and enforces
 * canManageRole() — an actor can only create/rename/delete a role strictly
 * below their own rank (see src/config/roles.ts). A new role's level is
 * always computed server-side as actorLevel + 1, never accepted from the
 * client, so an actor can't self-promote by supplying a lower level.
 */
export class RoleService {
  constructor(
    private readonly roleRepository: RoleRepository = new RoleRepository(),
    private readonly permissionRepository: PermissionRepository = new PermissionRepository()
  ) {}

  async list(): Promise<IRole[]> {
    return this.roleRepository.listAll();
  }

  async create(key: string, name: string, actorLevel: number): Promise<IRole> {
    const normalizedKey = key.trim().toLowerCase();
    const existing = await this.roleRepository.findByKey(normalizedKey);
    if (existing) {
      throw new RoleMutationError(`Role key "${normalizedKey}" already exists`);
    }
    return this.roleRepository.create({
      key: normalizedKey,
      name,
      isSystem: false,
      level: actorLevel + 1,
    } as Partial<IRole>);
  }

  async rename(id: string, name: string, actorLevel: number): Promise<IRole | null> {
    const role = await this.roleRepository.findById(id);
    if (!role) return null;
    if (!canManageRole(actorLevel, role.level)) {
      throw new RoleMutationError(HIERARCHY_ERROR);
    }
    return this.roleRepository.updateById(id, { name });
  }

  async delete(id: string, actorLevel: number): Promise<void> {
    const role = await this.roleRepository.findById(id);
    if (!role) return;
    if (role.isSystem) {
      throw new RoleMutationError(
        "System roles (superAdmin/admin/officeMember) cannot be deleted"
      );
    }
    if (!canManageRole(actorLevel, role.level)) {
      throw new RoleMutationError(HIERARCHY_ERROR);
    }
    await this.permissionRepository.deleteByRole(id);
    await this.roleRepository.deleteById(id);
  }
}

export const roleService = new RoleService();
