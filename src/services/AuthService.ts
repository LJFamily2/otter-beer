import { env } from "@/lib/env";
import { SYSTEM_ROLE_KEYS } from "@/config/roles";
import { UserRepository } from "@/repositories/UserRepository";
import { RoleRepository } from "@/repositories/RoleRepository";
import type { IUser } from "@/models/User";

export interface GoogleProfileInput {
  email: string;
  name: string;
  image?: string;
}

export type SignInDecision =
  | { allowed: true; user: IUser }
  | { allowed: false; reason: "not_invited" | "deactivated" };

/**
 * Owns the login allowlist rule: only emails already created as a User
 * document (via invite, or the one-time superAdmin bootstrap) may sign in,
 * even with a fully valid Google account. See docs/authentication.md.
 */
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository = new UserRepository(),
    private readonly roleRepository: RoleRepository = new RoleRepository()
  ) {}

  async handleSignIn(profile: GoogleProfileInput): Promise<SignInDecision> {
    const email = profile.email.trim().toLowerCase();
    let user = await this.userRepository.findByEmail(email);

    if (!user) {
      user = await this.tryBootstrapSuperAdmin(profile);
    }

    if (!user) {
      return { allowed: false, reason: "not_invited" };
    }

    if (!user.isActive) {
      return { allowed: false, reason: "deactivated" };
    }

    // Keep profile fields fresh from Google (name/photo can change there).
    if (user.name !== profile.name || user.image !== profile.image) {
      user.name = profile.name;
      if (profile.image) user.image = profile.image;
      await user.save();
    }

    await this.userRepository.touchLastLogin(String(user._id));
    return { allowed: true, user };
  }

  /**
   * The user allowlist starts empty, so the very first login needs a way in.
   * If FIRST_SUPER_ADMIN_EMAIL is set and no user exists yet for that email,
   * that sign-in creates the superAdmin account. Unset the env var afterward
   * — it only matters on an empty users collection.
   */
  private async tryBootstrapSuperAdmin(
    profile: GoogleProfileInput
  ): Promise<IUser | null> {
    const bootstrapEmail = env.FIRST_SUPER_ADMIN_EMAIL?.trim().toLowerCase();
    const email = profile.email.trim().toLowerCase();
    if (!bootstrapEmail || bootstrapEmail !== email) {
      return null;
    }

    const superAdminRole = await this.roleRepository.findByKey(
      SYSTEM_ROLE_KEYS.SUPER_ADMIN
    );
    if (!superAdminRole) {
      throw new Error(
        "superAdmin role not found — run `pnpm run seed` before the first login."
      );
    }

    return this.userRepository.create({
      email,
      name: profile.name,
      image: profile.image,
      roleId: superAdminRole._id,
      isActive: true,
    } as Partial<IUser>);
  }

  async getUserWithRoleKey(
    email: string
  ): Promise<{ user: IUser; roleKey: string } | null> {
    const user = await this.userRepository.findByEmailWithRole(email);
    if (!user) return null;
    const role = user.roleId as unknown as { key: string };
    return { user, roleKey: role.key };
  }
}

export const authService = new AuthService();
