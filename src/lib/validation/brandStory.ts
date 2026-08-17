import { z } from "zod";
import { SUPPORTED_LOCALE_CODES, getRequiredLocales } from "@/config/locales";

const localeEnum = z.enum(
  SUPPORTED_LOCALE_CODES as unknown as [string, ...string[]]
);

export const BrandStoryPageTranslationInputSchema = z.object({
  locale: localeEnum,
  title: z
    .string({ message: "Vui lòng nhập tiêu đề trang" })
    .trim()
    .min(1, "Vui lòng nhập tiêu đề trang")
    .max(120, "Tiêu đề không được vượt quá 120 ký tự"),
  caption: z
    .string({ message: "Vui lòng nhập nội dung trang" })
    .trim()
    .min(1, "Vui lòng nhập nội dung trang")
    .max(200, "Nội dung không được vượt quá 200 ký tự"),
});

function validateTranslationSet(
  translations: { locale: string }[],
  ctx: z.RefinementCtx
) {
  const locales = translations.map((t) => t.locale);

  const missing = getRequiredLocales().filter((l) => !locales.includes(l));
  if (missing.length > 0) {
    const missingLabels = missing.map((l) => (l === "vi" ? "Tiếng Việt" : l === "en" ? "Tiếng Anh" : l));
    ctx.addIssue({
      code: "custom",
      path: ["translations"],
      message: `Thiếu nội dung ngôn ngữ bắt buộc: ${missingLabels.join(", ")}`,
    });
  }

  if (new Set(locales).size !== locales.length) {
    ctx.addIssue({
      code: "custom",
      path: ["translations"],
      message: "Mỗi ngôn ngữ chỉ được xuất hiện một lần trong mỗi trang",
    });
  }
}

export const BrandStoryPageInputSchema = z
  .object({
    imageKey: z
      .string({ message: "Vui lòng tải ảnh cho trang này" })
      .trim()
      .min(1, "Vui lòng tải ảnh cho trang này"),
    translations: z
      .array(BrandStoryPageTranslationInputSchema)
      .min(1, "Vui lòng điền nội dung cho ít nhất một ngôn ngữ bắt buộc"),
  })
  .superRefine((data, ctx) => validateTranslationSet(data.translations, ctx));

export const BrandStoryUpdateSchema = z.object({
  pages: z
    .array(BrandStoryPageInputSchema)
    .max(30, "Không được vượt quá 30 trang"),
});

export type BrandStoryPageInput = z.infer<typeof BrandStoryPageInputSchema>;
export type BrandStoryUpdateInput = z.infer<typeof BrandStoryUpdateSchema>;
