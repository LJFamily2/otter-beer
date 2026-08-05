# Design System

## Overview

OtterBeer uses a custom Vanilla CSS design system with CSS Custom Properties (variables).
All tokens are defined in [`src/app/globals.css`](../src/app/globals.css).

**Never hardcode colors, font sizes, or spacing.** Always use the tokens below.

---

## Color Palette

### Brand Colors — Warm Amber

| Token | Value | Use |
|---|---|---|
| `--color-brand-500` | `#e8740f` | Primary CTA buttons, highlights |
| `--color-brand-400` | `#f48c30` | Hover states, links |
| `--color-brand-600` | `#c95c08` | Active/pressed states |
| `--color-brand-700` | `#a04408` | Dark accents |

### Dark Backgrounds

| Token | Value | Use |
|---|---|---|
| `--color-dark-bg` | `#0e0804` | Page background |
| `--color-dark-card` | `#1a1008` | Card surfaces, modals |
| `--color-dark-border` | `#2e1e0f` | Dividers, input borders |

### Text Colors

| Token | Value | Use |
|---|---|---|
| `--color-cream` | `#faf5ed` | Primary text, headings |
| `--color-muted` | `#9d8572` | Secondary text, captions |

### Semantic Colors

| Token | Use |
|---|---|
| `--color-success` (`#22c55e`) | Success states |
| `--color-error` (`#ef4444`) | Error states |

---

## Typography

### Font Families

| Token | Font | Use |
|---|---|---|
| `--font-display` | Playfair Display | `h1`–`h3`, hero headlines, brand names |
| `--font-sans` | Inter | Body text, paragraphs |
| `--font-ui` | DM Sans | Buttons, labels, nav, captions |

### Font Size Scale (Fluid — responsive between mobile and desktop)

| Token | Range | Example use |
|---|---|---|
| `--text-xs` | 12–13px | Fine print, timestamps |
| `--text-sm` | 14–15px | Captions, tags |
| `--text-base` | 16–17px | Body text |
| `--text-lg` | 18–20px | Lead paragraphs |
| `--text-xl` | 20–24px | Section labels |
| `--text-2xl` | 24–32px | Card titles |
| `--text-3xl` | 30–40px | Section headings |
| `--text-4xl` | 36–52px | Page headings (h2) |
| `--text-5xl` | 44–72px | Hero headlines (h1) |
| `--text-6xl` | 56–96px | Giant display text |

### Usage
```css
/* Always use tokens, never hardcode px values */
.hero-title {
  font-family: var(--font-display);
  font-size: var(--text-5xl);
  color: var(--color-cream);
}

.button-label {
  font-family: var(--font-ui);
  font-size: var(--text-sm);
  font-weight: 600;
}
```

---

## Spacing Scale

| Token | Value | Use |
|---|---|---|
| `--space-1` | 4px | Minimal gaps |
| `--space-2` | 8px | Tight padding |
| `--space-3` | 12px | Icon padding |
| `--space-4` | 16px | Base padding (inputs, list items) |
| `--space-6` | 24px | Card padding |
| `--space-8` | 32px | Section gutter |
| `--space-12` | 48px | Large section gap |
| `--space-16` | 64px | Section padding |
| `--space-24` | 96px | Hero padding |
| `--space-32` | 128px | Massive section gap |

---

## Border Radius

| Token | Value | Use |
|---|---|---|
| `--radius-sm` | 6px | Inputs, small chips |
| `--radius-md` | 12px | Cards, dialogs |
| `--radius-lg` | 20px | Large cards, panels |
| `--radius-xl` | 32px | Hero sections |
| `--radius-full` | 9999px | Pills, circular icons |

---

## Shadows

| Token | Use |
|---|---|
| `--shadow-sm` | Subtle card lift |
| `--shadow-md` | Dropdown menus, modals |
| `--shadow-lg` | Floating panels |
| `--shadow-glow` | Amber glow effect on brand elements |

```css
/* Glow effect example */
.featured-card:hover {
  box-shadow: var(--shadow-glow);
}
```

---

## Transitions

| Token | Duration | Use |
|---|---|---|
| `--transition-fast` | 150ms ease | Hover color changes, icon swaps |
| `--transition-base` | 250ms ease | Button backgrounds, border changes |
| `--transition-slow` | 400ms cubic-bezier | Panels sliding, menus opening |
| `--transition-spring` | 500ms cubic-bezier(0.34, 1.56, 0.64, 1) | Bouncy card reveals |

---

## Layout Tokens

| Token | Value | Use |
|---|---|---|
| `--container-max` | 1280px | Max page width |
| `--container-prose` | 720px | Blog post body width |
| `--header-height` | 72px | Sticky navbar height |

---

## Utility Classes

Defined in `globals.css`:

| Class | Effect |
|---|---|
| `.container` | Centers content with responsive padding |
| `.prose` | Constrains width for readable text |
| `.skeleton` | Shimmering loading placeholder |
| `.animate-fade-in` | Fade up on mount |
| `.animate-scale-in` | Scale in on mount |

---

## Component Categories

### `components/ui/` — Atomic
Small, reusable building blocks:
- `Button` — primary, secondary, ghost variants
- `Badge` — style tags, ABV badges
- `Card` — base card container
- `Input`, `Textarea`, `Select`
- `Modal` — dialog overlay
- `Toast` — notification system
- `LanguageSwitcher` — VI/EN toggle

### `components/layout/` — Structural
- `Navbar` — sticky top nav with mobile hamburger
- `Footer` — links, socials, copyright
- `AdminSidebar` — collapsible admin navigation

### `components/sections/` — Page Sections
Full-width page sections used in marketing pages:
- `HeroSection` — full-bleed video/image hero
- `FeaturedBeers` — horizontal scroll beer cards
- `AboutTeaser` — brand story with image
- `UpcomingEvents` — 3-column event cards
- `LatestBlogPosts` — editorial blog cards
- `ContactCTA` — dark full-width CTA banner

### `components/admin/` — Admin Only
- `AdminSidebar`
- `DataTable` — sortable/filterable table
- `BeerForm`, `BlogPostForm`, `EventForm`
- `ImageUploader` — drag-and-drop to `/api/upload`
- `StatsCard` — dashboard metric widget

---

## Dark Theme Rationale

OtterBeer's aesthetic is inspired by dimly-lit craft beer bars — warm amber lighting against dark wood and stone. The palette:
- **Deep espresso backgrounds** (`#0e0804`) create atmosphere
- **Warm amber accents** (`#e8740f`) echo the color of craft beer in the glass
- **Cream text** (`#faf5ed`) is warm and readable, not cold white
- **Playfair Display** headings bring the premium, tactile feel of a printed beer menu
