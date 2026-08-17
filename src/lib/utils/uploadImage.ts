import {
  ALLOWED_IMAGE_CONTENT_TYPES,
  MAX_IMAGE_SIZE_BYTES,
} from "@/lib/storage/constants";

export interface UploadedImage {
  key: string;
  /** Ready to use as an <img src> immediately — see the media/public route's admin-preview gate. */
  url: string;
}

export class ImageUploadError extends Error {}

async function purgeOversizedUpload(key: string): Promise<void> {
  await fetch("/api/media/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key }),
  });
}

/**
 * Client-side upload flow: ask the server for a signed upload, upload
 * directly to Cloudinary, then return the object key + its (already-
 * viewable, even pre-publish) public proxy URL. Used by both the cover
 * image field and the Tiptap inline image button.
 *
 * Cloudinary has no server-side way to reject an oversized file before
 * storing it (unlike R2's presigned-POST content-length-range condition —
 * see docs/security.md), so the client-side check below is a UX
 * short-circuit only. The real enforcement is the `bytes` Cloudinary
 * reports back in its own upload response: if that exceeds the cap, the
 * object is purged immediately via /api/media/delete before this ever
 * returns a usable key.
 */
export async function uploadImage(file: File): Promise<UploadedImage> {
  if (!ALLOWED_IMAGE_CONTENT_TYPES.includes(file.type as never)) {
    throw new ImageUploadError(
      "Chỉ chấp nhận ảnh JPEG, PNG, WebP, hoặc GIF."
    );
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new ImageUploadError("Kích thước ảnh tối đa là 5MB.");
  }

  const presignResponse = await fetch("/api/media/upload-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contentType: file.type }),
  });
  if (!presignResponse.ok) {
    throw new ImageUploadError("Không thể chuẩn bị tải ảnh lên.");
  }
  const presigned = (await presignResponse.json()) as {
    key: string;
    url: string;
    fields: Record<string, string>;
  };

  const formData = new FormData();
  for (const [field, value] of Object.entries(presigned.fields)) {
    formData.append(field, value);
  }
  formData.append("file", file);

  const uploadResponse = await fetch(presigned.url, {
    method: "POST",
    body: formData,
  });
  if (!uploadResponse.ok) {
    throw new ImageUploadError("Tải ảnh lên thất bại.");
  }

  // Not every provider's upload response is JSON with a `bytes` field (R2's
  // presigned-POST success response is an empty 204) — providers that
  // already reject oversized files at the storage layer itself (R2) need
  // no follow-up check, so a parse failure here just means "nothing to
  // verify," not an error.
  let uploadedBytes: number | undefined;
  try {
    const body = (await uploadResponse.json()) as { bytes?: number };
    uploadedBytes = typeof body.bytes === "number" ? body.bytes : undefined;
  } catch {
    uploadedBytes = undefined;
  }
  if (uploadedBytes !== undefined && uploadedBytes > MAX_IMAGE_SIZE_BYTES) {
    await purgeOversizedUpload(presigned.key);
    throw new ImageUploadError("Kích thước ảnh tối đa là 5MB.");
  }

  return { key: presigned.key, url: `/api/media/public/${presigned.key}` };
}
