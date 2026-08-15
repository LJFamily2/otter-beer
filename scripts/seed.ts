/**
 * Seeds the three system roles and their default permission matrix.
 * Safe to re-run — every write is an upsert.
 *
 *   pnpm run seed        (dev DB — .env.local + .env.development.local)
 *   pnpm run seed:prod   (prod DB — .env.local + .env.production.local)
 *
 * Run this once before the first login. The first superAdmin account is
 * NOT created here — it is created automatically the first time
 * FIRST_SUPER_ADMIN_EMAIL signs in with Google (see src/services/AuthService.ts).
 */
import mongoose from "mongoose";
import { Database } from "../src/lib/db/mongodb";
import { env } from "../src/lib/env";
import { RoleModel } from "../src/models/Role";
import { PermissionModel } from "../src/models/Permission";
import {
  SYSTEM_ROLE_KEYS,
  SYSTEM_ROLE_LABELS_VI,
  type SystemRoleKey,
} from "../src/config/roles";
import {
  MODULE_KEYS,
  fullAccessGrant,
  noAccessGrant,
  type ActionGrant,
  type ModuleKey,
} from "../src/config/permissions";

type DefaultMatrix = Partial<Record<ModuleKey, ActionGrant>>;

const DEFAULT_MATRICES: Record<SystemRoleKey, DefaultMatrix> = {
  // Seeded with explicit full-access rows even though PermissionService
  // bypasses the DB for superAdmin at runtime — this keeps the admin
  // permission-matrix screen (which reads rows by roleId) showing an
  // accurate "everything checked" instead of looking empty.
  [SYSTEM_ROLE_KEYS.SUPER_ADMIN]: {
    [MODULE_KEYS.NEWS_BLOG]: fullAccessGrant(),
    [MODULE_KEYS.USERS]: fullAccessGrant(),
    [MODULE_KEYS.ROLES_PERMISSIONS]: fullAccessGrant(),
  },
  [SYSTEM_ROLE_KEYS.ADMIN]: {
    [MODULE_KEYS.NEWS_BLOG]: fullAccessGrant(),
    [MODULE_KEYS.USERS]: {
      ...noAccessGrant(),
      access: true,
      view: true,
    },
    [MODULE_KEYS.ROLES_PERMISSIONS]: {
      ...noAccessGrant(),
      access: true,
      view: true,
    },
  },
  // office_member: can see and draft posts, but editing/publishing and
  // deleting stays with admin/superAdmin. Adjustable later from the
  // permission matrix screen — this is only the seeded starting point.
  [SYSTEM_ROLE_KEYS.OFFICE_MEMBER]: {
    [MODULE_KEYS.NEWS_BLOG]: {
      ...noAccessGrant(),
      access: true,
      view: true,
      add: true,
    },
    [MODULE_KEYS.USERS]: noAccessGrant(),
    [MODULE_KEYS.ROLES_PERMISSIONS]: noAccessGrant(),
  },
};

function redactedTarget(uri: string): string {
  // Strip credentials, keep host + db name — dev and prod point at
  // different clusters, so this is printed before any write happens.
  return uri.replace(/\/\/[^/@]+@/, "//<redacted>@");
}

async function seed() {
  console.log(`Seeding target: ${redactedTarget(env.MONGODB_URI)}\n`);
  await Database.connect();

  for (const [key, label] of Object.entries(SYSTEM_ROLE_LABELS_VI) as [
    SystemRoleKey,
    string,
  ][]) {
    const role = await RoleModel.findOneAndUpdate(
      { key },
      { $set: { name: label, isSystem: true } },
      { upsert: true, new: true }
    );

    const matrix = DEFAULT_MATRICES[key];
    for (const [moduleKey, actions] of Object.entries(matrix) as [
      ModuleKey,
      ActionGrant,
    ][]) {
      await PermissionModel.findOneAndUpdate(
        { roleId: role._id, moduleKey },
        { $set: { actions } },
        { upsert: true }
      );
    }

    console.log(`Seeded role "${key}" (${label})`);
  }

  console.log(
    "\nDone. Set FIRST_SUPER_ADMIN_EMAIL in .env.local and sign in with that Google account (against this same database) to create the first superAdmin."
  );
}

seed()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
