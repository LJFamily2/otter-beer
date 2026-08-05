# API Reference

All API routes are located in `src/app/api/`.
Base URL: `https://otterbeer.vn/api` (production) / `http://localhost:3000/api` (dev)

> **Note:** Admin write operations (POST, PUT, DELETE) will require an authenticated session once auth is implemented. Currently no auth middleware is applied.

---

## 🍺 Beers

### `GET /api/beers`
Returns a list of beers.

**Query parameters:**
| Param | Type | Description |
|---|---|---|
| `featured` | `"true"` | Return only featured, available beers |

**Response `200`:**
```json
[
  {
    "_id": "64f1a2b3...",
    "name": "Otter IPA",
    "slug": "otter-ipa",
    "style": "IPA",
    "abv": 6.2,
    "price": 75000,
    "imageUrl": "https://blob.vercel.com/...",
    "isFeatured": true
  }
]
```

---

### `POST /api/beers`
Create a new beer. *(Requires `editor` or `super_admin` role)*

**Request body:**
```json
{
  "name": "Otter Stout",
  "slug": "otter-stout",
  "description": "Rich and roasty...",
  "style": "Stout",
  "abv": 5.8,
  "price": 70000,
  "isAvailable": true,
  "isFeatured": false,
  "tags": ["stout", "dark"]
}
```

**Response `201`:** Full beer document.

---

### `GET /api/beers/[id]`
Get a single beer by MongoDB ObjectId.

**Response `200`:** Full beer document.
**Response `404`:** `{ "error": "Beer not found" }`

---

### `PUT /api/beers/[id]`
Update a beer. *(Requires `editor` or `super_admin` role)*

**Request body:** Any subset of beer fields to update.
**Response `200`:** Updated beer document.

---

### `DELETE /api/beers/[id]`
Delete a beer. *(Requires `super_admin` role)*

**Response `204`:** No content.

---

## 📝 Blog

### `GET /api/blog`
Returns published blog posts with pagination.

**Query parameters:**
| Param | Type | Default | Description |
|---|---|---|---|
| `page` | number | `1` | Page number |
| `limit` | number | `10` | Posts per page |

**Response `200`:**
```json
{
  "posts": [...],
  "total": 42,
  "page": 1,
  "limit": 10
}
```

---

### `POST /api/blog`
Create a new blog post. *(Requires `editor` or `super_admin` role)*

**Request body:**
```json
{
  "title": "The Story of Otter IPA",
  "slug": "story-of-otter-ipa",
  "excerpt": "How we crafted our signature IPA...",
  "content": "<p>Full HTML or Markdown content...</p>",
  "author": "Otter Beer Team",
  "isPublished": false,
  "tags": ["brewing", "ipa"]
}
```

**Response `201`:** Full blog post document.

---

### `GET /api/blog/[slug]`
Get a single published blog post by slug.

**Response `200`:** Full blog post document.
**Response `404`:** `{ "error": "Post not found" }`

---

### `PUT /api/blog/[slug]`
Update a blog post. *(Requires `editor` or `super_admin` role)*

---

### `DELETE /api/blog/[slug]`
Delete a blog post. *(Requires `super_admin` role)*
**Response `204`:** No content.

---

## 🎉 Events

### `GET /api/events`
Returns published events.

**Query parameters:**
| Param | Type | Description |
|---|---|---|
| `upcoming` | `"true"` | Return only events with `startDate >= now` |

**Response `200`:** Array of event card objects.

---

### `POST /api/events`
Create an event. *(Requires `editor` or `super_admin` role)*

**Request body:**
```json
{
  "title": "Tap Takeover Night",
  "slug": "tap-takeover-night-jan-2027",
  "description": "Join us for a special tap takeover...",
  "location": "Otter Beer Bar, Hà Nội",
  "startDate": "2027-01-20T18:00:00Z",
  "endDate": "2027-01-20T23:00:00Z",
  "isFree": false,
  "ticketPrice": 150000,
  "isPublished": false
}
```

**Response `201`:** Full event document.

---

### `GET /api/events/[id]`
Get a single event by ID.

### `PUT /api/events/[id]`
Update an event.

### `DELETE /api/events/[id]`
Delete an event.

---

## 📬 Contact

### `POST /api/contact`
Submit a contact form.

**Request body:**
```json
{
  "name": "Nguyễn Văn A",
  "email": "vana@example.com",
  "phone": "0912345678",
  "subject": "Đặt bàn nhóm",
  "message": "Tôi muốn đặt bàn cho nhóm 10 người vào ngày..."
}
```

**Required fields:** `name`, `email`, `subject`, `message`

**Response `201`:**
```json
{ "success": true, "id": "64f1a2b3..." }
```

---

## 📤 Upload

### `POST /api/upload`
Upload an image to Vercel Blob.

**Request:** `multipart/form-data`

| Field | Type | Description |
|---|---|---|
| `file` | File | The image to upload (JPEG, PNG, WebP, GIF) |
| `folder` | string | Storage prefix — e.g. `"beers"`, `"blog"`, `"events"` |

**Constraints:**
- Max file size: **5MB**
- Allowed types: `image/jpeg`, `image/png`, `image/webp`, `image/gif`

**Response `200`:**
```json
{
  "url": "https://abc123.public.blob.vercel-storage.com/beers/otter-ipa-xyz.webp",
  "pathname": "beers/otter-ipa-xyz.webp"
}
```

---

## 🔐 Auth

> **TODO:** Implemented with `next-auth@beta`

### `GET /api/auth/signin`
Redirects to Google OAuth consent screen.

### `GET /api/auth/callback/google`
OAuth callback handler — handled automatically by NextAuth.

### `GET /api/auth/session`
Returns the current session (if logged in).

**Response `200` (logged in):**
```json
{
  "user": {
    "name": "Nguyen Van A",
    "email": "admin@otterbeer.vn",
    "image": "https://lh3.googleusercontent.com/...",
    "role": "super_admin"
  },
  "expires": "2026-09-05T..."
}
```

---

## Error Response Format

All error responses follow this shape:
```json
{ "error": "Human-readable error message" }
```

| HTTP Status | Meaning |
|---|---|
| `200` | Success |
| `201` | Created |
| `204` | Deleted (no body) |
| `400` | Bad request / validation error |
| `401` | Unauthenticated |
| `403` | Insufficient role |
| `404` | Resource not found |
| `500` | Server error |
