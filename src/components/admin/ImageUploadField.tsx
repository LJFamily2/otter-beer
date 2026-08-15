"use client";

import { useRef, useState } from "react";
import { uploadImage } from "@/lib/utils/uploadImage";
import { publicImageUrl } from "@/lib/storage/constants";
import { buttonVariants } from "@/components/ui/Button";

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
    <div className="flex items-center gap-4 rounded border border-dashed border-[rgba(196,198,210,0.7)] bg-surface p-4">
      <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded bg-surface-container-high">
        {imageKey ? (
          // eslint-disable-next-line @next/next/no-img-element -- served by our own proxy route, arbitrary R2 key, next/image optimization not applicable
          <img
            src={publicImageUrl(imageKey)}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="px-2 text-center text-xs text-on-surface-variant">
            Chưa có ảnh
          </span>
        )}
      </div>
      <div className="flex flex-col items-start gap-2">
        <button
          type="button"
          className={buttonVariants("secondary")}
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? "Đang tải..." : imageKey ? "Thay ảnh" : "Tải ảnh lên"}
        </button>
        {imageKey ? (
          <button
            type="button"
            className="cursor-pointer border-none bg-transparent p-0 text-[13px] text-error"
            onClick={() => onChange(undefined)}
          >
            Xóa ảnh
          </button>
        ) : null}
        <span className="text-xs text-on-surface-variant">
          JPEG, PNG, WebP, hoặc GIF — tối đa 5MB
        </span>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        hidden
        onChange={handlePick}
      />
    </div>
  );
}
