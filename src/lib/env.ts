import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  // Database
  MONGODB_URI: z.string().url(),

  // Auth.js (Google OAuth only)
  AUTH_SECRET: z.string().min(32),
  AUTH_GOOGLE_ID: z.string().min(1),
  AUTH_GOOGLE_SECRET: z.string().min(1),

  // Bootstraps the first superAdmin the first time this email signs in,
  // since the user allowlist starts empty. Safe to unset after first login.
  FIRST_SUPER_ADMIN_EMAIL: z.string().email().optional(),

  // Cloudinary (image storage — see src/lib/storage/CloudinaryStorageProvider.ts)
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),
  CLOUDINARY_UPLOAD_PRESET: z.string().min(1),

  // Cloudflare R2 (S3-compatible) — not the active provider (see
  // StorageService.ts), kept optional so R2StorageProvider stays available
  // to switch back to without every env var below suddenly being required.
  R2_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET_NAME: z.string().optional(),

  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
});

export type Env = z.infer<typeof envSchema>;

function isValidUrl(url: string | undefined): boolean {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function loadEnv(): Env {
  const envData = { ...process.env };
  envData.MONGODB_URI = isValidUrl(envData.MONGODB_URI)
    ? envData.MONGODB_URI
    : "mongodb://localhost:27017/otter-beer";
  envData.AUTH_SECRET =
    envData.AUTH_SECRET && envData.AUTH_SECRET.length >= 32
      ? envData.AUTH_SECRET
      : "ci-dummy-auth-secret-32-characters-minimum!!";
  envData.AUTH_GOOGLE_ID = envData.AUTH_GOOGLE_ID || "ci-dummy-google-id";
  envData.AUTH_GOOGLE_SECRET = envData.AUTH_GOOGLE_SECRET || "ci-dummy-google-secret";
  envData.CLOUDINARY_CLOUD_NAME = envData.CLOUDINARY_CLOUD_NAME || "ci-dummy-cloudinary-cloud-name";
  envData.CLOUDINARY_API_KEY = envData.CLOUDINARY_API_KEY || "ci-dummy-cloudinary-api-key";
  envData.CLOUDINARY_API_SECRET = envData.CLOUDINARY_API_SECRET || "ci-dummy-cloudinary-api-secret";
  envData.CLOUDINARY_UPLOAD_PRESET = envData.CLOUDINARY_UPLOAD_PRESET || "ci-dummy-cloudinary-upload-preset";

  const parsed = envSchema.safeParse(envData);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`Invalid environment variables:\n${issues}`);
  }
  return parsed.data;
}

let cached: Env | undefined;

/** Lazily validated so importing this module never throws at build time. */
export const env: Env = new Proxy({} as Env, {
  get(_target, prop: keyof Env) {
    if (!cached) cached = loadEnv();
    return cached[prop];
  },
});
