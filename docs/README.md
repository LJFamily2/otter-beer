# 📚 OtterBeer — Project Documentation

Welcome to the official technical documentation for the **OtterBeer** website (otterbeer.vn).

---

## Quick Links

| Document | Description |
|---|---|
| [Architecture](./architecture.md) | System overview, tech stack, data flow |
| [Database Schema](./database-schema.md) | MongoDB collections & field definitions |
| [API Reference](./api-reference.md) | All API endpoints with examples |
| [Authentication & Roles](./authentication.md) | Google OAuth setup, roles, security model |
| [Internationalization (i18n)](./internationalization.md) | VI/EN language routing and translation |
| [Security](./security.md) | JWT/cookie storage, input validation, CSP, rate limiting |
| [Testing](./testing.md) | Testing strategy, AI agent workflow rule, Playwright + Jest |
| [Deployment](./deployment.md) | Vercel deployment guide |
| [Design System](./design-system.md) | Colors, fonts, tokens, components |

---

## Project Summary

**OtterBeer** is a bilingual (Vietnamese / English) craft beer brand website and content management platform.

- **Frontend**: Next.js 16 App Router with TypeScript — public marketing site (VI + EN)
- **Backend**: Next.js API Routes — REST API for all data
- **Database**: MongoDB + Mongoose
- **Image Storage**: Vercel Blob
- **Authentication**: Google OAuth via NextAuth.js — with role-based access control
- **Admin Panel**: Internal CMS at `/admin` — Vietnamese only, protected by roles
- **Deployment**: Vercel (frontend + serverless backend + blob storage)

---

## For New Developers

→ See [ONBOARDING.md](../ONBOARDING.md) for setup instructions.
