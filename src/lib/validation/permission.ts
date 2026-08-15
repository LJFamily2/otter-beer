import { z } from "zod";
import { MODULE_KEYS_LIST } from "@/config/permissions";

const moduleKeyEnum = z.enum(
  MODULE_KEYS_LIST as unknown as [string, ...string[]]
);

const actionGrantSchema = z.object({
  access: z.boolean(),
  view: z.boolean(),
  add: z.boolean(),
  edit: z.boolean(),
  delete: z.boolean(),
});

export const UpdatePermissionMatrixSchema = z.object({
  roleId: z.string().trim().min(1),
  grants: z
    .array(
      z.object({
        moduleKey: moduleKeyEnum,
        actions: actionGrantSchema,
      })
    )
    .min(1),
});

export type UpdatePermissionMatrixInput = z.infer<
  typeof UpdatePermissionMatrixSchema
>;
