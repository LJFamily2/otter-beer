# Architecture Overview

## System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                          VERCEL EDGE                            │
│                                                                 │
│  ┌─────────────────────────┐   ┌──────────────────────────┐    │
│  │   Marketing Site        │   │   Admin Panel            │    │
│  │   otterbeer.vn/         │   │   otterbeer.vn/admin     │    │
│  │   otterbeer.vn/en/      │   │   (Vietnamese only)      │    │
│  │                         │   │                          │    │
│  │  Route Group:           │   │  Route Group:            │    │
│  │  src/app/(marketing)/   │   │  src/app/(admin)/        │    │
│  │                         │   │                          │    │
│  │  Public — no auth       │   │  Protected — roles req.  │    │
│  └────────────┬────────────┘   └────────────┬─────────────┘    │
│               │                             │                   │
│               └──────────────┬──────────────┘                   │
│                              │                                   │
│                    ┌─────────▼──────────┐                       │
│                    │   Next.js API       │                       │
│                    │   /api/beers        │                       │
│                    │   /api/blog         │                       │
│                    │   /api/events       │                       │
│                    │   /api/contact      │                       │
│                    │   /api/upload       │                       │
│                    │   /api/auth         │  ← NextAuth.js        │
│                    └────┬───────┬────────┘                       │
│                         │       │                                │
│              ┌──────────▼─┐  ┌──▼──────────────┐               │
│              │  MongoDB   │  │  Vercel Blob     │               │
│              │  (Atlas)   │  │  (Image Storage) │               │
│              └────────────┘  └─────────────────┘               │
└─────────────────────────────────────────────────────────────────┘

External Services:
  Google OAuth ←──── NextAuth.js
```

---

## Tech Stack

| Layer | Technology | Version | Notes |
|---|---|---|---|
| Framework | Next.js | 16.x | App Router, Turbopack dev |
| Language | TypeScript | 5.x | Strict mode |
| Styling | Vanilla CSS | — | CSS Custom Properties (no Tailwind) |
| Database | MongoDB + Mongoose | 8.x | Atlas cloud-hosted |
| Auth | NextAuth.js (Auth.js) | v5 | Google OAuth only |
| Image Storage | Vercel Blob | Latest | `@vercel/blob` |
| Deployment | Vercel | — | Serverless + Edge |
| i18n | Next.js Middleware | Built-in | Domain path routing (VI default, `/en`) |

---

## Folder Structure

```
p:\Otter Beer\otter-beer\
├── docs/                         ← You are here — project documentation
├── public/
│   └── images/                   ← Static images (logo, OG image)
├── src/
│   ├── app/
│   │   ├── (marketing)/          ← Public-facing pages (VI + EN via middleware)
│   │   │   ├── layout.tsx        ← Navbar + Footer shell
│   │   │   ├── page.tsx          ← Homepage
│   │   │   ├── menu/             ← Beer catalog
│   │   │   ├── about/
│   │   │   ├── events/
│   │   │   ├── blog/
│   │   │   │   └── [slug]/       ← Individual blog posts
│   │   │   └── contact/
│   │   ├── (admin)/
│   │   │   └── admin/            ← Protected admin panel
│   │   │       ├── layout.tsx    ← Sidebar shell (Vietnamese)
│   │   │       ├── page.tsx      ← Dashboard
│   │   │       ├── beers/        ← Beer CRUD
│   │   │       ├── blog/         ← Blog post CRUD
│   │   │       └── events/       ← Event CRUD
│   │   ├── api/
│   │   │   ├── beers/            ← Beer REST endpoints
│   │   │   ├── blog/             ← Blog REST endpoints
│   │   │   ├── events/           ← Event REST endpoints
│   │   │   ├── contact/          ← Contact form submission
│   │   │   ├── upload/           ← Vercel Blob image upload
│   │   │   └── auth/             ← NextAuth.js handler
│   │   ├── layout.tsx            ← Root layout (lang="vi", fonts, global meta)
│   │   ├── globals.css           ← Design tokens + reset
│   │   ├── sitemap.ts            ← Auto-generated SEO sitemap
│   │   └── not-found.tsx         ← 404 page
│   ├── components/
│   │   ├── ui/                   ← Button, Card, Badge, Input, Modal…
│   │   ├── layout/               ← Navbar, Footer, Sidebar
│   │   ├── sections/             ← Hero, FeaturedBeers, EventCards…
│   │   └── admin/                ← DataTable, Forms, ImageUploader…
│   ├── lib/
│   │   ├── mongodb.ts            ← Mongoose connection singleton
│   │   ├── blob.ts               ← Vercel Blob helpers
│   │   ├── utils.ts              ← cn(), slugify(), formatDate()…
│   │   └── seo.ts                ← buildSEO() metadata factory
│   ├── models/
│   │   ├── Beer.ts               ← Beer Mongoose model
│   │   ├── BlogPost.ts           ← BlogPost Mongoose model
│   │   ├── Event.ts              ← Event Mongoose model
│   │   └── Contact.ts            ← Contact submission model
│   ├── hooks/
│   │   ├── use-beers.ts          ← Client beer data fetcher
│   │   ├── use-scroll.ts         ← Scroll position tracker
│   │   └── use-media-query.ts    ← Responsive breakpoints
│   ├── types/
│   │   ├── beer.ts
│   │   ├── blog.ts
│   │   └── event.ts
│   └── config/
│       ├── site.ts               ← Brand info, nav links, socials, contact
│       └── fonts.ts              ← Inter + Playfair Display + DM Sans
├── .env.example                  ← Environment variable template
├── .gitignore
├── ONBOARDING.md                 ← New developer setup guide
├── README.md
├── next.config.ts
└── tsconfig.json
```

---

## Request Lifecycle

### Public page request (e.g. GET `/en/menu`)
```
Browser → Vercel Edge → Next.js Middleware
  → Detects locale ("en") from path
  → Passes to (marketing)/menu/page.tsx (Server Component)
    → Fetches data from MongoDB directly (server-side)
    → Renders HTML with translations from i18n dictionaries
  → Returns complete HTML to browser
```

### API request (e.g. GET `/api/beers`)
```
Client → /api/beers/route.ts
  → connectToDatabase() (cached Mongoose connection)
  → Beer.find().lean()
  → Response.json(beers)
```

### Admin page request (e.g. GET `/admin/beers`)
```
Browser → Next.js Middleware
  → Checks NextAuth session (Google OAuth)
  → If no session → redirect to /api/auth/signin
  → If session + role check fails → redirect to /unauthorized
  → (admin)/admin/beers/page.tsx renders
```

### Image upload (e.g. POST `/api/upload`)
```
Admin form → /api/upload/route.ts
  → Validates file type + size
  → uploadBlob(filename, file) → Vercel Blob
  → Returns { url: "https://blob.vercel.com/..." }
  → URL saved to MongoDB document (e.g. Beer.imageUrl)
```

---

## Key Design Decisions

### Why Next.js for backend?
Reduces operational complexity — one deployment, one codebase. API routes run as Vercel Serverless Functions. For a brand website at this scale, this is the right tradeoff.

### Why MongoDB?
Schema flexibility is important during early design — beer styles, event types, and blog structure may evolve. Mongoose provides schema validation while keeping migration overhead low.

### Why Vercel Blob for images?
Native integration with Vercel — no separate AWS S3 setup, no CORS config, and images are served from the CDN edge automatically.

### Why Google OAuth only?
Simplifies the auth surface. The security model relies on role allowlisting in MongoDB — only users with a matching email and an assigned role can access admin features. See [authentication.md](./authentication.md) for details.
