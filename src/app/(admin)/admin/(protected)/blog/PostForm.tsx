"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LOCALES, type LocaleCode } from "@/config/locales";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Tabs } from "@/components/ui/Tabs";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

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

const labelClass = "text-xs font-medium uppercase tracking-wide text-on-surface";
const fieldClass = "flex flex-col gap-1.5";
const sectionClass =
  "flex flex-col gap-4 rounded-lg border border-[rgba(196,198,210,0.3)] bg-surface-container-lowest p-6 shadow-sm";
const sectionTitleClass = "font-display text-lg tracking-wide text-primary";

const STATUS_OPTIONS = [
  { value: "draft", label: "Bản nháp" },
  { value: "published", label: "Xuất bản" },
];

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
  const pageTitle = mode === "create" ? "Tạo bài viết mới" : "Chỉnh sửa bài viết";

  return (
    <form
      className="flex max-w-[860px] flex-col gap-8"
      onSubmit={handleSubmit}
    >
      <div className="flex flex-col gap-3 border-b border-[rgba(196,198,210,0.3)] pb-4">
        <Breadcrumbs
          items={[
            { label: "Quản trị", href: "/admin" },
            { label: "Tin tức & Blog", href: "/admin/blog" },
            { label: mode === "create" ? "Tạo bài viết" : "Chỉnh sửa bài viết" },
          ]}
        />
        <h1 className="text-[32px] tracking-wide text-primary">{pageTitle}</h1>
      </div>

      {error ? (
        <p className="rounded bg-error-container px-4 py-3 text-sm text-on-error-container">
          {error}
        </p>
      ) : null}

      <Card className={sectionClass}>
        <h2 className={sectionTitleClass}>Nội dung theo ngôn ngữ</h2>
        <Tabs
          variant="pill"
          value={activeLocale}
          onChange={(value) => setActiveLocale(value as LocaleCode)}
          items={LOCALES.map((locale) => ({
            value: locale.code,
            label: locale.required ? (
              <>
                {locale.label} <span className="text-error">*</span>
              </>
            ) : (
              locale.label
            ),
          }))}
        />

        <Input
          label="Tiêu đề"
          id="title"
          value={active.title}
          onChange={(e) =>
            updateTranslation(activeLocale, { title: e.target.value })
          }
          required={
            LOCALES.find((l) => l.code === activeLocale)?.required ?? false
          }
        />

        <Input
          label="Đường dẫn (để trống để tự tạo)"
          id="slug"
          value={active.slug}
          placeholder="vi-du-duong-dan-bai-viet"
          onChange={(e) =>
            updateTranslation(activeLocale, { slug: e.target.value })
          }
        />

        <Textarea
          label="Mô tả ngắn"
          id="excerpt"
          maxLength={300}
          value={active.excerpt}
          onChange={(e) =>
            updateTranslation(activeLocale, { excerpt: e.target.value })
          }
          hint={`${active.excerpt.length}/300`}
        />

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
        <Input
          label="Tiêu đề SEO"
          id="seoTitle"
          maxLength={70}
          value={active.seoTitle}
          onChange={(e) =>
            updateTranslation(activeLocale, { seoTitle: e.target.value })
          }
        />
        <Textarea
          label="Mô tả SEO"
          id="seoDescription"
          maxLength={160}
          value={active.seoDescription}
          onChange={(e) =>
            updateTranslation(activeLocale, {
              seoDescription: e.target.value,
            })
          }
        />
        <Input
          label="Từ khóa (phân cách bằng dấu phẩy)"
          id="seoKeywords"
          value={active.seoKeywords}
          onChange={(e) =>
            updateTranslation(activeLocale, {
              seoKeywords: e.target.value,
            })
          }
        />
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
        <Input
          label="Thẻ (phân cách bằng dấu phẩy)"
          id="tags"
          value={tagsInput}
          placeholder="brewing, ipa, taproom"
          onChange={(e) => setTagsInput(e.target.value)}
        />
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <Select
          label="Trạng thái"
          id="status"
          value={status}
          onChange={(v) => setStatus(v as "draft" | "published")}
          options={STATUS_OPTIONS}
          wrapperClassName="w-56"
        />
        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={() => router.push("/admin/blog")}>
            Hủy
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Đang lưu..." : "Lưu bài viết"}
          </Button>
        </div>
      </div>
    </form>
  );
}
