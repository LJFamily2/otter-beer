# Component & Page Catalog

A single, sitewide inventory of every component and page/route that exists
on the OtterBeer site. Two purposes:

1. **Check before building.** Before adding a new page or component, search
   this document first — a similar one may already exist and just need a
   new prop (see the "customize via props" rule in `docs/component-library.md`)
   instead of a duplicate.
2. **Append when you add one.** When you add a new page, route, or reusable
   component — whether you're a human contributor or an AI agent — add one
   row to the relevant table below in the same PR/commit. Keep entries to
   one line; link to more detail (a doc, a prop reference) instead of
   duplicating it here.

This document tracks *what exists and where*, not *how to use it* — for
component props/variants see `docs/component-library.md`; for design tokens
see `docs/DESIGN.md`.

---

## Pages & routes — Admin (`src/app/(admin)/admin/`)

VI-only, session-gated by `src/proxy.ts`, permission-gated per-page via
`RouteGuard`/`session.user.permissions`.

| Route | File | Description |
|---|---|---|
| `/admin/dang-nhap` | `dang-nhap/page.tsx` | Login — Google OAuth sign-in, public (the one admin path proxy.ts exempts from the auth gate) |
| `/admin` | `(protected)/page.tsx` | Redirects to `/admin/blog` |
| `/admin/blog` | `(protected)/blog/page.tsx` | News & Blog list — KPI cards, `Breadcrumbs`, `DataTable` (search action + pagination footer) |
| `/admin/blog/moi` | `(protected)/blog/moi/page.tsx` | Create post — renders `PostForm` (Tiptap editor) |
| `/admin/blog/[id]/sua` | `(protected)/blog/[id]/sua/page.tsx` | Edit post — renders `PostForm` (Tiptap editor) |
| — | `(protected)/blog/PostForm.tsx` | Shared create/edit form — `Breadcrumbs`, `Tabs` (locale switcher), `Input`/`Textarea`/`Select` for every field |
| `/admin/beers` | `(protected)/beers/page.tsx` | Sản phẩm bia (product) list — `DataTable` with dòng bia/thông số/nổi bật/trạng thái columns; at most one beer can be `isFeatured` (enforced in `BeerService`) — that one, if also `published`, is what renders on the public homepage hero |
| `/admin/beers/moi` | `(protected)/beers/moi/page.tsx` | Create product — renders `BeerForm` |
| `/admin/beers/[id]/sua` | `(protected)/beers/[id]/sua/page.tsx` | Edit product — renders `BeerForm` |
| — | `(protected)/beers/BeerForm.tsx` | Shared create/edit form — `Breadcrumbs`, `Tabs` (locale switcher: dòng bia/tiêu đề/mô tả), ABV/IBU inputs, `ImageUploadField`, shop/find-locally links, `Checkbox` for "nổi bật" |
| `/admin/brand-story` | `(protected)/brand-story/page.tsx` | Câu chuyện thương hiệu — singleton editor (not per-item CRUD) for the homepage flipbook's ordered page list; renders `BrandStoryForm` |
| — | `(protected)/brand-story/BrandStoryForm.tsx` | Whole-list editor — `Tabs` (locale switcher), add/remove/reorder page cards, each with `ImageUploadField` + title/caption inputs; `PUT /api/brand-story` replaces the whole `pages` array in one save (mirrors `PermissionMatrixEditor`'s whole-resource-replace pattern, not Beer's per-item PATCH) |
| `/admin/users` | `(protected)/users/page.tsx` | User Management — KPI cards (total/active/inactive), `Breadcrumbs`, role `Tabs` + search (client-side, `filterUsers()`), `DataTable`. Role dropdowns (invite/edit) are pre-filtered to roles the actor outranks — see `docs/rbac.md`'s "Role hierarchy" |
| — | `(protected)/users/UsersDirectory.tsx` | Client filtering/table piece of the Users page — a row whose user currently holds a peer/superior role shows "Vai trò cao hơn" instead of edit/delete actions |
| — | `(protected)/users/AddUserModal.tsx` | Invite a user — `Modal` + `Input`/`Select`, `POST /api/users` |
| — | `(protected)/users/EditUserModal.tsx` | Change a user's role/active state — `Modal` + `Select`, `PATCH /api/users/[id]` |
| — | `(protected)/users/DeleteUserButton.tsx` | Revoke a user's access — `DELETE /api/users/[id]` (mirrors `blog/DeletePostButton.tsx`) |
| `/admin/tai-khoan` | `(protected)/tai-khoan/page.tsx` | Account Settings — no Figma frame exists for this (self-designed): read-only profile (name/email/avatar synced from Google), role badge, permissions-matrix summary (`DataTable`, **superAdmin only** — everyone else's own grants aren't shown here), sign out |
| `/admin/roles` | `(protected)/roles/page.tsx` | Roles & Permissions — role list (`?roleId=` query param switches selection), permission matrix editor per role. superAdmin's row is shown as a static "always full access" notice (matches the API's edit block); a peer/superior role's matrix renders read-only (see `docs/rbac.md`'s "Role hierarchy") |
| — | `(protected)/roles/PermissionMatrixEditor.tsx` | Client checkbox grid (module × action) + save — `PUT /api/permissions` |
| — | `(protected)/roles/CreateRoleModal.tsx` | Create a custom role — `Modal` + `Input`, `POST /api/roles` (new role's rank is always `actorLevel + 1`, computed server-side) |
| — | `(protected)/roles/RenameRoleModal.tsx` | Rename a non-system role — `Modal` + `Input`, `PATCH /api/roles/[id]` |
| — | `(protected)/roles/DeleteRoleButton.tsx` | Delete a non-system role — `DELETE /api/roles/[id]` (system roles can't be deleted; the button is hidden for them, and for any role at or above the actor's rank) |
| — | `(protected)/layout.tsx` | Admin shell — `NavSidebar` (route-aware active state) + `Avatar`; footer profile block links to `/admin/tai-khoan`, trimmed to modules that actually have UI |

**Reserved, not yet built** (empty `.gitkeep` scaffold folder — a future
module, not a bug if you find nothing there): `admin/events/`.

## Pages & routes — Marketing (`src/app/[locale]/(marketing)/`)

Bilingual (vi default with no prefix, en under `/en`), public, SEO-tracked
(sitemap, JSON-LD — see `src/lib/seo.ts`).

| Route | File | Description |
|---|---|---|
| `/` | `page.tsx` | Homepage — renders `HeroSection` (ported from Figma node 28:877, "Main Hero Section" / the "Production List" section), then `BrandStorySection` |
| `/blog` | `blog/page.tsx` | Public blog list ("The Otter Chronicles" / "Biên Niên Sử Otter") — hero, featured post, tag filter, pagination |
| `/blog/[slug]` | `blog/[slug]/page.tsx` | Public blog detail — article body, author card, recent posts, topics, JSON-LD |
| `/design-system` | `design-system/page.tsx` | Live showcase of every `src/components/ui/*` component, grouped like the Figma "Coastal Premium UI Library" batches |
| — | `layout.tsx` | Marketing shell — header (brand + Home/Blog nav) and footer |

**Reserved, not yet built**: `about/`, `contact/`, `events/`, `menu/`.

## Special files (`src/app/`)

| File | Description |
|---|---|
| `layout.tsx` | Root layout — fonts, `<html lang>` via `getServerLocale()`, no header/footer (that's the marketing layout's job) |
| `not-found.tsx` | 404 — handles both unmatched URLs anywhere in the app and any `notFound()` call from a segment without its own `not-found.tsx`. No header/footer (Figma "navigation shell suppressed" for error pages); bilingual via `getServerLocale()`. Recovery actions branch on `getServerAppSection()`: marketing links to `/` and `/blog`, admin uses `BackButton` (browser history, falls back to `/admin`) so a 404 inside the admin panel never sends the user out to the public site |
| `error.tsx` | 500 — root error boundary (Client Component) for runtime errors below the root layout; "Try Again" (`retry()`) and a `mailto:` support link; bilingual via `getClientLocale()`. A failure inside the root layout itself would need `global-error.tsx`, which doesn't exist yet |

## Reusable UI components (`src/components/ui/`)

Full prop reference: `docs/component-library.md`. One-line summary of what
exists, so you don't have to open every file to check:

Button, BackButton, Input, Textarea, Select, Checkbox, Card, FeatureCard,
Badge, StatusBadge, Avatar/AvatarGroup, DataTable, Accordion, ActivityList,
Breadcrumbs, Tabs, Pagination, NavSidebar, TopNavBar, DropdownMenu, Modal,
Alert, Toast, Tooltip, Spinner, Skeleton, plus a shared generic icon set
(`icons.tsx`).

## Marketing section components (`src/components/sections/`)

Homepage/public-page building blocks, one Figma frame per component.

| Component | File | Description |
|---|---|---|
| `HeroSection` | `HeroSection.tsx` | Homepage hero ("Production List" section, Figma node 28:877) — fetches `beerService.getFeaturedPublished()` directly (Server Component, no API round trip); renders `null` until a beer is marked both `isFeatured` and `published` |
| `BrandStorySection` | `BrandStorySection.tsx` | Homepage "brand story" flipbook — no Figma frame exists for this (self-designed, original SVG illustrations/decorative motifs, no source art files). Client Component (page-turn interaction); currently renders TEMPORARY hardcoded placeholder pages, not yet wired to `brandStoryService.getPublished()` — swap when asked to "connect" the section, same pattern as `HeroSection`'s pending Beer wiring |

## Admin-only components (`src/components/admin/`)

Not part of the general-purpose UI kit — admin-specific pieces that assume
the admin shell/session context.

| Component | File | Description |
|---|---|---|
| `RichTextEditor` | `RichTextEditor.tsx` | Tiptap WYSIWYG editor used by the blog post form |
| `ImageUploadField` | `ImageUploadField.tsx` | R2 signed-upload image field (cover image, inline post images) |
| `icons.tsx` | `icons.tsx` | Admin-specific icon set (news/blog, beer, users, shield, logout, plus, search, edit, trash) |
| `classNames.ts` | `classNames.ts` | Shared Tailwind class strings reused across admin server/client component boundaries |

**Retired**: `AdminNavLink.tsx` — superseded by `src/components/ui/NavSidebar.tsx`'s
own route-aware active-state detection (see the Navigation entry above).

---

## Maintenance

- Adding a page/route → add a row to the matching table above.
- Adding a `src/components/ui/*` component → add its name to the one-line
  summary list above **and** a full entry in `docs/component-library.md`.
- Adding a `src/components/admin/*` component → add a row to the admin
  table above.
- Retiring/deleting something → remove its row in the same change, don't
  leave a stale entry.
