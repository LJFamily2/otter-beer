"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import { LOCALES, getRequiredLocales, type LocaleCode } from "@/config/locales";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { PlusIcon, TrashIcon } from "@/components/admin/icons";
import { rowActionButtonClass } from "@/components/admin/classNames";
import { ChevronDownIcon } from "@/components/ui/icons";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Tabs } from "@/components/ui/Tabs";

export interface BrandStoryPageFormState {
  /** React key only — pages have no id, this collection is replaced whole on save. */
  key: string;
  imageKey?: string;
  translations: Record<LocaleCode, { title: string; caption: string }>;
}

function emptyTranslations(): Record<LocaleCode, { title: string; caption: string }> {
  const translations = {} as Record<LocaleCode, { title: string; caption: string }>;
  for (const locale of LOCALES) translations[locale.code] = { title: "", caption: "" };
  return translations;
}

interface BrandStoryFormProps {
  initialPages: BrandStoryPageFormState[];
  canEdit: boolean;
}

const sectionTitleClass = "font-display text-lg tracking-wide text-primary";
const labelClass = "text-xs font-medium uppercase tracking-wide text-on-surface";

export function BrandStoryForm({ initialPages, canEdit }: BrandStoryFormProps) {
  const router = useRouter();
  const nextKeyRef = useRef(0);
  const [activeLocale, setActiveLocale] = useState<LocaleCode>(LOCALES[0].code);
  const [pages, setPages] = useState<BrandStoryPageFormState[]>(initialPages);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  function addPage() {
    const key = `new-${nextKeyRef.current++}`;
    setPages((prev) => [...prev, { key, imageKey: undefined, translations: emptyTranslations() }]);
    setSaved(false);
  }

  function removePage(key: string) {
    setPages((prev) => prev.filter((p) => p.key !== key));
    setSaved(false);
  }

  function movePage(key: string, direction: -1 | 1) {
    setPages((prev) => {
      const index = prev.findIndex((p) => p.key === key);
      const target = index + direction;
      if (index === -1 || target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    setSaved(false);
  }

  function updatePageImage(key: string, imageKey: string | undefined) {
    setPages((prev) => prev.map((p) => (p.key === key ? { ...p, imageKey } : p)));
    setSaved(false);
  }

  function updatePageText(
    key: string,
    locale: LocaleCode,
    patch: Partial<{ title: string; caption: string }>
  ) {
    setPages((prev) =>
      prev.map((p) =>
        p.key === key
          ? { ...p, translations: { ...p.translations, [locale]: { ...p.translations[locale], ...patch } } }
          : p
      )
    );
    setSaved(false);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErrors([]);
    setSaved(false);

    const requiredLocales = getRequiredLocales();
    const validationErrors: string[] = [];

    pages.forEach((page, index) => {
      if (!page.imageKey) {
        validationErrors.push(`Trang ${index + 1}: cần tải ảnh minh họa.`);
      }
      for (const localeCode of requiredLocales) {
        const localeConfig = LOCALES.find((l) => l.code === localeCode);
        const localeLabel = localeConfig?.label ?? localeCode;
        const t = page.translations[localeCode as LocaleCode];
        if (!t.title.trim()) {
          validationErrors.push(`Trang ${index + 1}: cần nhập tiêu đề (${localeLabel}).`);
        }
        if (!t.caption.trim()) {
          validationErrors.push(`Trang ${index + 1}: cần nhập nội dung (${localeLabel}).`);
        }
      }
    });

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const payload = {
      pages: pages.map((page) => ({
        imageKey: page.imageKey,
        translations: LOCALES.filter(
          (locale) => page.translations[locale.code].title.trim().length > 0
        ).map((locale) => ({
          locale: locale.code,
          title: page.translations[locale.code].title.trim(),
          caption: page.translations[locale.code].caption.trim(),
        })),
      })),
    };

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/brand-story", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        const serverErrors: string[] = [];
        if (body?.details?.formErrors?.length) serverErrors.push(...body.details.formErrors);
        if (body?.details?.fieldErrors) {
          for (const [, errs] of Object.entries(body.details.fieldErrors)) {
            if (Array.isArray(errs)) serverErrors.push(...(errs as string[]));
          }
        }
        setErrors(
          serverErrors.length > 0 ? serverErrors : [body?.error ?? "Không thể lưu. Vui lòng thử lại."]
        );
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      setSaved(true);
      router.refresh();
    } catch (err) {
      setErrors([err instanceof Error ? err.message : "Đã xảy ra lỗi không xác định."]);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
      {errors.length > 0 ? (
        <div className="rounded-lg bg-error-container p-4 text-on-error-container shadow-sm">
          <div className="text-base font-semibold">
            Vui lòng kiểm tra và điền đầy đủ các thông tin sau:
          </div>
          <ul className="mt-2 flex list-inside list-disc flex-col gap-1 text-sm">
            {errors.map((msg, index) => (
              <li key={index}>{msg}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <Tabs
        variant="pill"
        value={activeLocale}
        onChange={(value) => setActiveLocale(value as LocaleCode)}
        items={LOCALES.map((locale) => ({
          value: locale.code,
          label: locale.required ? (
            <>
              {locale.label} <span className="font-bold text-error">*</span>
            </>
          ) : (
            locale.label
          ),
        }))}
      />

      {pages.length === 0 ? (
        <Card className="p-8 text-center text-sm text-on-surface-variant">
          Chưa có trang nào. Nhấn &quot;Thêm trang&quot; để bắt đầu.
        </Card>
      ) : (
        <div className="flex flex-col gap-6">
          {pages.map((page, index) => {
            const t = page.translations[activeLocale];
            const isRequiredLocale = LOCALES.find((l) => l.code === activeLocale)?.required ?? false;
            return (
              <Card key={page.key} className="flex flex-col gap-4 p-6">
                <div className="flex items-center justify-between gap-4">
                  <h2 className={sectionTitleClass}>Trang {index + 1}</h2>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      className={rowActionButtonClass}
                      aria-label="Di chuyển lên"
                      disabled={index === 0}
                      onClick={() => movePage(page.key, -1)}
                    >
                      <ChevronDownIcon width={15} height={15} className="rotate-180" />
                    </button>
                    <button
                      type="button"
                      className={rowActionButtonClass}
                      aria-label="Di chuyển xuống"
                      disabled={index === pages.length - 1}
                      onClick={() => movePage(page.key, 1)}
                    >
                      <ChevronDownIcon width={15} height={15} />
                    </button>
                    <button
                      type="button"
                      className={rowActionButtonClass}
                      aria-label="Xóa trang"
                      onClick={() => removePage(page.key)}
                    >
                      <TrashIcon width={15} height={15} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>Ảnh minh họa</label>
                  <ImageUploadField
                    imageKey={page.imageKey}
                    onChange={(key) => updatePageImage(page.key, key)}
                  />
                </div>

                <Input
                  label={
                    <>
                      Tiêu đề {isRequiredLocale ? <span className="font-bold text-error">*</span> : null}
                    </>
                  }
                  id={`title-${page.key}`}
                  placeholder="VD: Copper Kettle Brewing History"
                  value={t.title}
                  onChange={(e) => updatePageText(page.key, activeLocale, { title: e.target.value })}
                  required={isRequiredLocale}
                />

                <Textarea
                  label={
                    <>
                      Nội dung {isRequiredLocale ? <span className="font-bold text-error">*</span> : null}
                    </>
                  }
                  id={`caption-${page.key}`}
                  placeholder={"VD: Mashing\nBoiling\nFermenting"}
                  rows={3}
                  maxLength={200}
                  value={t.caption}
                  onChange={(e) => updatePageText(page.key, activeLocale, { caption: e.target.value })}
                  hint={`${t.caption.length}/200`}
                />
              </Card>
            );
          })}
        </div>
      )}

      {canEdit ? (
        <div className="flex flex-wrap items-center gap-4">
          <Button type="button" variant="secondary" onClick={addPage}>
            <PlusIcon width={14} height={14} />
            Thêm trang
          </Button>
          <div className="ml-auto flex items-center gap-4">
            {saved ? <p className="text-sm text-[#10b981]">Đã lưu.</p> : null}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </div>
        </div>
      ) : null}
    </form>
  );
}
