"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { buttonVariants } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { TrashIcon } from "@/components/admin/icons";

export function DeleteRoleButton({ roleId }: { roleId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirmDelete() {
    setError(null);
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/roles/${roleId}`, {
        method: "DELETE",
      });
      if (!response.ok && response.status !== 204) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "Xóa vai trò thất bại.");
      }
      setOpen(false);
      router.push("/admin/roles");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        className={buttonVariants("secondary", "sm")}
        onClick={() => setOpen(true)}
      >
        <TrashIcon width={14} height={14} />
        Xóa
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Xác nhận xóa vai trò"
        description="Xóa vai trò này? Hành động này không thể hoàn tác."
        cancelLabel="Hủy"
        confirmLabel={isDeleting ? "Đang xóa..." : "Xóa vai trò"}
        confirmDisabled={isDeleting}
        onConfirm={handleConfirmDelete}
      >
        {error ? (
          <p className="mt-4 rounded bg-error-container px-3 py-2 text-sm text-on-error-container">
            {error}
          </p>
        ) : null}
      </Modal>
    </>
  );
}
