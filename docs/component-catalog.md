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
| `/admin/blog` | `(protected)/blog/page.tsx` | News & Blog list — KPIs, search, pagination |
| `/admin/blog/moi` | `(protected)/blog/moi/page.tsx` | Create post (Tiptap editor) |
| `/admin/blog/[id]/sua` | `(protected)/blog/[id]/sua/page.tsx` | Edit post (Tiptap editor) |
| — | `(protected)/layout.tsx` | Admin shell — sidebar nav, trimmed to modules that actually have UI |

**Reserved, not yet built** (empty `.gitkeep` scaffold folders — a future
module, not a bug if you find nothing there): `admin/beers/`, `admin/events/`.

## Pages & routes — Marketing (`src/app/[locale]/(marketing)/`)

Bilingual (vi default with no prefix, en under `/en`), public, SEO-tracked
(sitemap, JSON-LD — see `src/lib/seo.ts`).

| Route | File | Description |
|---|---|---|
| `/` | `page.tsx` | Homepage — stub, not yet designed |
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

Button, BackButton, Input, Textarea, Select, Card, FeatureCard, Badge,
StatusBadge, Avatar/AvatarGroup, DataTable, Accordion, ActivityList,
Breadcrumbs, Tabs, Pagination, NavSidebar, TopNavBar, DropdownMenu, Modal,
Alert, Toast, Tooltip, Spinner, Skeleton, plus a shared generic icon set
(`icons.tsx`).

## Admin-only components (`src/components/admin/`)

Not part of the general-purpose UI kit — admin-specific pieces that assume
the admin shell/session context.

| Component | File | Description |
|---|---|---|
| `RichTextEditor` | `RichTextEditor.tsx` | Tiptap WYSIWYG editor used by the blog post form |
| `ImageUploadField` | `ImageUploadField.tsx` | R2 signed-upload image field (cover image, inline post images) |
| `icons.tsx` | `icons.tsx` | Admin-specific icon set (news/blog, logout, plus, search, edit, trash) |
| `classNames.ts` | `classNames.ts` | Shared Tailwind class strings reused across admin server/client component boundaries |

---

## Maintenance

- Adding a page/route → add a row to the matching table above.
- Adding a `src/components/ui/*` component → add its name to the one-line
  summary list above **and** a full entry in `docs/component-library.md`.
- Adding a `src/components/admin/*` component → add a row to the admin
  table above.
- Retiring/deleting something → remove its row in the same change, don't
  leave a stale entry.
