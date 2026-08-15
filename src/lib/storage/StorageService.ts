import { randomUUID } from "node:crypto";
import type {
  IStorageProvider,
  PresignedUpload,
  StoredObject,
} from "./IStorageProvider";
import { R2StorageProvider } from "./R2StorageProvider";

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

const EXTENSION_BY_CONTENT_TYPE: Record<AllowedImageContentType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

/**
 * Domain-level wrapper around a storage provider: builds namespaced object
 * keys, enforces the image allowlist/size cap, and is what services/routes
 * import instead of touching R2StorageProvider directly.
 */
export class StorageService {
  constructor(private readonly provider: IStorageProvider) {}

  buildImageKey(namespace: string, contentType: AllowedImageContentType): string {
    const ext = EXTENSION_BY_CONTENT_TYPE[contentType];
    const datePrefix = new Date().toISOString().slice(0, 10);
    return `${namespace}/${datePrefix}/${randomUUID()}.${ext}`;
  }

  async requestImageUpload(
    namespace: string,
    contentType: string
  ): Promise<PresignedUpload> {
    if (!isAllowedImageContentType(contentType)) {
      throw new Error(`Unsupported image content type: ${contentType}`);
    }
    const key = this.buildImageKey(namespace, contentType);
    return this.provider.createPresignedUpload({
      key,
      contentType,
      maxSizeBytes: MAX_IMAGE_SIZE_BYTES,
    });
  }

  async getViewUrl(key: string): Promise<string> {
    return this.provider.createViewUrl({ key });
  }

  async getObject(key: string): Promise<StoredObject | null> {
    return this.provider.getObject(key);
  }

  async deleteObject(key: string): Promise<void> {
    await this.provider.deleteObject(key);
  }
}

export const storageService = new StorageService(new R2StorageProvider());

/** Public, cacheable URL for an image key that belongs to a published post — see src/app/api/media/public/[...key]/route.ts. */
export function publicImageUrl(key: string): string {
  return `/api/media/public/${key}`;
}
