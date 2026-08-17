import { z } from "zod";
import { SUPPORTED_LOCALE_CODES, getRequiredLocales } from "@/config/locales";
import { BEER_STATUSES } from "@/config/beer";

const localeEnum = z.enum(
  SUPPORTED_LOCALE_CODES as unknown as [string, ...string[]]
);

export const BeerTranslationInputSchema = z.object({
  locale: localeEnum,
  style: z
    .string({ message: "Vui lòng nhập dòng bia" })
    .trim()
    .min(1, "Vui lòng nhập dòng bia")
    .max(60, "Dòng bia không được vượt quá 60 ký tự"),
  headline: z
    .string({ message: "Vui lòng nhập tiêu đề" })
    .trim()
    .min(1, "Vui lòng nhập tiêu đề")
    .max(200, "Tiêu đề không được vượt quá 200 ký tự"),
  description: z
    .string({ message: "Vui lòng nhập mô tả" })
    .trim()
    .min(1, "Vui lòng nhập mô tả")
    .max(400, "Mô tả không được vượt quá 400 ký tự"),
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
      message: "Mỗi ngôn ngữ chỉ được xuất hiện một lần trong mỗi sản phẩm",
    });
  }
}

const baseFields = {
  imageKey: z.string().trim().optional(),
  abv: z
    .number({ message: "Vui lòng nhập nồng độ cồn (ABV)" })
    .min(0, "ABV không được nhỏ hơn 0")
    .max(100, "ABV không được vượt quá 100"),
  ibu: z
    .number({ message: "Vui lòng nhập độ đắng (IBU)" })
    .min(0, "IBU không được nhỏ hơn 0")
    .max(200, "IBU không được vượt quá 200"),
  shopUrl: z.string().trim().min(1).optional(),
  findLocallyUrl: z.string().trim().min(1).optional(),
  isFeatured: z.boolean().default(false),
  status: z.enum(BEER_STATUSES).default("draft"),
};

export const BeerCreateSchema = z
  .object({
    ...baseFields,
    translations: z
      .array(BeerTranslationInputSchema)
      .min(1, "Vui lòng điền nội dung cho ít nhất một ngôn ngữ bắt buộc"),
  })
  .superRefine((data, ctx) => validateTranslationSet(data.translations, ctx));

export const BeerUpdateSchema = z
  .object({
    imageKey: z.string().trim().nullable().optional(),
    abv: baseFields.abv.optional(),
    ibu: baseFields.ibu.optional(),
    shopUrl: z.string().trim().min(1).nullable().optional(),
    findLocallyUrl: z.string().trim().min(1).nullable().optional(),
    isFeatured: z.boolean().optional(),
    status: z.enum(BEER_STATUSES).optional(),
    translations: z.array(BeerTranslationInputSchema).min(1).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.translations) validateTranslationSet(data.translations, ctx);
  });

export type BeerCreateInput = z.infer<typeof BeerCreateSchema>;
export type BeerUpdateInput = z.infer<typeof BeerUpdateSchema>;
