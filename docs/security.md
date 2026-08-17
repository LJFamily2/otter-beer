# Security Guide

## Overview

Security is not an afterthought. Every feature in OtterBeer follows these principles by default.
This document is the authoritative reference for all security decisions in the codebase.

---

## 1. Authentication Token Storage — httpOnly Cookies Only

### ❌ Never use `localStorage` or `sessionStorage` for tokens

```javascript
// WRONG — vulnerable to XSS attacks
localStorage.setItem("token", jwt);
```

**Why it's dangerous:** Any JavaScript on the page — including third-party scripts, browser extensions, or XSS payloads — can read `localStorage`. An attacker can exfiltrate your JWT instantly.

### ✅ Always use `httpOnly` Secure cookies

Auth.js (our auth library) handles this automatically. `src/auth.ts` makes it explicit:

```typescript
// src/auth.ts
export const { handlers: { GET, POST }, auth, signIn, signOut } = NextAuth({
  cookies: {
    sessionToken: {
      options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      },
    },
  },
  // ...
});
```

### CSRF Protection

`SameSite=Lax` prevents cross-site request forgery for most cases.
For admin state-mutation routes (POST/PATCH/DELETE), Auth.js also generates a CSRF token.
Never disable this.

---

## 2. Input Validation with Zod

**All user input must be validated on the server before touching the database.**
Client-side validation is a UX feature, not a security feature.

### Zod Schemas

Defined per-domain in `src/lib/validation/` (`blogPost.ts`, `user.ts`, `role.ts`, `permission.ts`, `media.ts`).

```typescript
// src/lib/validation/blogPost.ts (excerpt)
export const BlogPostTranslationInputSchema = z.object({
  locale: localeEnum,
  title: z.string().trim().min(1).max(200),
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9-]+$/).optional(),
  excerpt: z.string().trim().min(1).max(300),
  content: z.string().min(1),
  seoKeywords: z.array(z.string().trim().max(50)).max(20).default([]),
});
```

### Using Zod in API routes
```typescript
// src/app/api/news-blog/route.ts (excerpt)
const parsed = BlogPostCreateSchema.safeParse(body);
if (!parsed.success) {
  return NextResponse.json(
    { error: "Validation failed", details: parsed.error.flatten() },
    { status: 400 }
  );
}
```

### Validation Rules by Field Type

| Field type | Rules |
|---|---|
| Text | `.trim()`, `min(1)`, `max()` |
| Email | `z.string().email()` |
| Slugs | `/^[a-z0-9-]+$/` regex |
| Enums | `z.enum([...])` — never trust raw strings |
| Arrays | `.max()` to prevent oversized payloads |
| HTML content | Sanitized with DOMPurify on write (see XSS section) |

---

## 3. XSS (Cross-Site Scripting) Prevention

### React's default protection
React automatically escapes JSX output — you get XSS protection for free when you use JSX normally.

### `dangerouslySetInnerHTML` — handle with extreme care
Blog post detail pages render `translations[].content` with `dangerouslySetInnerHTML`. This is only safe because the content is sanitized **before storage**, every time, with no bypass path.

**Enforced in `src/lib/utils/HtmlSanitizer.ts`, called from `BlogPostService` before every create/update:**
```typescript
import DOMPurify from "isomorphic-dompurify";

const ALLOWED_TAGS = ["p","h1","h2","h3","h4","strong","em","ul","ol","li",
                "a","blockquote","code","pre","img", /* ... */];
const ALLOWED_ATTR = ["href","src","alt","title","class","target","rel"];

export class HtmlSanitizer {
  static sanitize(html: string): string {
    return DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR });
  }
}
```

### Content Security Policy (CSP)
Add to `next.config.ts` (not yet wired — do this alongside the admin UI build):

```typescript
const cspHeader = `
  default-src 'self';
  script-src 'self' 'nonce-{nonce}' https://accounts.google.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: https://lh3.googleusercontent.com;
  connect-src 'self';
  frame-ancestors 'none';
`;
```

---

## 4. API Rate Limiting

Every mutation route (news-blog/users/roles/permissions writes, media upload-url, the Auth.js callback) is wrapped in `withRateLimit()` (`src/lib/rate-limit/withRateLimit.ts`), keyed per client IP, rejecting over-limit requests with `429` + a `Retry-After` header.

```typescript
// src/app/api/media/upload-url/route.ts (excerpt)
export const POST = withRateLimit(
  uploadRateLimiter,
  RouteGuard.requireAuth(async (request, _context, session) => { /* ... */ }),
  "media-upload-url"
);
```

**`RateLimiter`** (`src/lib/rate-limit/RateLimiter.ts`) is an in-memory sliding-window counter — deliberately dependency-free, no Redis/Upstash required. The tradeoff: limits are **per server process**, not shared across serverless instances. This is fine for a single-instance deployment or as a baseline; if traffic outgrows one instance, swap `RateLimiter`'s internals for an Upstash-backed implementation (`@upstash/ratelimit` + `@upstash/redis`) — every call site goes through `withRateLimit()`, so nothing above that layer needs to change.

**Current limits** (`src/lib/rate-limit/limiters.ts`):
| Limiter | Limit | Applied to |
|---|---|---|
| `uploadRateLimiter` | 10/min | `POST /api/media/upload-url` |
| `mutationRateLimiter` | 30/min | POST/PATCH/DELETE on news-blog, users, roles, permissions |
| `authRateLimiter` | 20/min | `/api/auth/[...nextauth]` (GET+POST) |

Add `POST /api/contact` to `mutationRateLimiter` (or a dedicated, stricter limiter) once that route is built.

---

## 5. MongoDB Injection Prevention

Mongoose protects against most injection attacks by default, but you must follow these rules:

### ✅ Always use Mongoose schema validation
```typescript
await BlogPostModel.findById(id);
await BlogPostModel.find({ status: "published" });
```

### ❌ Never use raw `$where` or direct query operators from user input
```typescript
// DANGEROUS — user can pass { $gt: "" } to bypass filters
await BlogPostModel.find({ status: req.body.status });

// SAFE — validate first with Zod, then query
const status = z.enum(["draft", "published"]).parse(req.body.status);
await BlogPostModel.find({ status });
```

Every repository (`src/repositories/`) builds queries from typed, validated inputs only — never spreads raw request bodies into a Mongoose filter.

---

## 6. File Upload Security

Images go straight from the browser to Cloudinary via a short-lived **signed upload**, never through the Next.js server as a request body — see `src/lib/storage/`. (Cloudflare R2 was the original provider and `R2StorageProvider` still works as a drop-in swap — see `StorageService.ts` — but the guarantees below describe the active Cloudinary path.)

| Check | Rule | Where enforced |
|---|---|---|
| File type | Only `image/jpeg`, `image/png`, `image/webp`, `image/gif` | `StorageService.isAllowedImageContentType` + the named Cloudinary upload preset's `Allowed formats`, applied server-side because `upload_preset` is itself part of the signed payload |
| File size | Maximum 5MB | **Not** enforced by Cloudinary before storing (no preset-level max-size option, and eval scripts can't reject uploads) — `uploadImage.ts` checks the `bytes` Cloudinary's own upload response reports and calls `POST /api/media/delete` to purge the object immediately if it's over the cap. Accept-then-verify-then-purge, not R2's true pre-write rejection — a small window exists where an oversized file transiently exists in Cloudinary. |
| Authentication | `add` or `edit` on the `news_blog` module | `POST /api/media/upload-url` and `POST /api/media/delete` check `session.user.permissions` |
| Object key | Random UUID + date prefix, server-generated | `StorageService.buildImageKey` — the client never chooses the storage path |
| Storage | Cloudinary | `GET /api/media/public/[...key]` gates *which* keys are disclosed (published content, or admin preview), then fetches the bytes from Cloudinary server-side and streams them — a direct redirect to Cloudinary's CDN was tried but broke every page using `next/image` (its built-in optimizer won't follow redirects, for SSRF-safety), so this route stays the only door rather than exposing raw Cloudinary URLs to the browser. |

R2's presigned POST enforced type/size at the storage layer itself before ever accepting the bytes. Cloudinary only gets type enforcement that way (via the signed `upload_preset`) — size enforcement moved to an app-level post-upload check, the one guarantee this migration weakened rather than preserved.

---

## 7. Admin Panel Security — Permission Matrix

Role hierarchy has been replaced by a **per-module, per-action permission matrix** (Truy cập/Xem/Thêm/Sửa/Xóa) — see [rbac.md](./rbac.md) for the full design. The old fixed `viewer < editor < super_admin` hierarchy check no longer applies.

### Route Guard — protect every API route
```typescript
// src/lib/auth/RouteGuard.ts (excerpt)
export const POST = RouteGuard.requirePermission(
  MODULE_KEYS.NEWS_BLOG,
  "add",
  async (request, _context, session) => { /* ... */ }
);
```

`RouteGuard` re-reads `session.user.permissions` (computed fresh per-request in `auth.ts`'s `session` callback, not a stale cached claim) on every call — this satisfies "verify role on every write operation" without each route reimplementing the check.

### Proxy — coarse authentication gate only
`src/proxy.ts` (Next.js 16 renamed `middleware.ts` → `proxy.ts`) only checks "is there a logged-in, active session" for `/admin/*`. It intentionally does **not** know about per-module permissions — that's a DB-backed decision left to the page/route layer, per Next's own guidance to verify authorization inside route handlers rather than relying on Proxy alone (see `node_modules/next/dist/docs/.../file-conventions/proxy.md`).

---

## 8. HTTP Security Headers

Add these headers in `next.config.ts` (not yet wired — do alongside the CSP work above):

```typescript
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];
```

---

## 9. Environment Variable Security

| Rule | Detail |
|---|---|
| Never commit `.env.local`, `.env.development.local`, `.env.production.local` | Already enforced in `.gitignore` |
| Keep dev and prod credentials in separate files | `MONGODB_URI` is dev-only in `.env.development.local`, prod-only in `.env.production.local` — never the same cluster. See [database-schema.md](./database-schema.md#per-environment-database--storage) |
| No secrets in client code | Only `NEXT_PUBLIC_*` vars reach the browser |
| Rotate secrets regularly | `AUTH_SECRET`, `CLOUDINARY_API_SECRET`, DB password |
| Validate on startup | `src/lib/env.ts` — Zod-parsed, throws on first access if anything required is missing/malformed |

**Server-only validation (already implemented):**
```typescript
// src/lib/env.ts
const envSchema = z.object({
  MONGODB_URI: z.string().url(),
  AUTH_SECRET: z.string().min(32),
  AUTH_GOOGLE_ID: z.string().min(1),
  AUTH_GOOGLE_SECRET: z.string().min(1),
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),
  CLOUDINARY_UPLOAD_PRESET: z.string().min(1),
  // R2_* stayed but is now optional — R2StorageProvider is an inactive fallback
  // ...
});
```

---

## 10. Dependency Security

```bash
# Run before every release
pnpm audit

# Check for known vulnerabilities weekly (add to CI when set up)
```

---

## Security Checklist (per feature)

When adding any new feature that handles user data, answer these:

- [ ] Is all input validated with Zod before hitting the database?
- [ ] Is the route wrapped in `RouteGuard.requirePermission`/`requireAuth`?
- [ ] Is any HTML content sanitized with `HtmlSanitizer` before saving?
- [ ] Is rate limiting applied if this is a public-facing endpoint?
- [ ] Are new environment variables added to `src/lib/env.ts` and `.env.example`?
- [ ] Does `pnpm audit` pass after adding any new dependency?

---

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Auth.js Security](https://authjs.dev/security)
- [Next.js Security Headers](https://nextjs.org/docs/app/guides/content-security-policy)
- [Zod Documentation](https://zod.dev)
- [Cloudflare R2 presigned URLs](https://developers.cloudflare.com/r2/api/s3/presigned-urls/)
