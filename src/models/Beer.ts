import {
  Schema,
  model,
  models,
  Types,
  type Document,
  type Model,
} from "mongoose";
import { BEER_STATUSES, type BeerStatus } from "@/config/beer";

export { BEER_STATUSES, type BeerStatus };

/**
 * One language's worth of editable copy for a beer — mirrors
 * IBlogPostTranslation's array-of-subdocuments shape (see
 * src/models/BlogPost.ts) so adding a language later is just a new array
 * entry, no schema/migration change.
 */
export interface IBeerTranslation {
  locale: string;
  /** e.g. "PREMIUM LAGER" — shown as the small spec-card label. */
  style: string;
  /** Hero headline; line breaks are preserved so an editor controls the wrap. */
  headline: string;
  /** Tagline/description under the headline; line breaks preserved. */
  description: string;
}

export interface IBeer extends Document {
  imageKey?: string;
  abv: number;
  ibu: number;
  shopUrl?: string;
  findLocallyUrl?: string;
  /** Hex color (#RRGGBB) driving the homepage showcase's --color-primary for this beer. Unset falls back to the brand default at render time. */
  themeColor?: string;
  /** Hex color (#RRGGBB) driving the homepage showcase's --color-primary-container for this beer. Unset falls back to the brand default at render time. */
  themeColorContainer?: string;
  /** At most one beer is featured at a time — see BeerService — and only a featured + published beer renders on the homepage hero. */
  isFeatured: boolean;
  status: BeerStatus;
  translations: IBeerTranslation[];
  createdBy: Types.ObjectId;
  updatedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BeerTranslationSchema = new Schema<IBeerTranslation>(
  {
    locale: { type: String, required: true, trim: true, lowercase: true },
    style: { type: String, required: true, trim: true, maxlength: 60 },
    headline: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, trim: true, maxlength: 400 },
  },
  { _id: false }
);

const BeerSchema = new Schema<IBeer>(
  {
    imageKey: { type: String, trim: true },
    abv: { type: Number, required: true, min: 0, max: 100 },
    ibu: { type: Number, required: true, min: 0, max: 200 },
    shopUrl: { type: String, trim: true },
    findLocallyUrl: { type: String, trim: true },
    themeColor: { type: String, trim: true, uppercase: true },
    themeColorContainer: { type: String, trim: true, uppercase: true },
    isFeatured: { type: Boolean, required: true, default: false },
    status: {
      type: String,
      enum: BEER_STATUSES,
      required: true,
      default: "draft",
    },
    translations: {
      type: [BeerTranslationSchema],
      default: [],
      validate: {
        validator: (v: IBeerTranslation[]) => v.length > 0,
        message: "At least one language's content is required.",
      },
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

BeerSchema.index({ "translations.locale": 1 });
BeerSchema.index({ status: 1, isFeatured: 1 });
/** Backs BeerRepository.listShowcasePublished — status filter + createdAt sort in one index scan. */
BeerSchema.index({ status: 1, createdAt: -1 });

export const BeerModel: Model<IBeer> =
  (models.Beer as Model<IBeer>) || model<IBeer>("Beer", BeerSchema);
