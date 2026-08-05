# Internationalization (i18n)

## Strategy

OtterBeer supports **two languages**: Vietnamese (VI) and English (EN).

| Scope | Languages | Notes |
|---|---|---|
| Marketing site | VI + EN | Customer-facing pages |
| Admin panel | VI only | Internal tool — no i18n needed |
| API responses | English | Error messages and field names |

---

## URL Routing Convention

| URL | Language | Example |
|---|---|---|
| `otterbeer.vn/` | 🇻🇳 Vietnamese (default) | `otterbeer.vn/menu` |
| `otterbeer.vn/en/` | 🇬🇧 English | `otterbeer.vn/en/menu` |

**Rules:**
- Vietnamese is the **default locale** — no path prefix, just the bare domain
- English uses the `/en/` prefix
- Admin routes (`/admin/*`) are never localized

---

## App Router i18n Structure

With Next.js App Router, there are two approaches. We use **Middleware + `[locale]` dynamic segment**:

```
src/app/
├── [locale]/                    ← Dynamic locale segment (vi | en)
│   ├── layout.tsx               ← Sets html lang attribute
│   ├── page.tsx                 ← Localized homepage
│   ├── menu/
│   │   └── page.tsx
│   ├── about/
│   ├── events/
│   ├── blog/
│   └── contact/
├── (admin)/                     ← Not localized (outside [locale])
│   └── admin/
└── api/                         ← Not localized
```

**Routing behavior:**
- `otterbeer.vn/` → `[locale]` = `vi` (set by middleware)
- `otterbeer.vn/en/menu` → `[locale]` = `en`
- `otterbeer.vn/admin` → no locale, bypasses i18n middleware

---

## Middleware

The middleware intercepts all marketing routes and:
1. Detects the user's preferred locale (from URL path → cookie → `Accept-Language` header)
2. Redirects `/` traffic to the correct default (no prefix for VI)
3. Sets a `NEXT_LOCALE` cookie for subsequent visits

```typescript
// src/middleware.ts (to be created)
import { NextRequest, NextResponse } from "next/server";

const locales = ["vi", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "vi";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip admin and API routes
  if (pathname.startsWith("/admin") || pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Check if path already has a locale prefix
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );
  if (pathnameHasLocale) return NextResponse.next();

  // Default locale (vi) — no prefix, serve as-is
  // We rewrite internally to /vi/... so the [locale] param resolves
  return NextResponse.rewrite(
    new URL(`/vi${pathname}`, request.url)
  );
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|images|fonts).*)"],
};
```

---

## Translation Files

Translations live in `src/i18n/` (to be created):

```
src/
└── i18n/
    ├── vi.ts          ← Vietnamese strings (default)
    ├── en.ts          ← English strings
    └── index.ts       ← getDictionary() helper
```

### Dictionary structure
```typescript
// src/i18n/vi.ts
export const vi = {
  nav: {
    home: "Trang chủ",
    menu: "Thực đơn",
    events: "Sự kiện",
    blog: "Blog",
    about: "Giới thiệu",
    contact: "Liên hệ",
  },
  home: {
    hero: {
      headline: "Mỗi cốc bia là một câu chuyện",
      cta: "Khám phá thực đơn",
    },
  },
  // ...
};
```

```typescript
// src/i18n/en.ts
export const en = {
  nav: {
    home: "Home",
    menu: "Menu",
    events: "Events",
    blog: "Blog",
    about: "About",
    contact: "Contact",
  },
  home: {
    hero: {
      headline: "Every pint tells a story",
      cta: "Explore our menu",
    },
  },
  // ...
};
```

### getDictionary() helper
```typescript
// src/i18n/index.ts
import type { Locale } from "@/middleware";

const dictionaries = {
  vi: () => import("./vi").then((m) => m.vi),
  en: () => import("./en").then((m) => m.en),
};

export async function getDictionary(locale: Locale) {
  return dictionaries[locale]?.() ?? dictionaries.vi();
}
```

### Usage in a Server Component
```typescript
// src/app/[locale]/page.tsx
import { getDictionary } from "@/i18n";

export default async function HomePage({
  params,
}: PageProps<"/[locale]">) {
  const { locale } = await params;
  const t = await getDictionary(locale as "vi" | "en");

  return <h1>{t.home.hero.headline}</h1>;
}
```

---

## Language Switcher Component

A client-side `<LanguageSwitcher>` button will:
- Read the current URL
- Swap between `domain.com/current-path` ↔ `domain.com/en/current-path`
- Set a `NEXT_LOCALE` cookie for future visits

```typescript
// Conceptual — build in components/ui/LanguageSwitcher.tsx
"use client";
import { usePathname, useRouter } from "next/navigation";

export function LanguageSwitcher({ currentLocale }: { currentLocale: "vi" | "en" }) {
  const pathname = usePathname();
  const router = useRouter();

  const toggleLocale = () => {
    if (currentLocale === "vi") {
      router.push(`/en${pathname}`);
    } else {
      // Remove /en prefix
      router.push(pathname.replace(/^\/en/, "") || "/");
    }
  };

  return (
    <button onClick={toggleLocale}>
      {currentLocale === "vi" ? "EN" : "VI"}
    </button>
  );
}
```

---

## SEO Considerations

For bilingual SEO, each page should declare `hreflang` alternate links:

```typescript
// In each page's generateMetadata:
export const metadata: Metadata = {
  alternates: {
    canonical: "https://otterbeer.vn/menu",
    languages: {
      "vi": "https://otterbeer.vn/menu",
      "en": "https://otterbeer.vn/en/menu",
    },
  },
};
```

The `buildSEO()` helper in `src/lib/seo.ts` will be extended to accept a `locale` parameter and generate these automatically.

---

## Implementation Checklist

- [ ] Restructure `src/app/(marketing)/` to `src/app/[locale]/`
- [ ] Create `src/middleware.ts` with locale detection
- [ ] Create `src/i18n/vi.ts` (Vietnamese strings)
- [ ] Create `src/i18n/en.ts` (English strings)
- [ ] Create `src/i18n/index.ts` with `getDictionary()`
- [ ] Update `src/lib/seo.ts` to generate `hreflang` alternates
- [ ] Build `<LanguageSwitcher>` component
- [ ] Add `lang` attribute to `<html>` in `[locale]/layout.tsx`
