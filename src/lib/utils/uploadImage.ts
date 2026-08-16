import { ALLOWED_IMAGE_CONTENT_TYPES } from "@/lib/storage/constants";

export interface UploadedImage {
  key: string;
  /** Ready to use as an <img src> immediately — see the media/public route's admin-preview gate. */
  url: string;
}

export class ImageUploadError extends Error {}

/**
 * Client-side upload flow: ask the server for a presigned POST, upload
 * directly to R2, then return the object key + its (already-viewable,
 * even pre-publish) public proxy URL. Used by both the cover image field
 * and the Tiptap inline image button.
 */
export async function uploadImage(file: File): Promise<UploadedImage> {
  if (!ALLOWED_IMAGE_CONTENT_TYPES.includes(file.type as never)) {
    throw new ImageUploadError(
      "Chỉ chấp nhận ảnh JPEG, PNG, WebP, hoặc GIF."
    );
  }
  if (file.size > 5 * 1024 * 1024) {
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

  return { key: presigned.key, url: `/api/media/public/${presigned.key}` };
}
