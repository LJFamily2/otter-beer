import { createHash } from "node:crypto";
import { env } from "@/lib/env";
import type {
  CreateUploadRequest,
  CreateViewUrlRequest,
  IStorageProvider,
  PresignedUpload,
  StoredObject,
} from "./IStorageProvider";

const DEFAULT_UPLOAD_TTL_SECONDS = 5 * 60;

export interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  uploadPreset: string;
}

/**
 * Cloudinary (S3-incompatible, unlike R2) — images are delivered straight
 * from Cloudinary's CDN via the media/public route's redirect, not proxied
 * through this app. The bucket-equivalent is public, so "privacy" for
 * unpublished drafts rests on the object key being an unguessable UUID
 * (StorageService.buildImageKey), same trust model most CDN-image setups
 * use — a deliberate tradeoff for real edge caching + f_auto/q_auto
 * transforms, see the discussion that picked this over proxying.
 *
 * Cloudinary's public_id must not include the file extension (it appends
 * the detected format itself at delivery), but StorageService's key format
 * is shared across providers and does include one — so every Cloudinary
 * call strips it via #toPublicId rather than changing the shared key format.
 */
export class CloudinaryStorageProvider implements IStorageProvider {
  private readonly config: CloudinaryConfig;

  constructor(config?: CloudinaryConfig) {
    this.config = config ?? {
      cloudName: env.CLOUDINARY_CLOUD_NAME,
      apiKey: env.CLOUDINARY_API_KEY,
      apiSecret: env.CLOUDINARY_API_SECRET,
      uploadPreset: env.CLOUDINARY_UPLOAD_PRESET,
    };
  }

  private toPublicId(key: string): string {
    return key.replace(/\.[^./]+$/, "");
  }

  private sign(params: Record<string, string>): string {
    const toSign = Object.keys(params)
      .sort()
      .map((name) => `${name}=${params[name]}`)
      .join("&");
    return createHash("sha1")
      .update(`${toSign}${this.config.apiSecret}`)
      .digest("hex");
  }

  async createPresignedUpload(
    request: CreateUploadRequest
  ): Promise<PresignedUpload> {
    const expiresInSeconds =
      request.expiresInSeconds ?? DEFAULT_UPLOAD_TTL_SECONDS;
    const timestamp = String(Math.floor(Date.now() / 1000));
    const publicId = this.toPublicId(request.key);

    // Format is enforced server-side because upload_preset (with its
    // dashboard-configured allowed_formats) is itself part of the signed
    // payload. Unlike R2's presigned-POST Conditions, Cloudinary has no
    // preset-level max file size — that's enforced after the fact, see
    // uploadImage.ts's post-upload bytes check.
    const signedParams = {
      public_id: publicId,
      timestamp,
      upload_preset: this.config.uploadPreset,
    };

    return {
      key: request.key,
      url: `https://api.cloudinary.com/v1_1/${this.config.cloudName}/image/upload`,
      fields: {
        api_key: this.config.apiKey,
        ...signedParams,
        signature: this.sign(signedParams),
      },
      expiresAt: new Date(Date.now() + expiresInSeconds * 1000),
    };
  }

  async createViewUrl(request: CreateViewUrlRequest): Promise<string> {
    const publicId = this.toPublicId(request.key);
    return `https://res.cloudinary.com/${this.config.cloudName}/image/upload/f_auto,q_auto/${publicId}`;
  }

  async getObject(key: string): Promise<StoredObject | null> {
    const url = await this.createViewUrl({ key });
    const response = await fetch(url);
    if (!response.ok) return null;
    return {
      body: new Uint8Array(await response.arrayBuffer()),
      contentType: response.headers.get("content-type") ?? "application/octet-stream",
    };
  }

  async deleteObject(key: string): Promise<void> {
    const publicId = this.toPublicId(key);
    const timestamp = String(Math.floor(Date.now() / 1000));
    const signedParams = { public_id: publicId, timestamp };

    await fetch(
      `https://api.cloudinary.com/v1_1/${this.config.cloudName}/image/destroy`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          ...signedParams,
          api_key: this.config.apiKey,
          signature: this.sign(signedParams),
        }),
      }
    );
  }
}
