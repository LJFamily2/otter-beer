"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import styles from "./BlogListPage.module.css";

export function DeletePostButton({
  postId,
  children,
}: {
  postId: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!window.confirm("Xóa bài viết này? Hành động này không thể hoàn tác.")) {
      return;
    }
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/news-blog/${postId}`, {
        method: "DELETE",
      });
      if (!response.ok && response.status !== 204) {
        throw new Error("Xóa bài viết thất bại.");
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
      className={styles.rowActionButton}
      aria-label="Xóa"
      disabled={isDeleting}
      onClick={handleDelete}
    >
      {children}
    </button>
  );
}
