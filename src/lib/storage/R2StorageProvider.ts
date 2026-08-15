import { S3Client, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "@/lib/env";
import type {
  CreateUploadRequest,
  CreateViewUrlRequest,
  IStorageProvider,
  PresignedUpload,
  StoredObject,
} from "./IStorageProvider";

const DEFAULT_UPLOAD_TTL_SECONDS = 5 * 60;
const DEFAULT_VIEW_TTL_SECONDS = 60 * 60;

/**
 * Cloudflare R2 is S3-compatible, so the AWS SDK v3 clients work against it
 * by pointing `endpoint` at the account's R2 endpoint with region "auto".
 * The bucket is private (per project decision) — every read goes through a
 * short-lived signed URL rather than a public bucket domain.
 */
export class R2StorageProvider implements IStorageProvider {
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor() {
    this.bucket = env.R2_BUCKET_NAME;
    this.client = new S3Client({
      region: "auto",
      endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY,
      },
    });
  }

  async createPresignedUpload(
    request: CreateUploadRequest
  ): Promise<PresignedUpload> {
    const expiresInSeconds =
      request.expiresInSeconds ?? DEFAULT_UPLOAD_TTL_SECONDS;

    // A presigned POST (vs. a bare presigned PUT) lets us enforce content
    // type and a max file size in the policy itself, matching the upload
    // checks required by docs/security.md, rather than trusting the client.
    const { url, fields } = await createPresignedPost(this.client, {
      Bucket: this.bucket,
      Key: request.key,
      Conditions: [
        ["content-length-range", 0, request.maxSizeBytes],
        ["eq", "$Content-Type", request.contentType],
      ],
      Fields: {
        "Content-Type": request.contentType,
      },
      Expires: expiresInSeconds,
    });

    return {
      key: request.key,
      url,
      fields,
      expiresAt: new Date(Date.now() + expiresInSeconds * 1000),
    };
  }

  async createViewUrl(request: CreateViewUrlRequest): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: request.key,
    });
    return getSignedUrl(this.client, command, {
      expiresIn: request.expiresInSeconds ?? DEFAULT_VIEW_TTL_SECONDS,
    });
  }

  async getObject(key: string): Promise<StoredObject | null> {
    try {
      const result = await this.client.send(
        new GetObjectCommand({ Bucket: this.bucket, Key: key })
      );
      if (!result.Body) return null;
      const body = await result.Body.transformToByteArray();
      return {
        body,
        contentType: result.ContentType ?? "application/octet-stream",
      };
    } catch (err) {
      if (
        err instanceof Error &&
        (err.name === "NoSuchKey" || err.name === "NotFound")
      ) {
        return null;
      }
      throw err;
    }
  }

  async deleteObject(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key })
    );
  }
}
