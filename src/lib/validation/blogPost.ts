import { z } from "zod";
import { SUPPORTED_LOCALE_CODES, getRequiredLocales } from "@/config/locales";
import { BLOG_POST_STATUSES } from "@/config/blogPost";

const localeEnum = z.enum(
  SUPPORTED_LOCALE_CODES as unknown as [string, ...string[]]
);

export const BlogPostTranslationInputSchema = z.object({
  locale: localeEnum,
  title: z.string().trim().min(1).max(200),
  // Optional — BlogPostService generates one from the title when omitted.
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with dashes")
    .optional(),
  excerpt: z.string().trim().min(1).max(300),
  content: z.string().min(1),
  seoTitle: z.string().trim().max(70).optional(),
  seoDescription: z.string().trim().max(160).optional(),
  seoKeywords: z.array(z.string().trim().max(50)).max(20).default([]),
  ogImageKey: z.string().trim().optional(),
});

function validateTranslationSet(
  translations: { locale: string }[],
  ctx: z.RefinementCtx
) {
  const locales = translations.map((t) => t.locale);

  const missing = getRequiredLocales().filter((l) => !locales.includes(l));
  if (missing.length > 0) {
    ctx.addIssue({
      code: "custom",
      path: ["translations"],
      message: `Missing required language content: ${missing.join(", ")}`,
    });
  }

  if (new Set(locales).size !== locales.length) {
    ctx.addIssue({
      code: "custom",
      path: ["translations"],
      message: "Each language may only appear once per post",
    });
  }
}

export const BlogPostCreateSchema = z
  .object({
    coverImageKey: z.string().trim().optional(),
    tags: z.array(z.string().trim().max(30)).max(10).default([]),
    status: z.enum(BLOG_POST_STATUSES).default("draft"),
    translations: z.array(BlogPostTranslationInputSchema).min(1),
  })
  .superRefine((data, ctx) => validateTranslationSet(data.translations, ctx));

export const BlogPostUpdateSchema = z
  .object({
    coverImageKey: z.string().trim().nullable().optional(),
    tags: z.array(z.string().trim().max(30)).max(10).optional(),
    status: z.enum(BLOG_POST_STATUSES).optional(),
    translations: z.array(BlogPostTranslationInputSchema).min(1).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.translations) validateTranslationSet(data.translations, ctx);
  });

export type BlogPostCreateInput = z.infer<typeof BlogPostCreateSchema>;
export type BlogPostUpdateInput = z.infer<typeof BlogPostUpdateSchema>;
