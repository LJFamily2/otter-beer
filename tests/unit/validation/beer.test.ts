import { BeerCreateSchema, BeerUpdateSchema } from "@/lib/validation/beer";

function viTranslation(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    locale: "vi",
    style: "Premium Lager",
    headline: "BREWING\nCONNECTIONS.",
    description: "A crisp, golden pour born in Tay Ninh.",
    ...overrides,
  };
}

function baseBeer(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    abv: 4.3,
    ibu: 20,
    translations: [viTranslation()],
    ...overrides,
  };
}

describe("BeerCreateSchema", () => {
  it("accepts a valid beer with only the required (vi) locale", () => {
    const result = BeerCreateSchema.safeParse(baseBeer());
    expect(result.success).toBe(true);
  });

  it("rejects a beer missing the required vi locale", () => {
    const result = BeerCreateSchema.safeParse(
      baseBeer({ translations: [viTranslation({ locale: "en" })] })
    );
    expect(result.success).toBe(false);
  });

  it("rejects duplicate locales in the same beer", () => {
    const result = BeerCreateSchema.safeParse(
      baseBeer({ translations: [viTranslation(), viTranslation()] })
    );
    expect(result.success).toBe(false);
  });

  it("rejects an unsupported locale code", () => {
    const result = BeerCreateSchema.safeParse(
      baseBeer({ translations: [{ ...viTranslation(), locale: "fr" }] })
    );
    expect(result.success).toBe(false);
  });

  it("rejects ABV/IBU out of range", () => {
    expect(BeerCreateSchema.safeParse(baseBeer({ abv: -1 })).success).toBe(false);
    expect(BeerCreateSchema.safeParse(baseBeer({ abv: 101 })).success).toBe(false);
    expect(BeerCreateSchema.safeParse(baseBeer({ ibu: 201 })).success).toBe(false);
  });

  it("rejects a missing ABV or IBU", () => {
    expect(BeerCreateSchema.safeParse({ ibu: 20, translations: [viTranslation()] }).success).toBe(false);
    expect(BeerCreateSchema.safeParse({ abv: 4.3, translations: [viTranslation()] }).success).toBe(false);
  });

  it("defaults status to draft and isFeatured to false", () => {
    const result = BeerCreateSchema.parse(baseBeer());
    expect(result.status).toBe("draft");
    expect(result.isFeatured).toBe(false);
  });

  it("accepts valid 6-digit hex theme colors", () => {
    const result = BeerCreateSchema.safeParse(
      baseBeer({ themeColor: "#002867", themeColorContainer: "#1d3f82" })
    );
    expect(result.success).toBe(true);
  });

  it("allows omitting theme colors entirely", () => {
    const result = BeerCreateSchema.safeParse(baseBeer());
    expect(result.success).toBe(true);
  });

  it("rejects a malformed hex theme color", () => {
    expect(BeerCreateSchema.safeParse(baseBeer({ themeColor: "002867" })).success).toBe(false);
    expect(BeerCreateSchema.safeParse(baseBeer({ themeColor: "#00286" })).success).toBe(false);
    expect(BeerCreateSchema.safeParse(baseBeer({ themeColor: "red" })).success).toBe(false);
    expect(
      BeerCreateSchema.safeParse(baseBeer({ themeColorContainer: "#gggggg" })).success
    ).toBe(false);
  });
});

describe("BeerUpdateSchema", () => {
  it("allows a partial update with no translations", () => {
    const result = BeerUpdateSchema.safeParse({ status: "published" });
    expect(result.success).toBe(true);
  });

  it("still enforces the required-locale rule when translations are provided", () => {
    const result = BeerUpdateSchema.safeParse({
      translations: [{ ...viTranslation(), locale: "en" }],
    });
    expect(result.success).toBe(false);
  });

  it("allows clearing imageKey/shopUrl/findLocallyUrl via null", () => {
    const result = BeerUpdateSchema.safeParse({
      imageKey: null,
      shopUrl: null,
      findLocallyUrl: null,
    });
    expect(result.success).toBe(true);
  });

  it("allows clearing theme colors via null", () => {
    const result = BeerUpdateSchema.safeParse({
      themeColor: null,
      themeColorContainer: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects a malformed hex theme color on update", () => {
    const result = BeerUpdateSchema.safeParse({ themeColor: "not-a-color" });
    expect(result.success).toBe(false);
  });
});
