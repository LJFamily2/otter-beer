"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LOCALES, type LocaleCode } from "@/config/locales";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import styles from "./PostForm.module.css";

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
    <form className={styles.wrap} onSubmit={handleSubmit}>
      <div className={styles.header}>
        <h1 className={styles.headerTitle}>
          {mode === "create" ? "Tạo bài viết mới" : "Chỉnh sửa bài viết"}
        </h1>
      </div>

      {error ? <p className={styles.errorBanner}>{error}</p> : null}

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Nội dung theo ngôn ngữ</h2>
        <div className={styles.localeTabs}>
          {LOCALES.map((locale) => (
            <button
              key={locale.code}
              type="button"
              className={`${styles.localeTab} ${
                activeLocale === locale.code ? styles.localeTabActive : ""
              } ${locale.required ? styles.localeTabRequired : ""}`}
              onClick={() => setActiveLocale(locale.code)}
            >
              {locale.label}
            </button>
          ))}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="title">
            Tiêu đề
          </label>
          <input
            id="title"
            className={styles.input}
            value={active.title}
            onChange={(e) =>
              updateTranslation(activeLocale, { title: e.target.value })
            }
            required={
              LOCALES.find((l) => l.code === activeLocale)?.required ?? false
            }
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="slug">
            Đường dẫn (để trống để tự tạo)
          </label>
          <input
            id="slug"
            className={styles.input}
            value={active.slug}
            placeholder="vi-du-duong-dan-bai-viet"
            onChange={(e) =>
              updateTranslation(activeLocale, { slug: e.target.value })
            }
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="excerpt">
            Mô tả ngắn
          </label>
          <textarea
            id="excerpt"
            className={styles.textarea}
            maxLength={300}
            value={active.excerpt}
            onChange={(e) =>
              updateTranslation(activeLocale, { excerpt: e.target.value })
            }
          />
          <span className={styles.hint}>{active.excerpt.length}/300</span>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Nội dung</label>
          <RichTextEditor
            value={active.content}
            onChange={(html) =>
              updateTranslation(activeLocale, { content: html })
            }
            placeholder="Viết nội dung bài viết..."
          />
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>SEO ({LOCALES.find((l) => l.code === activeLocale)?.label})</h2>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="seoTitle">
            Tiêu đề SEO
          </label>
          <input
            id="seoTitle"
            className={styles.input}
            maxLength={70}
            value={active.seoTitle}
            onChange={(e) =>
              updateTranslation(activeLocale, { seoTitle: e.target.value })
            }
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="seoDescription">
            Mô tả SEO
          </label>
          <textarea
            id="seoDescription"
            className={styles.textarea}
            maxLength={160}
            value={active.seoDescription}
            onChange={(e) =>
              updateTranslation(activeLocale, {
                seoDescription: e.target.value,
              })
            }
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="seoKeywords">
            Từ khóa (phân cách bằng dấu phẩy)
          </label>
          <input
            id="seoKeywords"
            className={styles.input}
            value={active.seoKeywords}
            onChange={(e) =>
              updateTranslation(activeLocale, {
                seoKeywords: e.target.value,
              })
            }
          />
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Ảnh & Thẻ</h2>
        <div className={styles.field}>
          <label className={styles.label}>Ảnh bìa</label>
          <ImageUploadField
            imageKey={coverImageKey}
            onChange={setCoverImageKey}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="tags">
            Thẻ (phân cách bằng dấu phẩy)
          </label>
          <input
            id="tags"
            className={styles.input}
            value={tagsInput}
            placeholder="brewing, ipa, taproom"
            onChange={(e) => setTagsInput(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.footerActions}>
        <div className={styles.statusSelect}>
          <label className={styles.label} htmlFor="status">
            Trạng thái
          </label>
          <select
            id="status"
            className={styles.input}
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as "draft" | "published")
            }
          >
            <option value="draft">Bản nháp</option>
            <option value="published">Xuất bản</option>
          </select>
        </div>
        <div className={styles.buttons}>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => router.push("/admin/blog")}
          >
            Hủy
          </button>
          <button
            type="submit"
            className={styles.primaryButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Đang lưu..." : "Lưu bài viết"}
          </button>
        </div>
      </div>
    </form>
  );
}
