import { pickTranslation, pickVariantName, toShowcaseItem } from "@/lib/utils/BeerPresenter";
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
      variants: [],
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

  it("maps packaging variants to labels + image URLs for the requested locale", () => {
    const item = toShowcaseItem(
      beer({
        variants: [
          {
            imageKey: "beers/can.png",
            names: [
              { locale: "vi", shortName: "LON" },
              { locale: "en", shortName: "CAN" },
            ],
          },
          {
            imageKey: "beers/six-pack.png",
            names: [{ locale: "vi", shortName: "BAO BÌ 6 LON" }],
          },
        ],
      }),
      "en"
    );

    expect(item?.variants).toEqual([
      { shortName: "CAN", imageSrc: "/api/media/public/beers/can.png" },
      // No EN label on this one, so it falls back to vi rather than vanishing.
      { shortName: "BAO BÌ 6 LON", imageSrc: "/api/media/public/beers/six-pack.png" },
    ]);
  });

  it("keeps the main imageSrc untouched when variants exist (SEO/JSON-LD uses it)", () => {
    const item = toShowcaseItem(
      beer({
        imageKey: "beers/lager.png",
        variants: [
          { imageKey: "beers/can.png", names: [{ locale: "vi", shortName: "LON" }] },
        ],
      }),
      "vi"
    );

    expect(item?.imageSrc).toBe("/api/media/public/beers/lager.png");
  });

  it("drops variants that have no usable label or no image", () => {
    const item = toShowcaseItem(
      beer({
        variants: [
          { imageKey: "beers/can.png", names: [] },
          { imageKey: "", names: [{ locale: "vi", shortName: "LON" }] },
          { imageKey: "beers/case.png", names: [{ locale: "vi", shortName: "THÙNG" }] },
        ],
      }),
      "vi"
    );

    expect(item?.variants).toEqual([
      { shortName: "THÙNG", imageSrc: "/api/media/public/beers/case.png" },
    ]);
  });

  it("returns an empty variant list for a beer saved before variants existed", () => {
    const item = toShowcaseItem(beer({ variants: undefined }), "vi");
    expect(item?.variants).toEqual([]);
  });
});

describe("pickVariantName", () => {
  it("prefers the exact locale", () => {
    const name = pickVariantName(
      { names: [{ locale: "vi", shortName: "LON" }, { locale: "en", shortName: "CAN" }] },
      "en"
    );
    expect(name).toBe("CAN");
  });

  it("falls back to the default locale, then to whatever exists", () => {
    expect(
      pickVariantName({ names: [{ locale: "vi", shortName: "LON" }] }, "en")
    ).toBe("LON");
    expect(
      pickVariantName({ names: [{ locale: "en", shortName: "CAN" }] }, "fr")
    ).toBe("CAN");
  });

  it("returns null when a variant has no names at all", () => {
    expect(pickVariantName({ names: [] }, "vi")).toBeNull();
  });
});
