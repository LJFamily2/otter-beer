import { z } from "zod";
import { ALLOWED_IMAGE_CONTENT_TYPES } from "@/lib/storage/constants";

export const RequestUploadSchema = z.object({
  contentType: z.enum(
    ALLOWED_IMAGE_CONTENT_TYPES as unknown as [string, ...string[]]
  ),
});

export const RequestViewUrlSchema = z.object({
  key: z.string().trim().min(1),
});

export const RequestDeleteSchema = z.object({
  key: z.string().trim().min(1),
});

export type RequestUploadInput = z.infer<typeof RequestUploadSchema>;
export type RequestViewUrlInput = z.infer<typeof RequestViewUrlSchema>;
export type RequestDeleteInput = z.infer<typeof RequestDeleteSchema>;
