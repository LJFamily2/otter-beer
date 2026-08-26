/**
 * Single source of truth for the brand's real-world facts (NAP, socials,
 * founding, product framing).
 *
 * Everything here is emitted verbatim into schema.org JSON-LD, so it is the
 * data search engines and LLM answer engines quote back about Otter Beer.
 * Keep it factual and keep it in sync with what the Contact section renders —
 * a NAP mismatch between visible text and structured data is the most common
 * cause of a local-SEO trust penalty.
 *
 * @see src/lib/seo.ts for the JSON-LD builders that consume this.
 */

/** Legal operating entity behind the Otter Beer brand. */
export const LEGAL_NAME = "BADENBEER Co., Ltd.";

export const BRAND_NAME = "Otter Beer";

/** Year the brewery started operating — rendered in TaglineSection too. */
export const FOUNDING_YEAR = "2024";

export const CONTACT = {
  email: "hello@otterbeer.vn",
  /** E.164, the format schema.org and Google expect. */
  phones: ["+84908790102", "+84981686491"],
  /** Human-readable rendering of the same numbers, for visible copy. */
  phonesDisplay: ["(+84) 908 790 102", "(+84) 981 686 491"],
} as const;

/**
 * PostalAddress fields. `streetAddress` matches the Contact section's visible
 * address string exactly (see contact.tsx COPY.address).
 */
export const ADDRESS = {
  streetAddress: "13 House, Alley 30, Lac Long Quan Street, Hiep Dinh Ward",
  addressLocality: "Tay Ninh",
  addressRegion: "Tay Ninh Province",
  addressCountry: "VN",
} as const;

/** Approximate brewery coordinates — powers the `geo` node on the Brewery schema. */
export const GEO = {
  latitude: 11.3254,
  longitude: 106.0967,
} as const;

/**
 * Profiles that prove this is the same real-world entity across the web.
 * `sameAs` is the strongest entity-disambiguation signal there is — both for
 * Google's Knowledge Graph and for LLMs deciding whether two mentions of
 * "Otter Beer" are the same brewery.
 *
 * Add real profile URLs as they go live; empty entries are filtered out by
 * the JSON-LD builders rather than emitted as dead links.
 */
export const SOCIAL_PROFILES: readonly string[] = [
  "https://facebook.com/otterbeer",
  "https://instagram.com/otterbeer",
];

/** Google Maps deep link used by the Contact section's "Get Directions". */
export const MAP_URL =
  "https://maps.google.com/?q=S%E1%BB%91+nh%C3%A0+13+H%E1%BA%B9m+30+L%E1%BA%A1c+Long+Qu%C3%A2n+T%C3%A2y+Ninh";

/**
 * Taproom hours in schema.org `openingHours` shorthand. Drives the
 * "when are you open" answer in both rich results and LLM answers.
 */
export const OPENING_HOURS = ["Mo-Su 10:00-22:00"] as const;

export const PRICE_RANGE = "$ ";

/**
 * The head keyword set for the site, per locale. These land in the homepage
 * `keywords` metadata and shape the copy the AEO/GEO sections are written
 * around — they are the queries this site is trying to be the answer to.
 */
export const KEYWORDS = {
  vi: [
    "bia thủ công",
    "bia thủ công Tây Ninh",
    "Otter Beer",
    "bia craft Việt Nam",
    "nhà máy bia Tây Ninh",
    "bia tươi Tây Ninh",
    "premium lager Việt Nam",
    "mua bia thủ công",
    "BADENBEER",
  ],
  en: [
    "craft beer",
    "Vietnamese craft beer",
    "Otter Beer",
    "Tay Ninh brewery",
    "craft brewery Vietnam",
    "premium lager Vietnam",
    "buy craft beer Vietnam",
    "BADENBEER",
  ],
} as const;
