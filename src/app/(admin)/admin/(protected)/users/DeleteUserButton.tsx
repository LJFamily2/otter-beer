"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Modal } from "@/components/ui/Modal";
import { rowActionButtonClass } from "@/components/admin/classNames";

export function DeleteUserButton({
  userId,
  children,
}: {
  userId: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirmDelete() {
    setError(null);
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });
      if (!response.ok && response.status !== 204) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "Xóa người dùng thất bại.");
      }
      setOpen(false);
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
        className={rowActionButtonClass}
        aria-label="Xóa"
        onClick={() => setOpen(true)}
      >
        {children}
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Xác nhận xóa người dùng"
        description="Xóa quyền truy cập của người dùng này? Hành động này không thể hoàn tác."
        cancelLabel="Hủy"
        confirmLabel={isDeleting ? "Đang xóa..." : "Xóa người dùng"}
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
