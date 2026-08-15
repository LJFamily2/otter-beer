import { Schema, model, models, type Document, type Model } from "mongoose";

export interface IRole extends Document {
  key: string;
  name: string;
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RoleSchema = new Schema<IRole>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: /^[a-z0-9_]+$/,
    },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    // System roles (superAdmin/admin/officeMember) can't be deleted or
    // renamed away from their seeded key — see RoleService.
    isSystem: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);

export const RoleModel: Model<IRole> =
  (models.Role as Model<IRole>) || model<IRole>("Role", RoleSchema);
