export const ALLOWED_IMAGE_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export type AllowedImageContentType =
  (typeof ALLOWED_IMAGE_CONTENT_TYPES)[number];

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB, per docs/security.md

export function isAllowedImageContentType(
  value: string
): value is AllowedImageContentType {
  return (ALLOWED_IMAGE_CONTENT_TYPES as readonly string[]).includes(value);
}

/**
 * Public, cacheable URL for an image key that belongs to a published post
 * (or is being previewed by an authenticated admin) — see
 * src/app/api/media/public/[...key]/route.ts. Kept in this dependency-free
 * file (not StorageService.ts) so importing it never pulls in the AWS SDK /
 * R2 client — src/lib/seo.ts and every page component that renders a post
 * image needs just this string builder, nothing else from the storage layer.
 */
export function publicImageUrl(key: string): string {
  return `/api/media/public/${key}`;
}
