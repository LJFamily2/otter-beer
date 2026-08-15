import type { Types } from "mongoose";
import { PermissionModel, type IPermission } from "@/models/Permission";
import type { ActionGrant } from "@/config/permissions";
import { BaseRepository } from "./BaseRepository";

export class PermissionRepository extends BaseRepository<IPermission> {
  constructor() {
    super(PermissionModel);
  }

  async findByRole(roleId: string | Types.ObjectId): Promise<IPermission[]> {
    return this.find({ roleId });
  }

  async findByRoleAndModule(
    roleId: string | Types.ObjectId,
    moduleKey: string
  ): Promise<IPermission | null> {
    return this.findOne({ roleId, moduleKey });
  }

  /** Creates or overwrites the action grant for one (role, module) matrix cell. */
  async upsertGrant(
    roleId: string | Types.ObjectId,
    moduleKey: string,
    actions: ActionGrant
  ): Promise<IPermission> {
    const model = await this.ready();
    return model
      .findOneAndUpdate(
        { roleId, moduleKey },
        { $set: { actions } },
        { new: true, upsert: true, runValidators: true }
      )
      .exec();
  }

  async deleteByRole(roleId: string | Types.ObjectId): Promise<void> {
    const model = await this.ready();
    await model.deleteMany({ roleId }).exec();
  }
}
