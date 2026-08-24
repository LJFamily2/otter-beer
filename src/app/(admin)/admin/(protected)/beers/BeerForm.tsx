"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LOCALES, getRequiredLocales, type LocaleCode } from "@/config/locales";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import { Tabs } from "@/components/ui/Tabs";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { DEFAULT_THEME_COLOR, DEFAULT_THEME_COLOR_CONTAINER } from "@/config/beer";

interface TranslationFormState {
  style: string;
  headline: string;
  description: string;
}

function emptyTranslation(): TranslationFormState {
  return { style: "", headline: "", description: "" };
}

export interface BeerFormInitialData {
  imageKey?: string;
  abv: number;
  ibu: number;
  shopUrl?: string;
  findLocallyUrl?: string;
  themeColor?: string;
  themeColorContainer?: string;
  isFeatured: boolean;
  status: "draft" | "published";
  translations: Partial<Record<LocaleCode, TranslationFormState>>;
}

const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;

interface BeerFormProps {
  mode: "create" | "edit";
  beerId?: string;
  initialData?: BeerFormInitialData;
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

export function BeerForm({ mode, beerId, initialData }: BeerFormProps) {
  const router = useRouter();
  const [activeLocale, setActiveLocale] = useState<LocaleCode>(LOCALES[0].code);
  const [imageKey, setImageKey] = useState(initialData?.imageKey);
  const [abvInput, setAbvInput] = useState(initialData?.abv?.toString() ?? "");
  const [ibuInput, setIbuInput] = useState(initialData?.ibu?.toString() ?? "");
  const [shopUrl, setShopUrl] = useState(initialData?.shopUrl ?? "");
  const [findLocallyUrl, setFindLocallyUrl] = useState(initialData?.findLocallyUrl ?? "");
  const [themeColor, setThemeColor] = useState(initialData?.themeColor ?? "");
  const [themeColorContainer, setThemeColorContainer] = useState(
    initialData?.themeColorContainer ?? ""
  );
  const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured ?? false);
  const [status, setStatus] = useState<"draft" | "published">(initialData?.status ?? "draft");
  const [translations, setTranslations] = useState<
    Record<LocaleCode, TranslationFormState>
  >(() => {
    const initial = {} as Record<LocaleCode, TranslationFormState>;
    for (const locale of LOCALES) {
      initial[locale.code] = initialData?.translations[locale.code] ?? emptyTranslation();
    }
    return initial;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function updateTranslation(locale: LocaleCode, patch: Partial<TranslationFormState>) {
    const patchKeys = Object.keys(patch);
    setFieldErrors((prev) => {
      const next = { ...prev };
      for (const k of patchKeys) delete next[k];
      return next;
    });
    setTranslations((prev) => ({ ...prev, [locale]: { ...prev[locale], ...patch } }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErrors([]);
    setFieldErrors({});

    const requiredLocales = getRequiredLocales();
    const validationErrors: string[] = [];
    const newFieldErrors: Record<string, string> = {};

    for (const localeCode of requiredLocales) {
      const localeConfig = LOCALES.find((l) => l.code === localeCode);
      const localeLabel = localeConfig?.label ?? localeCode;
      const t = translations[localeCode as LocaleCode];

      if (!t.style.trim()) {
        validationErrors.push(`Cần nhập dòng bia (${localeLabel}).`);
        if (localeCode === activeLocale) newFieldErrors.style = "Cần nhập dòng bia";
      }
      if (!t.headline.trim()) {
        validationErrors.push(`Cần nhập tiêu đề (${localeLabel}).`);
        if (localeCode === activeLocale) newFieldErrors.headline = "Cần nhập tiêu đề";
      }
      if (!t.description.trim()) {
        validationErrors.push(`Cần nhập mô tả (${localeLabel}).`);
        if (localeCode === activeLocale) newFieldErrors.description = "Cần nhập mô tả";
      }
    }

    const abv = Number(abvInput);
    if (!abvInput.trim() || Number.isNaN(abv)) {
      validationErrors.push("Cần nhập nồng độ cồn (ABV) hợp lệ.");
      newFieldErrors.abv = "Cần nhập ABV hợp lệ";
    }
    const ibu = Number(ibuInput);
    if (!ibuInput.trim() || Number.isNaN(ibu)) {
      validationErrors.push("Cần nhập độ đắng (IBU) hợp lệ.");
      newFieldErrors.ibu = "Cần nhập IBU hợp lệ";
    }

    if (themeColor.trim() && !HEX_COLOR_PATTERN.test(themeColor.trim())) {
      validationErrors.push("Màu chính không hợp lệ, cần đúng định dạng mã hex (VD: #002867).");
      newFieldErrors.themeColor = "Mã hex không hợp lệ";
    }
    if (themeColorContainer.trim() && !HEX_COLOR_PATTERN.test(themeColorContainer.trim())) {
      validationErrors.push("Màu nền không hợp lệ, cần đúng định dạng mã hex (VD: #1d3f82).");
      newFieldErrors.themeColorContainer = "Mã hex không hợp lệ";
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setFieldErrors(newFieldErrors);
      setActiveLocale(requiredLocales[0] as LocaleCode);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const activeTranslations = LOCALES.filter(
      (locale) => translations[locale.code].style.trim().length > 0
    ).map((locale) => {
      const t = translations[locale.code];
      return {
        locale: locale.code,
        style: t.style.trim(),
        headline: t.headline.trim(),
        description: t.description.trim(),
      };
    });

    const payload = {
      imageKey,
      abv,
      ibu,
      shopUrl: shopUrl.trim() || undefined,
      findLocallyUrl: findLocallyUrl.trim() || undefined,
      themeColor: themeColor.trim() || undefined,
      themeColorContainer: themeColorContainer.trim() || undefined,
      isFeatured,
      status,
      translations: activeTranslations,
    };

    setIsSubmitting(true);
    try {
      const response = await fetch(
        mode === "create" ? "/api/beers" : `/api/beers/${beerId}`,
        {
          method: mode === "create" ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        if (response.status === 400 && body?.details) {
          const serverErrors: string[] = [];
          if (typeof body.error === "string" && !body.error.includes("không hợp lệ")) {
            serverErrors.push(body.error);
          } else {
            serverErrors.push("Dữ liệu không hợp lệ. Vui lòng điền đầy đủ các thông tin bắt buộc.");
          }
          if (body.details.formErrors?.length) serverErrors.push(...body.details.formErrors);
          if (body.details.fieldErrors) {
            for (const [, errs] of Object.entries(body.details.fieldErrors)) {
              if (Array.isArray(errs)) serverErrors.push(...(errs as string[]));
            }
          }
          setErrors(serverErrors);
        } else {
          setErrors([body?.error ?? "Không thể lưu sản phẩm. Vui lòng thử lại."]);
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      router.push("/admin/beers");
      router.refresh();
    } catch (err) {
      setErrors([err instanceof Error ? err.message : "Đã xảy ra lỗi không xác định."]);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSubmitting(false);
    }
  }

  const active = translations[activeLocale];
  const isRequiredLocale = LOCALES.find((l) => l.code === activeLocale)?.required ?? false;
  const pageTitle = mode === "create" ? "Tạo sản phẩm mới" : "Chỉnh sửa sản phẩm";

  return (
    <form className="flex max-w-[860px] flex-col gap-8 pb-12" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-3 border-b border-[rgba(196,198,210,0.3)] pb-4">
        <Breadcrumbs
          items={[
            { label: "Quản trị", href: "/admin" },
            { label: "Sản phẩm bia", href: "/admin/beers" },
            { label: mode === "create" ? "Tạo sản phẩm" : "Chỉnh sửa sản phẩm" },
          ]}
        />
        <h1 className="text-[32px] tracking-wide text-primary">{pageTitle}</h1>
      </div>

      {errors.length > 0 ? (
        <div className="rounded-lg bg-error-container p-4 text-on-error-container shadow-sm">
          <div className="font-semibold text-base">
            Vui lòng kiểm tra và điền đầy đủ các thông tin sau:
          </div>
          <ul className="mt-2 list-inside list-disc flex flex-col gap-1 text-sm">
            {errors.map((msg, index) => (
              <li key={index}>{msg}</li>
            ))}
          </ul>
        </div>
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
                {locale.label} <span className="text-error font-bold">*</span>
              </>
            ) : (
              locale.label
            ),
          }))}
        />

        <Input
          label={
            <>
              Dòng bia {isRequiredLocale ? <span className="text-error font-bold">*</span> : null}
            </>
          }
          id="style"
          placeholder="VD: PREMIUM LAGER"
          value={active.style}
          error={fieldErrors.style}
          onChange={(e) => updateTranslation(activeLocale, { style: e.target.value })}
          required={isRequiredLocale}
        />

        <Textarea
          label={
            <>
              Tiêu đề {isRequiredLocale ? <span className="text-error font-bold">*</span> : null}
            </>
          }
          id="headline"
          placeholder={"VD: BREWING\nCONNECTIONS."}
          value={active.headline}
          error={fieldErrors.headline}
          onChange={(e) => updateTranslation(activeLocale, { headline: e.target.value })}
          hint="Xuống dòng sẽ được giữ nguyên khi hiển thị."
        />

        <Textarea
          label={
            <>
              Mô tả {isRequiredLocale ? <span className="text-error font-bold">*</span> : null}
            </>
          }
          id="description"
          placeholder="Nhập mô tả ngắn về sản phẩm..."
          maxLength={400}
          value={active.description}
          error={fieldErrors.description}
          onChange={(e) => updateTranslation(activeLocale, { description: e.target.value })}
          hint={`${active.description.length}/400`}
        />
      </Card>

      <Card className={sectionClass}>
        <h2 className={sectionTitleClass}>Thông số & Ảnh</h2>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="ABV (%)"
            id="abv"
            type="number"
            step="0.1"
            min="0"
            max="100"
            value={abvInput}
            error={fieldErrors.abv}
            onChange={(e) => setAbvInput(e.target.value)}
          />
          <Input
            label="IBU"
            id="ibu"
            type="number"
            step="1"
            min="0"
            max="200"
            value={ibuInput}
            error={fieldErrors.ibu}
            onChange={(e) => setIbuInput(e.target.value)}
          />
        </div>
        <div className={fieldClass}>
          <label className={labelClass}>Ảnh sản phẩm</label>
          <ImageUploadField imageKey={imageKey} onChange={setImageKey} />
        </div>
      </Card>

      <Card className={sectionClass}>
        <h2 className={sectionTitleClass}>Liên kết & Hiển thị</h2>
        <Input
          label="Liên kết Mua ngay"
          id="shopUrl"
          placeholder="https://..."
          value={shopUrl}
          onChange={(e) => setShopUrl(e.target.value)}
        />
        <Input
          label="Liên kết Tìm cửa hàng"
          id="findLocallyUrl"
          placeholder="https://..."
          value={findLocallyUrl}
          onChange={(e) => setFindLocallyUrl(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-4">
          <div className={fieldClass}>
            <label className={labelClass} htmlFor="themeColor">
              Màu chính (trên trang chủ)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                aria-label="Chọn màu chính"
                value={
                  HEX_COLOR_PATTERN.test(themeColor.trim())
                    ? themeColor.trim()
                    : DEFAULT_THEME_COLOR
                }
                onChange={(e) => setThemeColor(e.target.value)}
                className="h-[46px] w-14 shrink-0 cursor-pointer rounded-sm border border-outline-variant bg-surface-container-lowest p-1"
              />
              <Input
                id="themeColor"
                placeholder={DEFAULT_THEME_COLOR}
                value={themeColor}
                error={fieldErrors.themeColor}
                onChange={(e) => setThemeColor(e.target.value)}
                wrapperClassName="flex-1"
              />
            </div>
          </div>
          <div className={fieldClass}>
            <label className={labelClass} htmlFor="themeColorContainer">
              Màu nền (trên trang chủ)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                aria-label="Chọn màu nền"
                value={
                  HEX_COLOR_PATTERN.test(themeColorContainer.trim())
                    ? themeColorContainer.trim()
                    : DEFAULT_THEME_COLOR_CONTAINER
                }
                onChange={(e) => setThemeColorContainer(e.target.value)}
                className="h-[46px] w-14 shrink-0 cursor-pointer rounded-sm border border-outline-variant bg-surface-container-lowest p-1"
              />
              <Input
                id="themeColorContainer"
                placeholder={DEFAULT_THEME_COLOR_CONTAINER}
                value={themeColorContainer}
                error={fieldErrors.themeColorContainer}
                onChange={(e) => setThemeColorContainer(e.target.value)}
                wrapperClassName="flex-1"
              />
            </div>
          </div>
        </div>
        <Checkbox
          label="Hiển thị làm sản phẩm nổi bật trên trang chủ"
          checked={isFeatured}
          onChange={(e) => setIsFeatured(e.target.checked)}
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
          <Button type="button" variant="secondary" onClick={() => router.push("/admin/beers")}>
            Hủy
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Đang lưu..." : "Lưu sản phẩm"}
          </Button>
        </div>
      </div>
    </form>
  );
}
