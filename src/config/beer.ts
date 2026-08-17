/**
 * Lives outside src/models/Beer.ts (which pulls in the full Mongoose +
 * MongoDB driver chain) so the validation layer — and its unit tests — can
 * depend on just the status enum without loading Mongoose.
 */
export const BEER_STATUSES = ["draft", "published"] as const;
export type BeerStatus = (typeof BEER_STATUSES)[number];
