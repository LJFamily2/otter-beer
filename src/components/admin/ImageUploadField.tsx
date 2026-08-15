"use client";

import { useRef, useState } from "react";
import { uploadImage } from "@/lib/utils/uploadImage";
import styles from "./ImageUploadField.module.css";

interface ImageUploadFieldProps {
  imageKey?: string;
  onChange: (key: string | undefined) => void;
}

export function ImageUploadField({
  imageKey,
  onChange,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function handlePick(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setIsUploading(true);
    try {
      const uploaded = await uploadImage(file);
      onChange(uploaded.key);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Tải ảnh thất bại.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className={styles.field}>
      <div className={styles.dropzone}>
        <div className={styles.preview}>
          {imageKey ? (
            // eslint-disable-next-line @next/next/no-img-element -- served by our own proxy route, arbitrary R2 key, next/image optimization not applicable
            <img src={`/api/media/public/${imageKey}`} alt="" />
          ) : (
            <span className={styles.placeholder}>Chưa có ảnh</span>
          )}
        </div>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.uploadButton}
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? "Đang tải..." : imageKey ? "Thay ảnh" : "Tải ảnh lên"}
          </button>
          {imageKey ? (
            <button
              type="button"
              className={styles.removeButton}
              onClick={() => onChange(undefined)}
            >
              Xóa ảnh
            </button>
          ) : null}
          <span className={styles.hint}>JPEG, PNG, WebP, hoặc GIF — tối đa 5MB</span>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          hidden
          onChange={handlePick}
        />
      </div>
    </div>
  );
}
