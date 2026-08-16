"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { rowActionButtonClass } from "@/components/admin/classNames";

export function DeleteUserButton({
  userId,
  children,
}: {
  userId: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (
      !window.confirm(
        "Xóa quyền truy cập của người dùng này? Hành động này không thể hoàn tác."
      )
    ) {
      return;
    }
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });
      if (!response.ok && response.status !== 204) {
        throw new Error("Xóa người dùng thất bại.");
      }
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
      className={rowActionButtonClass}
      aria-label="Xóa"
      disabled={isDeleting}
      onClick={handleDelete}
    >
      {children}
    </button>
  );
}
