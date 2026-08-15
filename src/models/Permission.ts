import {
  Schema,
  model,
  models,
  Types,
  type Document,
  type Model,
} from "mongoose";
import { PERMISSION_ACTIONS, type ActionGrant } from "@/config/permissions";

export interface IPermission extends Document {
  roleId: Types.ObjectId;
  moduleKey: string;
  actions: ActionGrant;
  createdAt: Date;
  updatedAt: Date;
}

const ActionGrantSchema = new Schema<ActionGrant>(
  {
    [PERMISSION_ACTIONS.ACCESS]: { type: Boolean, required: true, default: false },
    [PERMISSION_ACTIONS.VIEW]: { type: Boolean, required: true, default: false },
    [PERMISSION_ACTIONS.ADD]: { type: Boolean, required: true, default: false },
    [PERMISSION_ACTIONS.EDIT]: { type: Boolean, required: true, default: false },
    [PERMISSION_ACTIONS.DELETE]: { type: Boolean, required: true, default: false },
  },
  { _id: false }
);

const PermissionSchema = new Schema<IPermission>(
  {
    roleId: { type: Schema.Types.ObjectId, ref: "Role", required: true },
    moduleKey: { type: String, required: true, trim: true },
    actions: { type: ActionGrantSchema, required: true, default: () => ({}) },
  },
  { timestamps: true }
);

// One row per (role, module) — this is a row of the "Truy cập / Xem / Thêm /
// Sửa / Xóa" matrix editable from the admin permission screen.
PermissionSchema.index({ roleId: 1, moduleKey: 1 }, { unique: true });

export const PermissionModel: Model<IPermission> =
  (models.Permission as Model<IPermission>) ||
  model<IPermission>("Permission", PermissionSchema);
