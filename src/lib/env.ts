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

  // Cloudflare R2 (S3-compatible, private bucket + signed URLs)
  R2_ACCOUNT_ID: z.string().min(1),
  R2_ACCESS_KEY_ID: z.string().min(1),
  R2_SECRET_ACCESS_KEY: z.string().min(1),
  R2_BUCKET_NAME: z.string().min(1),

  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
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
