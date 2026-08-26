import type { FaqEntry } from "@/lib/seo";

/**
 * Homepage FAQ — the site's Answer Engine Optimization (AEO) core.
 *
 * One source of truth feeding two consumers: the visible `FaqSection` and the
 * `FAQPage` JSON-LD (see buildFaqJsonLd). They MUST stay identical — Google
 * penalises FAQ markup whose answers are not present in the visible page, and
 * an LLM that finds a mismatch between markup and prose trusts neither.
 *
 * Each entry is written to three rules:
 *
 * 1. The question is phrased the way a person actually types or speaks it
 *    ("Bia Otter Beer nấu ở đâu?"), not as a marketing header.
 * 2. The answer's FIRST sentence answers it completely and can be lifted out
 *    of context — that lifted sentence is what becomes a featured snippet or
 *    an LLM's cited line.
 * 3. The answer names concrete, checkable entities: the brewery, the province,
 *    the ingredients, the ABV/IBU numbers, the year. Specifics are what a
 *    generative engine can ground a citation on; adjectives are not.
 */
export const FAQ: Record<"vi" | "en", readonly FaqEntry[]> = {
  vi: [
    {
      question: "Otter Beer là bia gì?",
      answer:
        "Otter Beer là thương hiệu bia thủ công (craft beer) Việt Nam do BADENBEER Co., Ltd. sản xuất tại Tây Ninh từ năm 2024. Mỗi mẻ bia được nấu từ 100% mạch nha vàng, nước suối Tây Ninh và hoa bia Saaz tuyển chọn, lên men tự nhiên chậm để giữ trọn hương vị.",
    },
    {
      question: "Bia Otter Beer được nấu ở đâu?",
      answer:
        "Otter Beer được nấu tại nhà máy của BADENBEER Co., Ltd. ở Tây Ninh, Việt Nam. Địa chỉ taproom là số nhà 13, hẻm 30, đường Lạc Long Quân, phường Hiệp Định, tỉnh Tây Ninh.",
    },
    {
      question: "Mua bia Otter Beer ở đâu?",
      answer:
        "Bạn có thể mua Otter Beer trực tiếp tại taproom ở Tây Ninh, đặt qua các liên kết mua hàng trên trang sản phẩm của website, hoặc gọi (+84) 908 790 102 để được hướng dẫn tới điểm bán gần nhất.",
    },
    {
      question: "Nồng độ cồn (ABV) của bia Otter Beer là bao nhiêu?",
      answer:
        "Nồng độ cồn của từng dòng bia Otter Beer được ghi rõ trên trang sản phẩm, kèm chỉ số độ đắng IBU. Xem mục Sản phẩm trên trang chủ để biết thông số ABV và IBU chính xác của từng dòng bia.",
    },
    {
      question: "Otter Beer khác gì so với bia công nghiệp?",
      answer:
        "Khác biệt nằm ở nguyên liệu và thời gian: Otter Beer dùng 100% mạch nha vàng thay vì pha gạo hay ngô, nước suối Tây Ninh thay vì nước xử lý công nghiệp, và ủ lên men tự nhiên chậm thay vì rút ngắn chu kỳ. Kết quả là hương vị đậm và tròn hơn bia lager sản xuất đại trà.",
    },
    {
      question: "Otter Beer có nhận đặt bia cho sự kiện và phân phối sỉ không?",
      answer:
        "Có. Otter Beer nhận đặt bia cho sự kiện riêng tư và hợp tác phân phối sỉ. Liên hệ hello@otterbeer.vn hoặc gọi (+84) 908 790 102 để trao đổi về số lượng và thời gian giao.",
    },
    {
      question: "Có thể tham quan nhà máy bia Otter Beer không?",
      answer:
        "Có, nhà máy bia của BADENBEER tại Tây Ninh mở cửa đón khách tham quan. Vui lòng liên hệ trước qua (+84) 908 790 102 để đặt lịch.",
    },
  ],
  en: [
    {
      question: "What is Otter Beer?",
      answer:
        "Otter Beer is a Vietnamese craft beer brand brewed by BADENBEER Co., Ltd. in Tay Ninh Province since 2024. Every batch is brewed with 100% golden malt, Tay Ninh spring water and select Saaz hops, then slow-fermented naturally to keep the full flavour.",
    },
    {
      question: "Where is Otter Beer brewed?",
      answer:
        "Otter Beer is brewed at the BADENBEER Co., Ltd. brewery in Tay Ninh, Vietnam. The taproom is at 13 House, Alley 30, Lac Long Quan Street, Hiep Dinh Ward, Tay Ninh Province.",
    },
    {
      question: "Where can I buy Otter Beer?",
      answer:
        "You can buy Otter Beer at the Tay Ninh taproom, through the shop links on each product in the showcase, or by calling (+84) 908 790 102 to be pointed to the nearest stockist.",
    },
    {
      question: "What is the ABV of Otter Beer?",
      answer:
        "The ABV of each Otter Beer is listed on its product card alongside its IBU bitterness rating. See the Products section on the homepage for the exact ABV and IBU of every beer in the range.",
    },
    {
      question: "How is Otter Beer different from mass-produced beer?",
      answer:
        "The difference is the ingredients and the time. Otter Beer uses 100% golden malt rather than rice or corn adjuncts, Tay Ninh spring water rather than industrially treated water, and a slow natural fermentation rather than a shortened cycle — which is what gives it a fuller, rounder flavour than a mass-market lager.",
    },
    {
      question: "Does Otter Beer supply events and wholesale orders?",
      answer:
        "Yes. Otter Beer supplies private events and works with wholesale distributors. Email hello@otterbeer.vn or call (+84) 908 790 102 to discuss volumes and lead times.",
    },
    {
      question: "Can I visit the Otter Beer brewery?",
      answer:
        "Yes, the BADENBEER brewery in Tay Ninh is open to visitors. Please call (+84) 908 790 102 in advance to arrange a time.",
    },
  ],
} as const;

/** Falls back to English for any locale we do not have FAQ copy for. */
export function faqFor(locale: string): readonly FaqEntry[] {
  return FAQ[locale as keyof typeof FAQ] ?? FAQ.en;
}
