/**
 * The three built-in roles requested for OtterBeer. These are seeded into the
 * `roles` collection by scripts/seed.ts and are protected from deletion
 * (Role.isSystem = true) so the app can never be left without an admin tier.
 *
 * The role *system* itself is still data-driven (see src/models/Role.ts) —
 * a superAdmin can create additional custom roles later from the admin UI
 * without any code change. These constants exist so code that must reason
 * about the built-in roles (bootstrap, seeding, "is this the super admin"
 * checks) has a single source of truth instead of magic strings.
 */

export const SYSTEM_ROLE_KEYS = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  OFFICE_MEMBER: "office_member",
} as const;

export type SystemRoleKey =
  (typeof SYSTEM_ROLE_KEYS)[keyof typeof SYSTEM_ROLE_KEYS];

export const SYSTEM_ROLE_LABELS_VI: Record<SystemRoleKey, string> = {
  [SYSTEM_ROLE_KEYS.SUPER_ADMIN]: "Quản trị viên cấp cao",
  [SYSTEM_ROLE_KEYS.ADMIN]: "Quản trị viên",
  [SYSTEM_ROLE_KEYS.OFFICE_MEMBER]: "Nhân viên văn phòng",
};

/**
 * The super admin always has full access to every module and action and is
 * never checked against the Permission matrix — this prevents a misconfigured
 * matrix from locking every admin out of the system. See PermissionService.
 */
export function isSuperAdminRoleKey(key: string): boolean {
  return key === SYSTEM_ROLE_KEYS.SUPER_ADMIN;
}
