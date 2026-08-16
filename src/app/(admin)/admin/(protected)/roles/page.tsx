import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { roleService } from "@/services/RoleService";
import { permissionService } from "@/services/PermissionService";
import { MODULE_KEYS } from "@/config/permissions";
import { isSuperAdminRoleKey } from "@/config/roles";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CreateRoleModal } from "./CreateRoleModal";
import { RenameRoleModal } from "./RenameRoleModal";
import { DeleteRoleButton } from "./DeleteRoleButton";
import { PermissionMatrixEditor } from "./PermissionMatrixEditor";

export const metadata: Metadata = {
  title: "Vai trò & Phân quyền",
  robots: { index: false, follow: false },
};

interface RolesPageProps {
  searchParams: Promise<{ roleId?: string }>;
}

export default async function RolesPage({ searchParams }: RolesPageProps) {
  const session = await auth();
  const grant = session?.user?.permissions?.[MODULE_KEYS.ROLES_PERMISSIONS];

  if (!grant?.view) {
    return (
      <div className="p-16 text-center text-on-surface-variant">
        Bạn không có quyền xem nội dung này.
      </div>
    );
  }

  const roles = await roleService.list();
  const { roleId: roleIdParam } = await searchParams;
  const selectedRole =
    roles.find((role) => String(role._id) === roleIdParam) ??
    roles.find((role) => !isSuperAdminRoleKey(role.key)) ??
    roles[0];

  const isSuperAdminSelected = selectedRole
    ? isSuperAdminRoleKey(selectedRole.key)
    : false;

  const matrix =
    selectedRole && !isSuperAdminSelected
      ? await permissionService.getMatrixForRoleId(String(selectedRole._id))
      : null;

  return (
    <div className="flex flex-col gap-8">
      <Breadcrumbs
        items={[
          { label: "Quản trị", href: "/admin" },
          { label: "Vai trò & Phân quyền" },
        ]}
      />

      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[rgba(196,198,210,0.3)] pb-4">
        <div>
          <h1 className="text-4xl tracking-wide text-primary">
            Vai trò & Phân quyền
          </h1>
          <p className="mt-2 text-base text-on-surface-variant">
            Quản lý vai trò và quyền truy cập từng mô-đun trong hệ thống.
          </p>
        </div>
        {grant.add ? <CreateRoleModal /> : null}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[260px_1fr]">
        <Card className="flex flex-col gap-1 p-3">
          {roles.map((role) => {
            const id = String(role._id);
            const active = selectedRole && String(selectedRole._id) === id;
            return (
              <Link
                key={id}
                href={`/admin/roles?roleId=${id}`}
                className={`flex items-center justify-between gap-2 rounded px-4 py-3 text-sm no-underline ${
                  active
                    ? "bg-secondary-container font-bold text-primary"
                    : "text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                {role.name}
                {role.isSystem ? <Badge variant="outline">Hệ thống</Badge> : null}
              </Link>
            );
          })}
        </Card>

        {selectedRole ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl tracking-wide text-primary">
                  {selectedRole.name}
                </h2>
                <p className="text-sm text-on-surface-variant">
                  Khóa: {selectedRole.key}
                </p>
              </div>
              {!selectedRole.isSystem ? (
                <div className="flex gap-2">
                  {grant.edit ? (
                    <RenameRoleModal
                      roleId={String(selectedRole._id)}
                      currentName={selectedRole.name}
                    />
                  ) : null}
                  {grant.delete ? (
                    <DeleteRoleButton roleId={String(selectedRole._id)} />
                  ) : null}
                </div>
              ) : null}
            </div>

            {isSuperAdminSelected ? (
              <Card className="p-6 text-on-surface-variant">
                Vai trò Quản trị viên cấp cao luôn có toàn quyền trên mọi
                mô-đun và không thể chỉnh sửa — đây là biện pháp an toàn để
                hệ thống không bao giờ bị khóa hoàn toàn khỏi quyền quản trị.
              </Card>
            ) : matrix ? (
              <PermissionMatrixEditor
                roleId={String(selectedRole._id)}
                initialMatrix={matrix}
                canEdit={Boolean(grant.edit)}
              />
            ) : null}
          </div>
        ) : (
          <div className="p-16 text-center text-on-surface-variant">
            Chưa có vai trò nào.
          </div>
        )}
      </div>
    </div>
  );
}
