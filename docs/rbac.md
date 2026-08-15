# Role-Based Access Control (Permission Matrix)

This is the "Truy cập / Xem / Thêm / Sửa / Xóa" (Access / View / Add / Edit / Delete) permission system: for every admin module and every role, five independent booleans control what that role can do — configurable from the admin UI, not hardcoded.

## Concepts

| Term | Meaning | Source of truth |
|---|---|---|
| **Module** | An admin feature area, e.g. "Tin tức & Blog" | `src/config/permissions.ts` (`MODULE_KEYS`) — code-defined, since adding a module is a dev task |
| **Action** | One of `access`, `view`, `add`, `edit`, `delete` | `src/config/permissions.ts` (`PERMISSION_ACTIONS`) |
| **Role** | `super_admin` / `admin` / `office_member`, or a custom role | `src/models/Role.ts` — DB-stored, so a superAdmin can add roles later without a code change |
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
2. **Admin pages/layouts** (frontend work, not yet built) — read `session.user.permissions` to decide which nav items to render and gate `view`.
3. **API routes** — every mutation and read goes through `RouteGuard.requirePermission(moduleKey, action, handler)` (`src/lib/auth/RouteGuard.ts`), which re-reads `session.user.permissions` computed fresh in `auth.ts`'s `session` callback. This matches docs/security.md's rule to verify role on every write, not just trust a cached client claim.

## API

- `GET /api/permissions?roleId=<id>` — returns the full matrix for one role (module → action grant)
- `PUT /api/permissions` — bulk-writes one role's matrix (`{ roleId, grants: [{ moduleKey, actions }] }`); rejects `super_admin`
- `GET/POST /api/roles`, `PATCH/DELETE /api/roles/[id]` — role CRUD; system roles (`isSystem: true`) can't be deleted
