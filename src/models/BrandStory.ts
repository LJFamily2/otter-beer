import {
  Schema,
  model,
  models,
  Types,
  type Document,
  type Model,
} from "mongoose";

/** One language's worth of copy for a single book page — mirrors IBeerTranslation's array-of-subdocuments shape. */
export interface IBrandStoryPageTranslation {
  locale: string;
  /** Left-page heading, e.g. "Copper Kettle Brewing History". */
  title: string;
  /** Right-page cursive line(s), e.g. "Mashing" / "Boiling" / "Fermenting". */
  caption: string;
}

export interface IBrandStoryPage {
  /** Storage key for the page's illustration/photo — see src/lib/storage. */
  imageKey: string;
  translations: IBrandStoryPageTranslation[];
}

/**
 * Singleton document — there is exactly one Brand Story (the homepage
 * flipbook's ordered page list), not a collection of independently
 * CRUD-able records. See BrandStoryRepository.get()/replacePages().
 */
export interface IBrandStory extends Document {
  pages: IBrandStoryPage[];
  updatedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BrandStoryPageTranslationSchema = new Schema<IBrandStoryPageTranslation>(
  {
    locale: { type: String, required: true, trim: true, lowercase: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    caption: { type: String, required: true, trim: true, maxlength: 200 },
  },
  { _id: false }
);

const BrandStoryPageSchema = new Schema<IBrandStoryPage>(
  {
    imageKey: { type: String, required: true, trim: true },
    translations: { type: [BrandStoryPageTranslationSchema], default: [] },
  },
  { _id: false }
);

const BrandStorySchema = new Schema<IBrandStory>(
  {
    pages: { type: [BrandStoryPageSchema], default: [] },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const BrandStoryModel: Model<IBrandStory> =
  (models.BrandStory as Model<IBrandStory>) ||
  model<IBrandStory>("BrandStory", BrandStorySchema);
