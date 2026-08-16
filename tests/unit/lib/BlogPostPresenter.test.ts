import { pickTranslation } from "@/lib/utils/BlogPostPresenter";

function post(locales: string[]) {
  return {
    translations: locales.map((locale) => ({
      locale,
      title: `title-${locale}`,
      slug: `slug-${locale}`,
      excerpt: "",
      content: "",
      seoKeywords: [],
    })),
  };
}

describe("pickTranslation", () => {
  it("returns the exact-locale translation when it exists", () => {
    const result = pickTranslation(post(["vi", "en"]), "en");
    expect(result?.locale).toBe("en");
  });

  it("falls back to the default locale (vi) when the requested one is missing", () => {
    const result = pickTranslation(post(["vi"]), "en");
    expect(result?.locale).toBe("vi");
  });

  it("falls back to whatever exists if even the default locale is missing", () => {
    const result = pickTranslation(post(["fr"]), "en");
    expect(result?.locale).toBe("fr");
  });

  it("returns null for a post with no translations", () => {
    const result = pickTranslation(post([]), "vi");
    expect(result).toBeNull();
  });
});
