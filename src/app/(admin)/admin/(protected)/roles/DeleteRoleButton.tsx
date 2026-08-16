"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { buttonVariants } from "@/components/ui/Button";
import { TrashIcon } from "@/components/admin/icons";

export function DeleteRoleButton({ roleId }: { roleId: string }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (
      !window.confirm("Xóa vai trò này? Hành động này không thể hoàn tác.")
    ) {
      return;
    }
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/roles/${roleId}`, {
        method: "DELETE",
      });
      if (!response.ok && response.status !== 204) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "Xóa vai trò thất bại.");
      }
      router.push("/admin/roles");
      router.refresh();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Đã xảy ra lỗi.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <button
      type="button"
      className={buttonVariants("secondary", "sm")}
      disabled={isDeleting}
      onClick={handleDelete}
    >
      <TrashIcon width={14} height={14} />
      Xóa
    </button>
  );
}
