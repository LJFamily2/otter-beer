# Authentication & Roles

## Overview

OtterBeer uses **Google OAuth** exclusively (via [NextAuth.js / Auth.js v5](https://authjs.dev)) for admin authentication. The public marketing site has no authentication. The admin panel (`/admin/*`) is fully protected.

---

## Is Google-Only OAuth Safe?

**Yes — with the right safeguards in place.** Here's the full picture:

### ✅ What Google OAuth gives you
- No passwords stored in your database (Google handles credentials)
- Built-in brute-force protection (Google's own systems)
- MFA support — users can enable Google 2FA on their own account
- OAuth tokens expire and rotate automatically
- Industry-standard protocol (OAuth 2.0)

### ⚠️ The one risk: Account compromise
If a team member's Google account is ever compromised, the attacker gets admin access. Mitigations:
1. **Enforce an allowlist** — only emails you explicitly add can log in, even with a valid Google account
2. **Granular roles** — limit damage by restricting what each role can do
3. **Encourage Google 2FA** — strongly recommend all admins enable it on their Google accounts
4. **Audit logs** — log all admin write actions (create/update/delete) to MongoDB

### ✅ Verdict
Google-only OAuth is production-safe for a lean team. You can always add a second provider (e.g. email+password, GitHub) later without breaking existing users.

---

## Role System

### Roles

| Role | Description | Access |
|---|---|---|
| `super_admin` | Full access, can manage users | Everything |
| `editor` | Can manage beers, blog, events | Content CRUD only |
| `viewer` | Read-only admin access | View only, no mutations |

### User Model

A `User` MongoDB collection stores Google OAuth profiles with an assigned role:

```typescript
interface IUser {
  email: string;          // Google account email (unique key)
  name: string;
  image?: string;         // Google profile picture URL
  role: "super_admin" | "editor" | "viewer";
  isActive: boolean;      // Set to false to revoke access without deleting
  createdAt: Date;
  updatedAt: Date;
}
```

### Access Control Flow

```
Google OAuth callback
  → NextAuth creates/updates session
  → NextAuth callbacks.signIn():
      → Look up user by email in MongoDB
      → If NOT in allowlist → return false (deny login)
      → If isActive === false → return false (revoked)
      → If found → attach role to session token
  → Middleware checks session role per route
```

### Route Protection Matrix

| Route | Required Role | Redirect if denied |
|---|---|---|
| `/admin` | Any valid role | `/api/auth/signin` |
| `/admin/beers` | `editor` or `super_admin` | `/admin` (unauthorized) |
| `/admin/blog` | `editor` or `super_admin` | `/admin` (unauthorized) |
| `/admin/events` | `editor` or `super_admin` | `/admin` (unauthorized) |
| `/admin/users` | `super_admin` only | `/admin` (unauthorized) |

---

## NextAuth.js Setup

> **TODO:** Install `next-auth@beta` and configure the Google provider.

### Install
```bash
npm install next-auth@beta
```

### Environment Variables (add to `.env.local`)
```bash
AUTH_SECRET=<generate with: openssl rand -base64 32>
AUTH_GOOGLE_ID=<from Google Cloud Console>
AUTH_GOOGLE_SECRET=<from Google Cloud Console>
```

### Google Cloud Console Setup
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project (or use existing)
3. Enable **Google+ API** and **Google Identity**
4. Create OAuth 2.0 credentials:
   - Application type: **Web application**
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (dev)
     - `https://otterbeer.vn/api/auth/callback/google` (prod)
5. Copy the **Client ID** and **Client Secret** to `.env.local`

### Key Files to Create
```
src/
├── auth.ts                      ← NextAuth config (providers, callbacks, adapter)
├── middleware.ts                ← Route protection logic
└── app/
    └── api/
        └── auth/
            └── [...nextauth]/
                └── route.ts     ← NextAuth handler
```

### Callbacks (conceptual)
```typescript
// In auth.ts
callbacks: {
  async signIn({ user }) {
    // Check allowlist in MongoDB
    const dbUser = await User.findOne({ email: user.email, isActive: true });
    return !!dbUser; // deny if not found
  },
  async session({ session, token }) {
    // Attach role to session
    session.user.role = token.role;
    return session;
  },
  async jwt({ token, user }) {
    if (user) {
      const dbUser = await User.findOne({ email: user.email });
      token.role = dbUser?.role ?? "viewer";
    }
    return token;
  },
}
```

---

## Adding the First Admin User

Since the allowlist starts empty, you need to **seed the first user manually**:

```javascript
// Run once with: node scripts/seed-admin.js
// (create this script in a /scripts folder)

const user = {
  email: "your-email@gmail.com",
  name: "Your Name",
  role: "super_admin",
  isActive: true,
};
// Insert into MongoDB User collection
```

After logging in as `super_admin`, you can add other users through the `/admin/users` panel.

---

## Security Checklist

- [ ] `AUTH_SECRET` is set and is at least 32 random bytes
- [ ] Google Cloud OAuth redirect URIs are correctly configured for prod
- [ ] First `super_admin` user is seeded in MongoDB
- [ ] All admin routes are protected by middleware role checks
- [ ] `isActive: false` is used to revoke access (not deletion)
- [ ] Admin actions (create/update/delete) are logged
- [ ] All team members are encouraged to enable Google 2FA
