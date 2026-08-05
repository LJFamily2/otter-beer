# Database Schema

## Overview

OtterBeer uses **MongoDB** hosted on **MongoDB Atlas** with **Mongoose** as the ODM.
All models live in `src/models/`.

> **Fresh database** — no migration needed. Schemas are defined below.

---

## Collections

### `beers`
Managed via [`src/models/Beer.ts`](../src/models/Beer.ts)

| Field | Type | Required | Notes |
|---|---|---|---|
| `_id` | ObjectId | Auto | MongoDB default |
| `name` | String | ✅ | Beer name |
| `slug` | String | ✅ | URL-safe slug (unique) |
| `description` | String | ✅ | Full description |
| `style` | String | ✅ | e.g. "IPA", "Stout", "Lager" |
| `abv` | Number | ✅ | Alcohol by volume (%) — 0–100 |
| `ibu` | Number | ❌ | International Bitterness Units |
| `price` | Number | ✅ | Price in VND |
| `imageUrl` | String | ❌ | Vercel Blob URL |
| `isAvailable` | Boolean | ✅ | Default: `true` |
| `isFeatured` | Boolean | ✅ | Show on homepage — Default: `false` |
| `tags` | String[] | ❌ | e.g. `["craft", "local", "seasonal"]` |
| `createdAt` | Date | Auto | Mongoose timestamp |
| `updatedAt` | Date | Auto | Mongoose timestamp |

**Example document:**
```json
{
  "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
  "name": "Otter IPA",
  "slug": "otter-ipa",
  "description": "Một loại IPA cân bằng với hương hoa bia và vị đắng nhẹ.",
  "style": "IPA",
  "abv": 6.2,
  "ibu": 45,
  "price": 75000,
  "imageUrl": "https://blob.vercel.com/beers/otter-ipa-abc123.webp",
  "isAvailable": true,
  "isFeatured": true,
  "tags": ["ipa", "craft", "featured"],
  "createdAt": "2026-01-15T10:00:00Z",
  "updatedAt": "2026-01-15T10:00:00Z"
}
```

---

### `blogposts`
Managed via [`src/models/BlogPost.ts`](../src/models/BlogPost.ts)

| Field | Type | Required | Notes |
|---|---|---|---|
| `_id` | ObjectId | Auto | |
| `title` | String | ✅ | Post title |
| `slug` | String | ✅ | URL slug (unique) |
| `excerpt` | String | ✅ | Max 300 chars — used in cards |
| `content` | String | ✅ | Markdown or HTML body |
| `coverImageUrl` | String | ❌ | Vercel Blob URL |
| `author` | String | ✅ | Default: "Otter Beer Team" |
| `tags` | String[] | ❌ | |
| `isPublished` | Boolean | ✅ | Default: `false` |
| `publishedAt` | Date | ❌ | Auto-set when `isPublished` → `true` |
| `createdAt` | Date | Auto | |
| `updatedAt` | Date | Auto | |

---

### `events`
Managed via [`src/models/Event.ts`](../src/models/Event.ts)

| Field | Type | Required | Notes |
|---|---|---|---|
| `_id` | ObjectId | Auto | |
| `title` | String | ✅ | |
| `slug` | String | ✅ | Unique |
| `description` | String | ✅ | |
| `coverImageUrl` | String | ❌ | Vercel Blob URL |
| `location` | String | ✅ | Venue name / address |
| `startDate` | Date | ✅ | |
| `endDate` | Date | ❌ | |
| `isFree` | Boolean | ✅ | Default: `true` |
| `ticketPrice` | Number | ❌ | VND — only if `isFree === false` |
| `ticketUrl` | String | ❌ | External ticketing link |
| `isPublished` | Boolean | ✅ | Default: `false` |
| `tags` | String[] | ❌ | |
| `createdAt` | Date | Auto | |
| `updatedAt` | Date | Auto | |

---

### `contacts`
Managed via [`src/models/Contact.ts`](../src/models/Contact.ts)

| Field | Type | Required | Notes |
|---|---|---|---|
| `_id` | ObjectId | Auto | |
| `name` | String | ✅ | |
| `email` | String | ✅ | Validated format |
| `phone` | String | ❌ | |
| `subject` | String | ✅ | |
| `message` | String | ✅ | |
| `status` | Enum | ✅ | `"new"` \| `"read"` \| `"replied"` \| `"archived"` |
| `createdAt` | Date | Auto | |
| `updatedAt` | Date | Auto | |

---

### `users`
> **TODO:** To be created with auth implementation.
> Managed via `src/models/User.ts`

| Field | Type | Required | Notes |
|---|---|---|---|
| `_id` | ObjectId | Auto | |
| `email` | String | ✅ | Google account email (unique) |
| `name` | String | ✅ | Display name |
| `image` | String | ❌ | Google profile picture URL |
| `role` | Enum | ✅ | `"super_admin"` \| `"editor"` \| `"viewer"` |
| `isActive` | Boolean | ✅ | Set `false` to revoke access |
| `createdAt` | Date | Auto | |
| `updatedAt` | Date | Auto | |

---

## Indexes

Recommended indexes for performance (set up via MongoDB Atlas UI or migration script):

```javascript
// beers
db.beers.createIndex({ slug: 1 }, { unique: true });
db.beers.createIndex({ isAvailable: 1, isFeatured: 1 });

// blogposts
db.blogposts.createIndex({ slug: 1 }, { unique: true });
db.blogposts.createIndex({ isPublished: 1, publishedAt: -1 });

// events
db.events.createIndex({ slug: 1 }, { unique: true });
db.events.createIndex({ isPublished: 1, startDate: 1 });

// users
db.users.createIndex({ email: 1 }, { unique: true });
```

---

## MongoDB Atlas Setup

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a database named `otter-beer`
3. Create a database user with **readWrite** on `otter-beer`
4. Whitelist `0.0.0.0/0` for Vercel (or use Vercel's IP list)
5. Copy the connection string to `MONGODB_URI` in `.env.local`

**Connection string format:**
```
mongodb+srv://<user>:<password>@<cluster>.mongodb.net/otter-beer?retryWrites=true&w=majority
```
