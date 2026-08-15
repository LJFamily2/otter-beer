"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LOCALES, type LocaleCode } from "@/config/locales";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { Card } from "@/components/ui/Card";
import { Button, buttonVariants } from "@/components/ui/Button";

interface TranslationFormState {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  ogImageKey?: string;
}

function emptyTranslation(): TranslationFormState {
  return {
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
    ogImageKey: undefined,
  };
}

export interface PostFormInitialData {
  coverImageKey?: string;
  tags: string[];
  status: "draft" | "published";
  translations: Partial<Record<LocaleCode, TranslationFormState>>;
}

interface PostFormProps {
  mode: "create" | "edit";
  postId?: string;
  initialData?: PostFormInitialData;
}

const labelClass =
  "text-xs font-medium uppercase tracking-wide text-on-surface";
const inputClass =
  "rounded border border-[rgba(196,198,210,0.5)] bg-surface-container-lowest px-3.5 py-3 text-[15px] text-on-surface focus:border-secondary-fixed-dim focus:outline-none";
const textareaClass = `${inputClass} min-h-[72px] resize-y`;
const fieldClass = "flex flex-col gap-1.5";
const sectionClass =
  "flex flex-col gap-4 rounded-lg border border-[rgba(196,198,210,0.3)] bg-surface-container-lowest p-6 shadow-sm";
const sectionTitleClass = "font-display text-lg tracking-wide text-primary";

export function PostForm({ mode, postId, initialData }: PostFormProps) {
  const router = useRouter();
  const [activeLocale, setActiveLocale] = useState<LocaleCode>(
    LOCALES[0].code
  );
  const [coverImageKey, setCoverImageKey] = useState(
    initialData?.coverImageKey
  );
  const [tagsInput, setTagsInput] = useState(
    initialData?.tags.join(", ") ?? ""
  );
  const [status, setStatus] = useState<"draft" | "published">(
    initialData?.status ?? "draft"
  );
  const [translations, setTranslations] = useState<
    Record<LocaleCode, TranslationFormState>
  >(() => {
    const initial = {} as Record<LocaleCode, TranslationFormState>;
    for (const locale of LOCALES) {
      initial[locale.code] =
        initialData?.translations[locale.code] ?? emptyTranslation();
    }
    return initial;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateTranslation(
    locale: LocaleCode,
    patch: Partial<TranslationFormState>
  ) {
    setTranslations((prev) => ({
      ...prev,
      [locale]: { ...prev[locale], ...patch },
    }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const activeTranslations = LOCALES.filter(
      (locale) => translations[locale.code].title.trim().length > 0
    ).map((locale) => {
      const t = translations[locale.code];
      return {
        locale: locale.code,
        title: t.title.trim(),
        slug: t.slug.trim() || undefined,
        excerpt: t.excerpt.trim(),
        content: t.content,
        seoTitle: t.seoTitle.trim() || undefined,
        seoDescription: t.seoDescription.trim() || undefined,
        seoKeywords: t.seoKeywords
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean),
        ogImageKey: t.ogImageKey,
      };
    });

    const payload = {
      coverImageKey,
      tags: tagsInput
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      status,
      translations: activeTranslations,
    };

    setIsSubmitting(true);
    try {
      const response = await fetch(
        mode === "create" ? "/api/news-blog" : `/api/news-blog/${postId}`,
        {
          method: mode === "create" ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "Không thể lưu bài viết.");
      }

      router.push("/admin/blog");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const active = translations[activeLocale];

  return (
    <form
      className="flex max-w-[860px] flex-col gap-8"
      onSubmit={handleSubmit}
    >
      <div className="border-b border-[rgba(196,198,210,0.3)] pb-4">
        <h1 className="text-[32px] tracking-wide text-primary">
          {mode === "create" ? "Tạo bài viết mới" : "Chỉnh sửa bài viết"}
        </h1>
      </div>

      {error ? (
        <p className="rounded bg-error-container px-4 py-3 text-sm text-on-error-container">
          {error}
        </p>
      ) : null}

      <Card className={sectionClass}>
        <h2 className={sectionTitleClass}>Nội dung theo ngôn ngữ</h2>
        <div className="flex gap-2">
          {LOCALES.map((locale) => (
            <button
              key={locale.code}
              type="button"
              className={`rounded-full border px-4 py-2 text-[13px] font-bold ${
                activeLocale === locale.code
                  ? "border-primary bg-primary text-on-primary"
                  : "border-[rgba(196,198,210,0.5)] bg-surface-container-lowest text-on-surface-variant"
              } ${locale.required ? "after:ml-0.5 after:text-error after:content-['*']" : ""}`}
              onClick={() => setActiveLocale(locale.code)}
            >
              {locale.label}
            </button>
          ))}
        </div>

        <div className={fieldClass}>
          <label className={labelClass} htmlFor="title">
            Tiêu đề
          </label>
          <input
            id="title"
            className={inputClass}
            value={active.title}
            onChange={(e) =>
              updateTranslation(activeLocale, { title: e.target.value })
            }
            required={
              LOCALES.find((l) => l.code === activeLocale)?.required ?? false
            }
          />
        </div>

        <div className={fieldClass}>
          <label className={labelClass} htmlFor="slug">
            Đường dẫn (để trống để tự tạo)
          </label>
          <input
            id="slug"
            className={inputClass}
            value={active.slug}
            placeholder="vi-du-duong-dan-bai-viet"
            onChange={(e) =>
              updateTranslation(activeLocale, { slug: e.target.value })
            }
          />
        </div>

        <div className={fieldClass}>
          <label className={labelClass} htmlFor="excerpt">
            Mô tả ngắn
          </label>
          <textarea
            id="excerpt"
            className={textareaClass}
            maxLength={300}
            value={active.excerpt}
            onChange={(e) =>
              updateTranslation(activeLocale, { excerpt: e.target.value })
            }
          />
          <span className="text-xs text-on-surface-variant">
            {active.excerpt.length}/300
          </span>
        </div>

        <div className={fieldClass}>
          <label className={labelClass}>Nội dung</label>
          <RichTextEditor
            value={active.content}
            onChange={(html) =>
              updateTranslation(activeLocale, { content: html })
            }
            placeholder="Viết nội dung bài viết..."
          />
        </div>
      </Card>

      <Card className={sectionClass}>
        <h2 className={sectionTitleClass}>
          SEO ({LOCALES.find((l) => l.code === activeLocale)?.label})
        </h2>
        <div className={fieldClass}>
          <label className={labelClass} htmlFor="seoTitle">
            Tiêu đề SEO
          </label>
          <input
            id="seoTitle"
            className={inputClass}
            maxLength={70}
            value={active.seoTitle}
            onChange={(e) =>
              updateTranslation(activeLocale, { seoTitle: e.target.value })
            }
          />
        </div>
        <div className={fieldClass}>
          <label className={labelClass} htmlFor="seoDescription">
            Mô tả SEO
          </label>
          <textarea
            id="seoDescription"
            className={textareaClass}
            maxLength={160}
            value={active.seoDescription}
            onChange={(e) =>
              updateTranslation(activeLocale, {
                seoDescription: e.target.value,
              })
            }
          />
        </div>
        <div className={fieldClass}>
          <label className={labelClass} htmlFor="seoKeywords">
            Từ khóa (phân cách bằng dấu phẩy)
          </label>
          <input
            id="seoKeywords"
            className={inputClass}
            value={active.seoKeywords}
            onChange={(e) =>
              updateTranslation(activeLocale, {
                seoKeywords: e.target.value,
              })
            }
          />
        </div>
      </Card>

      <Card className={sectionClass}>
        <h2 className={sectionTitleClass}>Ảnh & Thẻ</h2>
        <div className={fieldClass}>
          <label className={labelClass}>Ảnh bìa</label>
          <ImageUploadField
            imageKey={coverImageKey}
            onChange={setCoverImageKey}
          />
        </div>
        <div className={fieldClass}>
          <label className={labelClass} htmlFor="tags">
            Thẻ (phân cách bằng dấu phẩy)
          </label>
          <input
            id="tags"
            className={inputClass}
            value={tagsInput}
            placeholder="brewing, ipa, taproom"
            onChange={(e) => setTagsInput(e.target.value)}
          />
        </div>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <label className={labelClass} htmlFor="status">
            Trạng thái
          </label>
          <select
            id="status"
            className={inputClass}
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as "draft" | "published")
            }
          >
            <option value="draft">Bản nháp</option>
            <option value="published">Xuất bản</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className={buttonVariants("secondary")}
            onClick={() => router.push("/admin/blog")}
          >
            Hủy
          </button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Đang lưu..." : "Lưu bài viết"}
          </Button>
        </div>
      </div>
    </form>
  );
}
