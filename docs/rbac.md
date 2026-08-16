# Role-Based Access Control (Permission Matrix)

This is the "Truy cập / Xem / Thêm / Sửa / Xóa" (Access / View / Add / Edit / Delete) permission system: for every admin module and every role, five independent booleans control what that role can do — configurable from the admin UI, not hardcoded.

## Concepts

| Term | Meaning | Source of truth |
|---|---|---|
| **Module** | An admin feature area, e.g. "Tin tức & Blog" | `src/config/permissions.ts` (`MODULE_KEYS`) — code-defined, since adding a module is a dev task |
| **Action** | One of `access`, `view`, `add`, `edit`, `delete` | `src/config/permissions.ts` (`PERMISSION_ACTIONS`) |
| **Role** | `super_admin` / `admin` / `office_member`, or a custom role | `src/models/Role.ts` — DB-stored, so a superAdmin can add roles later without a code change |
| **Level** | Hierarchy rank on a role — lower is more senior | `Role.level` — see "Role hierarchy" below |
| **Grant** | One `{access, view, add, edit, delete}` row for a (role, module) pair | `src/models/Permission.ts` — one document per (roleId, moduleKey) |

### Action meanings

| Action | Vietnamese label | Meaning |
|---|---|---|
| `access` | Truy cập | Show this module in the admin sidebar navigation at all |
| `view` | Xem | Open the list/detail pages |
| `add` | Thêm | Create new records |
| `edit` | Sửa | Modify existing records |
| `delete` | Xóa | Delete records |

`access` is deliberately separate from `view` — a role could theoretically have `view` without `access` (reachable by direct URL but not shown in nav), though in practice the seeded defaults keep them in lock-step per module.

## Current modules

| Module key | Vietnamese label |
|---|---|
| `news_blog` | Tin tức & Blog |
| `users` | Người dùng |
| `roles_permissions` | Vai trò & Phân quyền |

Adding a future module (beers, events, …) is a two-line addition to `MODULE_KEYS`/`MODULE_LABELS_VI` in `src/config/permissions.ts` — the matrix storage, `PermissionService`, `RouteGuard`, and the admin permission-matrix screen all read from that registry, so nothing else needs to change.

## Why superAdmin bypasses the matrix

`super_admin` always resolves to full access in `PermissionService.getMatrixForRoleKey()` and is never queried against the `Permission` collection at request time. This is a deliberate safety valve: if the matrix is ever misconfigured (e.g. someone accidentally strips all `roles_permissions` access), there's always at least one role that can get back in and fix it. `scripts/seed.ts` still writes full-access rows for `super_admin` too, purely so the admin matrix screen (which reads by `roleId`) displays "everything checked" consistently — that data is never actually consulted for enforcement.

## Role hierarchy

Beyond the module/action matrix, roles are also ranked so that **only a
strictly more senior role can create, edit, or delete a given role — or
grant it to a user**. `Role.level` holds the rank (lower = more senior):

| Role | Level |
|---|---|
| `super_admin` | 0 |
| `admin` | 1 |
| `office_member` | 2 |
| any custom role | creator's level + 1, computed server-side at creation — never accepted from the client |

`canManageRole(actorLevel, targetLevel)` (`src/config/roles.ts`) is
`actorLevel < targetLevel` — strictly lower only, so e.g. an admin can
manage `office_member` and any role created by an admin, but not `admin`
itself or `super_admin`. `super_admin`'s own row is a separate, permanent
special case (see "Why superAdmin bypasses the matrix" above) — it's
never editable by anyone, including another `super_admin`.

This is checked server-side wherever a role is granted or modified — it's
the actual security boundary, not just a UI restriction:

- `RoleService.create/rename/delete` — can't rename/delete a role at or
  above your rank; a new role's level is always `actorLevel + 1`
- `PermissionService.setMatrixForRole` — can't edit a role's matrix at or
  above your rank (in addition to the existing `super_admin`-is-never-
  editable rule)
- `UserService.invite/updateRole` — can't invite a new user into, or move
  an existing user into, a role at or above your rank. Without this, the
  hierarchy rule on the Roles page would be pointless — anyone could just
  bypass it by assigning the role directly from the Users page instead
- `UserService.setActive/delete` — also checks the target user's CURRENT
  role, not just the role being granted. Deactivating or removing someone
  isn't a role grant, but letting an admin do it to a peer/superior-role
  user would undermine the rule just as much

The **Vai trò & Phân quyền** page reflects this: a peer/superior role's
matrix is shown read-only instead of hidden (transparency over
obscurity), and its rename/delete controls don't render. The **Người
dùng** page's role dropdowns are pre-filtered to only roles the actor can
actually grant, and a user whose *current* role outranks the actor shows
"Vai trò cao hơn" instead of edit/delete actions (this specifically
guards against a stale/unrelated PATCH resubmitting an unmanageable
roleId and failing confusingly, and doubles as the UI-side reflection of
the `setActive`/`delete` hierarchy check above).

## Default seeded matrix

Set by `scripts/seed.ts` — a starting point, editable afterward from **Vai trò & Phân quyền**:

| Module | superAdmin | admin | officeMember |
|---|---|---|---|
| Tin tức & Blog | full | full | access, view, add only |
| Người dùng | full | access, view only | none |
| Vai trò & Phân quyền | full | access, view only | none |

## Enforcement points

Permissions are re-checked live on every request — never cached beyond the current request/session lookup:

1. **`src/proxy.ts`** — coarse gate only: is there a logged-in, active user. It does **not** know about individual modules (see the comment in that file and Next's own guidance in `node_modules/next/dist/docs/.../proxy.md` to verify authorization in route handlers, not Proxy).
2. **Admin pages/layouts** — read `session.user.permissions` to decide which nav items to render and gate `view` (e.g. `(protected)/layout.tsx`'s sidebar, `/admin/blog`, `/admin/users`, `/admin/roles`).
3. **API routes** — every mutation and read goes through `RouteGuard.requirePermission(moduleKey, action, handler)` (`src/lib/auth/RouteGuard.ts`), which re-reads `session.user.permissions` computed fresh in `auth.ts`'s `session` callback. This matches docs/security.md's rule to verify role on every write, not just trust a cached client claim.

## API

- `GET /api/permissions?roleId=<id>` — returns the full matrix for one role (module → action grant)
- `PUT /api/permissions` — bulk-writes one role's matrix (`{ roleId, grants: [{ moduleKey, actions }] }`); rejects `super_admin` and any role at or above the caller's rank (403)
- `GET/POST /api/roles`, `PATCH/DELETE /api/roles/[id]` — role CRUD; system roles (`isSystem: true`) can't be deleted; rename/delete reject a role at or above the caller's rank (403)
- `POST /api/users`, `PATCH /api/users/[id]` — inviting or reassigning a user's role rejects a role at or above the caller's rank (403); `PATCH`'s `isActive` and `DELETE` reject a target user whose *current* role is at or above the caller's rank (403)

## Admin UI

- **`/admin/roles`** (Vai trò & Phân quyền) — role list + matrix editor. A superAdmin's row shows a static notice instead of an editable grid; a peer/superior role shows the matrix read-only. `+ Tạo vai trò mới` creates a custom role at `actorLevel + 1`.
- **`/admin/users`** (Người dùng) — directory + invite/edit/delete. Role dropdowns only offer roles the actor can grant; a row whose user currently holds a peer/superior role shows "Vai trò cao hơn" instead of actions.
- **`/admin/tai-khoan`** (Account Settings) — your own profile + permissions summary. The permissions-matrix summary only renders for `super_admin`.
