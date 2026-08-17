import { BrandStoryPageInputSchema, BrandStoryUpdateSchema } from "@/lib/validation/brandStory";

function viTranslation(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    locale: "vi",
    title: "Copper Kettle Brewing History",
    caption: "Mashing, Boiling, Fermenting",
    ...overrides,
  };
}

function basePage(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    imageKey: "brand-story/page-1.jpg",
    translations: [viTranslation()],
    ...overrides,
  };
}

describe("BrandStoryPageInputSchema", () => {
  it("accepts a valid page with only the required (vi) locale", () => {
    const result = BrandStoryPageInputSchema.safeParse(basePage());
    expect(result.success).toBe(true);
  });

  it("rejects a page missing the required vi locale", () => {
    const result = BrandStoryPageInputSchema.safeParse(
      basePage({ translations: [viTranslation({ locale: "en" })] })
    );
    expect(result.success).toBe(false);
  });

  it("rejects duplicate locales on the same page", () => {
    const result = BrandStoryPageInputSchema.safeParse(
      basePage({ translations: [viTranslation(), viTranslation()] })
    );
    expect(result.success).toBe(false);
  });

  it("rejects an unsupported locale code", () => {
    const result = BrandStoryPageInputSchema.safeParse(
      basePage({ translations: [{ ...viTranslation(), locale: "fr" }] })
    );
    expect(result.success).toBe(false);
  });

  it("rejects a missing imageKey", () => {
    const result = BrandStoryPageInputSchema.safeParse({ translations: [viTranslation()] });
    expect(result.success).toBe(false);
  });

  it("rejects an empty imageKey", () => {
    const result = BrandStoryPageInputSchema.safeParse(basePage({ imageKey: "" }));
    expect(result.success).toBe(false);
  });

  it("rejects a title over the max length", () => {
    const result = BrandStoryPageInputSchema.safeParse(
      basePage({ translations: [viTranslation({ title: "a".repeat(121) })] })
    );
    expect(result.success).toBe(false);
  });

  it("rejects a caption over the max length", () => {
    const result = BrandStoryPageInputSchema.safeParse(
      basePage({ translations: [viTranslation({ caption: "a".repeat(201) })] })
    );
    expect(result.success).toBe(false);
  });
});

describe("BrandStoryUpdateSchema", () => {
  it("accepts an empty pages array (flipbook with no pages yet)", () => {
    const result = BrandStoryUpdateSchema.safeParse({ pages: [] });
    expect(result.success).toBe(true);
  });

  it("accepts multiple valid pages", () => {
    const result = BrandStoryUpdateSchema.safeParse({ pages: [basePage(), basePage()] });
    expect(result.success).toBe(true);
  });

  it("rejects more than 30 pages", () => {
    const pages = Array.from({ length: 31 }, () => basePage());
    const result = BrandStoryUpdateSchema.safeParse({ pages });
    expect(result.success).toBe(false);
  });

  it("rejects the whole payload when any single page is invalid", () => {
    const result = BrandStoryUpdateSchema.safeParse({
      pages: [basePage(), basePage({ imageKey: "" })],
    });
    expect(result.success).toBe(false);
  });

  it("requires a pages field", () => {
    const result = BrandStoryUpdateSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
