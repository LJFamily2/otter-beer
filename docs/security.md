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

NextAuth.js (our auth library) handles this automatically. Its session cookies are:

| Cookie attribute | Value | Why |
|---|---|---|
| `HttpOnly` | `true` | JavaScript **cannot** access the cookie — immune to XSS |
| `Secure` | `true` | Only sent over HTTPS — never over HTTP |
| `SameSite` | `Lax` | Blocks cross-origin form POST CSRF attacks |
| `Path` | `/` | Cookie is scoped to the whole site |

**NextAuth.js config to enforce this:**
```typescript
// src/auth.ts
export const { handlers, auth, signIn, signOut } = NextAuth({
  // NextAuth uses httpOnly cookies by default.
  // The following makes it explicit:
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
});
```

### CSRF Protection

`SameSite=Lax` prevents cross-site request forgery for most cases.
For admin state-mutation routes (POST/PUT/DELETE), NextAuth also generates a CSRF token.
Never disable this.

---

## 2. Input Validation with Zod

**All user input must be validated on the server before touching the database.**
Client-side validation is a UX feature, not a security feature.

### Zod Schemas

Define schemas alongside your models in `src/lib/validation/`.

```typescript
// src/lib/validation/beer.ts
import { z } from "zod";

export const BeerSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with dashes"),
  description: z.string().min(10).max(2000).trim(),
  style: z.string().min(1).max(50).trim(),
  abv: z.number().min(0).max(100),
  ibu: z.number().min(0).max(1000).optional(),
  price: z.number().int().min(0).max(10_000_000), // VND cap
  isAvailable: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  tags: z.array(z.string().max(30)).max(10).default([]),
  imageUrl: z.string().url().optional(),
});

export const BeerUpdateSchema = BeerSchema.partial();

export type BeerInput = z.infer<typeof BeerSchema>;
```

### Using Zod in API routes
```typescript
// src/app/api/beers/route.ts
import { BeerSchema } from "@/lib/validation/beer";

export async function POST(request: Request) {
  const body = await request.json();

  const result = BeerSchema.safeParse(body);
  if (!result.success) {
    return Response.json(
      { error: "Validation failed", details: result.error.flatten() },
      { status: 400 }
    );
  }

  // result.data is now safe to use
  const beer = await Beer.create(result.data);
  return Response.json(beer, { status: 201 });
}
```

### Validation Rules by Field Type

| Field type | Rules |
|---|---|
| Text | `.trim()`, `min(1)`, `max()` |
| Email | `z.string().email()` |
| URL | `z.string().url()` |
| Numbers | `.min()`, `.max()`, `.int()` where applicable |
| Slugs | `/^[a-z0-9-]+$/` regex |
| Enums | `z.enum(["a", "b", "c"])` — never trust raw strings |
| Arrays | `.max()` to prevent oversized payloads |
| HTML content | Strip with DOMPurify on input (see XSS section) |

---

## 3. XSS (Cross-Site Scripting) Prevention

### React's default protection
React automatically escapes JSX output — you get XSS protection for free when you use JSX normally.

### `dangerouslySetInnerHTML` — handle with extreme care
The blog post detail page currently uses `dangerouslySetInnerHTML`. This is only safe if the content is sanitized **before storage**.

**Required: Sanitize before saving to MongoDB:**
```typescript
import DOMPurify from "isomorphic-dompurify";

// In the blog POST API route, before saving:
const sanitizedContent = DOMPurify.sanitize(body.content, {
  ALLOWED_TAGS: ["p", "h1", "h2", "h3", "h4", "strong", "em", "ul", "ol", "li",
                  "a", "blockquote", "code", "pre", "img"],
  ALLOWED_ATTR: ["href", "src", "alt", "title", "class"],
});
```

Install: `npm install isomorphic-dompurify`

### Content Security Policy (CSP)
CSP is a browser security layer that prevents unauthorized scripts from running.
Add to `next.config.ts`:

```typescript
// next.config.ts
const cspHeader = `
  default-src 'self';
  script-src 'self' 'nonce-{nonce}' https://accounts.google.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' blob: data: https://*.public.blob.vercel-storage.com https://lh3.googleusercontent.com;
  connect-src 'self';
  frame-ancestors 'none';
`;
```

---

## 4. API Rate Limiting

Without rate limiting, your API endpoints can be abused for brute-force, spam, or DoS attacks.

**Use Vercel's built-in rate limiting** or the `@upstash/ratelimit` library with Upstash Redis:

```typescript
// src/lib/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"), // 10 requests per 10 seconds
});

// Usage in API route:
const { success } = await ratelimit.limit(ip);
if (!success) {
  return Response.json({ error: "Too many requests" }, { status: 429 });
}
```

**Apply rate limiting to:**
- `POST /api/contact` — prevent spam (5 requests / minute per IP)
- `POST /api/auth/signin` — prevent brute force
- `POST /api/upload` — prevent abuse (3 uploads / minute per user)
- All public-facing POST routes

Install: `npm install @upstash/ratelimit @upstash/redis`

---

## 5. MongoDB Injection Prevention

Mongoose protects against most injection attacks by default, but you must follow these rules:

### ✅ Always use Mongoose schema validation
```typescript
// Safe — Mongoose validates and casts
await Beer.findById(id);
await Beer.find({ slug: slug });
```

### ❌ Never use raw `$where` or direct query operators from user input
```typescript
// DANGEROUS — user can pass { $gt: "" } to bypass filters
await Beer.find({ price: req.body.price });

// SAFE — validate first with Zod, then query
const price = z.number().int().min(0).parse(req.body.price);
await Beer.find({ price });
```

### Protect dynamic `$or`, `$and` queries
```typescript
// Never spread user input directly into query operators
// Always validate and whitelist fields before querying
```

---

## 6. File Upload Security

The `/api/upload` route has these enforced controls:

| Check | Rule |
|---|---|
| File type | Only `image/jpeg`, `image/png`, `image/webp`, `image/gif` |
| File size | Maximum 5MB |
| Authentication | Must be `editor` or `super_admin` (once auth is implemented) |
| Filename | Sanitized and random suffix added by Vercel Blob |
| Storage | Vercel Blob (isolated from app server) |

**Additional rule:** Validate MIME type from the file buffer, not just the `Content-Type` header (can be spoofed).

```typescript
// TODO: Add magic bytes validation with `file-type` package
import { fileTypeFromBuffer } from "file-type";
const buffer = Buffer.from(await file.arrayBuffer());
const type = await fileTypeFromBuffer(buffer);
if (!type || !["image/jpeg", "image/png", "image/webp"].includes(type.mime)) {
  return Response.json({ error: "Invalid file content" }, { status: 400 });
}
```

---

## 7. Admin Panel Security

### Role hierarchy enforcement
```typescript
// src/lib/auth-utils.ts
export function requireRole(
  sessionRole: string,
  minimumRole: "viewer" | "editor" | "super_admin"
): boolean {
  const hierarchy = { viewer: 0, editor: 1, super_admin: 2 };
  return hierarchy[sessionRole] >= hierarchy[minimumRole];
}
```

### Middleware — protect all `/admin` routes
```typescript
// src/middleware.ts
import { auth } from "@/auth";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // All admin routes require authentication
  if (pathname.startsWith("/admin")) {
    if (!req.auth) {
      return Response.redirect(new URL("/api/auth/signin", req.url));
    }
    // Role checks are done per-route in the page/layout
  }
});
```

### Verify role on EVERY write operation
Never trust the session role alone for mutations. Always verify in the API route:
```typescript
export async function DELETE(req, ctx) {
  const session = await auth();
  if (!session || session.user.role !== "super_admin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
  // ... proceed
}
```

---

## 8. HTTP Security Headers

Add these headers in `next.config.ts`:

```typescript
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },           // Prevent MIME sniffing
  { key: "X-Frame-Options", value: "DENY" },                      // Prevent clickjacking
  { key: "X-XSS-Protection", value: "1; mode=block" },           // Legacy XSS filter
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }, // HSTS
];
```

---

## 9. Environment Variable Security

| Rule | Detail |
|---|---|
| Never commit `.env.local` | Already enforced in `.gitignore` |
| No secrets in client code | Only `NEXT_PUBLIC_*` vars reach the browser |
| Rotate secrets regularly | `AUTH_SECRET`, DB passwords |
| Use Vercel environment UI | Never paste secrets in chat, PR comments, or issues |
| Validate on startup | `lib/mongodb.ts` throws if `MONGODB_URI` is missing |

**Server-only validation:**
```typescript
// src/lib/env.ts (create this)
import { z } from "zod";

const envSchema = z.object({
  MONGODB_URI: z.string().url(),
  AUTH_SECRET: z.string().min(32),
  BLOB_READ_WRITE_TOKEN: z.string().min(1),
  NODE_ENV: z.enum(["development", "test", "production"]),
});

export const env = envSchema.parse(process.env);
```

---

## 10. Dependency Security

```bash
# Run before every release
npm audit

# Auto-fix low/moderate issues
npm audit fix

# Check for known vulnerabilities weekly
# (Automated in GitHub Actions CI — see .github/workflows/ci.yml)
```

---

## Security Checklist (per feature)

When adding any new feature that handles user data, answer these:

- [ ] Is all input validated with Zod before hitting the database?
- [ ] Is the route protected by the correct role check?
- [ ] Does the route appear in the middleware protection rules?
- [ ] Are any tokens/secrets stored in httpOnly cookies (not localStorage)?
- [ ] Is any HTML content sanitized with DOMPurify before saving?
- [ ] Is rate limiting applied if this is a public-facing endpoint?
- [ ] Are new environment variables documented in `.env.example`?
- [ ] Does `npm audit` pass after adding any new dependency?

---

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NextAuth.js Security](https://authjs.dev/security)
- [Next.js Security Headers](https://nextjs.org/docs/app/guides/content-security-policy)
- [Zod Documentation](https://zod.dev)
