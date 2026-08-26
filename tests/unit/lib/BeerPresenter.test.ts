import { pickTranslation, toShowcaseItem } from "@/lib/utils/BeerPresenter";
import { DEFAULT_THEME_COLOR, DEFAULT_THEME_COLOR_CONTAINER } from "@/config/beer";
import type { IBeer } from "@/models/Beer";

function beer(overrides: Partial<IBeer> = {}): IBeer {
  return {
    _id: "beer-1",
    abv: 4.3,
    ibu: 20,
    translations: [
      { locale: "vi", style: "Bia Vàng", headline: "TIÊU ĐỀ", description: "Mô tả." },
    ],
    ...overrides,
  } as unknown as IBeer;
}

describe("pickTranslation", () => {
  it("returns the exact-locale translation when it exists", () => {
    const result = pickTranslation(
      beer({
        translations: [
          { locale: "vi", style: "A", headline: "A", description: "A" },
          { locale: "en", style: "B", headline: "B", description: "B" },
        ],
      }),
      "en"
    );
    expect(result?.locale).toBe("en");
  });

  it("falls back to the default locale (vi) when the requested one is missing", () => {
    const result = pickTranslation(beer(), "en");
    expect(result?.locale).toBe("vi");
  });

  it("returns null for a beer with no translations", () => {
    const result = pickTranslation(beer({ translations: [] }), "vi");
    expect(result).toBeNull();
  });
});

describe("toShowcaseItem", () => {
  it("maps a beer's fields to the showcase shape for the requested locale", () => {
    const item = toShowcaseItem(
      beer({
        imageKey: "beers/lager.png",
        shopUrl: "https://shop.example.com",
        findLocallyUrl: "https://find.example.com",
        themeColor: "#002867",
        themeColorContainer: "#1d3f82",
      }),
      "vi"
    );

    expect(item).toEqual({
      id: "beer-1",
      abv: "4.3%",
      ibu: 20,
      imageSrc: "/api/media/public/beers/lager.png",
      style: "Bia Vàng",
      headline: "TIÊU ĐỀ",
      description: "Mô tả.",
      shopUrl: "https://shop.example.com",
      findLocallyUrl: "https://find.example.com",
      themeColor: "#002867",
      themeColorContainer: "#1d3f82",
    });
  });

  it("falls back to the brand default colors when the beer has none set", () => {
    const item = toShowcaseItem(beer(), "vi");

    expect(item?.themeColor).toBe(DEFAULT_THEME_COLOR);
    expect(item?.themeColorContainer).toBe(DEFAULT_THEME_COLOR_CONTAINER);
  });

  it("falls back to a placeholder image when imageKey is unset", () => {
    const item = toShowcaseItem(beer(), "vi");
    expect(item?.imageSrc).toBe("/images/otter-beer-single-can.png");
  });

  it("returns null when the beer has no translation at all", () => {
    const item = toShowcaseItem(beer({ translations: [] }), "vi");
    expect(item).toBeNull();
  });
});
