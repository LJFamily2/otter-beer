import { Types } from "mongoose";
import { UserRepository } from "@/repositories/UserRepository";
import { RoleRepository } from "@/repositories/RoleRepository";
import type { IUser } from "@/models/User";

export class UserMutationError extends Error {}

export class UserService {
  constructor(
    private readonly userRepository: UserRepository = new UserRepository(),
    private readonly roleRepository: RoleRepository = new RoleRepository()
  ) {}

  async list(): Promise<IUser[]> {
    return this.userRepository.listAllWithRole();
  }

  /** Adds an email to the login allowlist with an assigned role. */
  async invite(email: string, name: string, roleId: string): Promise<IUser> {
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await this.userRepository.findByEmail(normalizedEmail);
    if (existing) {
      throw new UserMutationError(`${normalizedEmail} already has access`);
    }
    const role = await this.roleRepository.findById(roleId);
    if (!role) {
      throw new UserMutationError("Role not found");
    }
    return this.userRepository.create({
      email: normalizedEmail,
      name,
      roleId: new Types.ObjectId(roleId),
      isActive: true,
    });
  }

  async updateRole(id: string, roleId: string): Promise<IUser | null> {
    const role = await this.roleRepository.findById(roleId);
    if (!role) {
      throw new UserMutationError("Role not found");
    }
    return this.userRepository.updateById(id, { roleId });
  }

  /** `isActive: false` revokes access without deleting the user (audit trail intact). */
  async setActive(id: string, isActive: boolean): Promise<IUser | null> {
    return this.userRepository.updateById(id, { isActive });
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await this.userRepository.deleteById(id);
    return Boolean(deleted);
  }
}

export const userService = new UserService();
