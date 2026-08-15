import { RoleRepository } from "@/repositories/RoleRepository";
import { PermissionRepository } from "@/repositories/PermissionRepository";
import type { IRole } from "@/models/Role";

export class RoleMutationError extends Error {}

/**
 * Roles are data (see src/models/Role.ts) so a superAdmin can add custom
 * roles beyond the three seeded ones without a code change. isSystem guards
 * the seeded superAdmin/admin/officeMember roles from being deleted or
 * having their key changed, so bootstrap and PermissionService's superAdmin
 * bypass (src/config/roles.ts) can never go stale.
 */
export class RoleService {
  constructor(
    private readonly roleRepository: RoleRepository = new RoleRepository(),
    private readonly permissionRepository: PermissionRepository = new PermissionRepository()
  ) {}

  async list(): Promise<IRole[]> {
    return this.roleRepository.listAll();
  }

  async create(key: string, name: string): Promise<IRole> {
    const normalizedKey = key.trim().toLowerCase();
    const existing = await this.roleRepository.findByKey(normalizedKey);
    if (existing) {
      throw new RoleMutationError(`Role key "${normalizedKey}" already exists`);
    }
    return this.roleRepository.create({
      key: normalizedKey,
      name,
      isSystem: false,
    } as Partial<IRole>);
  }

  async rename(id: string, name: string): Promise<IRole | null> {
    return this.roleRepository.updateById(id, { name });
  }

  async delete(id: string): Promise<void> {
    const role = await this.roleRepository.findById(id);
    if (!role) return;
    if (role.isSystem) {
      throw new RoleMutationError(
        "System roles (superAdmin/admin/officeMember) cannot be deleted"
      );
    }
    await this.permissionRepository.deleteByRole(id);
    await this.roleRepository.deleteById(id);
  }
}

export const roleService = new RoleService();
