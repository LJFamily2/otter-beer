import type { Metadata } from "next";
import { DEFAULT_LOCALE } from "@/config/locales";

export const metadata: Metadata = {
  title: "Privacy Policy | Otter Beer",
  description:
    "Learn about how Otter Beer collects, uses, and protects your personal information.",
};

interface PrivacyPageProps {
  params: Promise<{ locale: string }>;
}

export default async function PrivacyPolicyPage({ params }: PrivacyPageProps) {
  const { locale } = await params;
  const isVi = locale === DEFAULT_LOCALE;

  return (
    <div className="relative min-h-screen bg-surface text-on-surface antialiased flex flex-col">
      {/* Header Section */}
      <header className="relative w-full py-16 md:py-24 bg-surface-container-lowest border-b border-surface-variant overflow-hidden">
        <div className="heritage-pattern absolute inset-0 pointer-events-none" />
        <div className="relative z-10 mx-auto max-w-[1280px] px-6 text-center">
          <h1 className="font-display text-4xl md:text-6xl text-primary uppercase tracking-tight mb-4">
            {isVi ? "Chính Sách Bảo Mật" : "Privacy Policy"}
          </h1>
          <p className="text-base md:text-lg text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
            {isVi
              ? "Tại Otter Beer, chúng tôi trân trọng quyền riêng tư của bạn như cách chúng tôi trân trọng từng ly bia hoàn hảo. Tài liệu này giải thích cách chúng tôi thu thập, sử dụng và bảo vệ thông tin của bạn."
              : "At Otter Beer, we value your privacy as much as we value a perfectly poured pint. This document outlines how we collect, use, and protect your information."}
          </p>
          <p className="text-xs text-on-surface-variant font-mono uppercase tracking-widest mt-6">
            {isVi ? "Cập nhật lần cuối: Tháng 10, 2024" : "Last Updated: October 2024"}
          </p>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[1280px] mx-auto px-6 py-12 md:py-20 flex flex-col gap-12">
        {/* Section 1 */}
        <section className="w-full max-w-3xl">
          <h2 className="font-display text-2xl md:text-3xl text-mahogany uppercase mb-4">
            {isVi ? "01. Thu Thập Dữ Liệu" : "01. Data Collection"}
          </h2>
          <div className="space-y-4 text-on-surface-variant leading-relaxed">
            <p>
              {isVi
                ? "Chúng tôi thu thập thông tin bạn cung cấp trực tiếp cho chúng tôi khi tương tác với dịch vụ, chẳng hạn như khi tạo tài khoản, mua hàng hoặc liên hệ hỗ trợ khách hàng. Thông tin này có thể bao gồm:"
                : "We collect information you provide directly to us when you interact with our services, such as when you create an account, make a purchase, or contact customer support. This may include:"}
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                {isVi
                  ? "Thông tin liên hệ (như tên, địa chỉ email, địa chỉ giao hàng)."
                  : "Contact information (e.g., name, email address, postal address)."}
              </li>
              <li>
                {isVi
                  ? "Thông tin thanh toán được xử lý an toàn bởi các đối tác của chúng tôi."
                  : "Payment information securely processed by our payment partners."}
              </li>
              <li>
                {isVi
                  ? "Thông tin nhân khẩu học và sở thích liên quan đến sản phẩm."
                  : "Demographic information and preferences related to our products."}
              </li>
            </ul>
            <p>
              {isVi
                ? "Chúng tôi cũng tự động thu thập một số thông tin kỹ thuật khi bạn truy cập website, bao gồm địa chỉ IP, loại trình duyệt và dữ liệu tương tác qua cookies."
                : "We also automatically collect certain technical information when you visit our website, including your IP address, browser type, and interaction data via cookies and similar technologies."}
            </p>
          </div>
        </section>

        {/* Section 2 */}
        <section className="w-full max-w-3xl">
          <h2 className="font-display text-2xl md:text-3xl text-mahogany uppercase mb-4">
            {isVi ? "02. Sử Dụng Thông Tin" : "02. Usage of Information"}
          </h2>
          <div className="space-y-4 text-on-surface-variant leading-relaxed">
            <p>
              {isVi
                ? "Thông tin thu thập được sử dụng để nâng cao trải nghiệm của bạn với Otter Beer. Cụ thể, chúng tôi sử dụng thông tin để:"
                : "The information we collect is used to enhance your experience with Otter Beer. Specifically, we use it to:"}
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                {isVi
                  ? "Xử lý giao dịch và giao các sản phẩm bạn đã yêu cầu."
                  : "Process transactions and deliver the products you've requested."}
              </li>
              <li>
                {isVi
                  ? "Gửi cập nhật quan trọng, thông báo khuyến mãi và nội dung phù hợp."
                  : "Communicate important updates, promotions, and tailored content."}
              </li>
              <li>
                {isVi
                  ? "Phân tích mức độ sử dụng trang web để cải thiện dịch vụ số và sản phẩm."
                  : "Analyze website usage to improve our digital services and product offerings."}
              </li>
              <li>
                {isVi
                  ? "Đảm bảo tuân thủ các nghĩa vụ pháp lý, bao gồm xác minh độ tuổi uống rượu bia theo quy định."
                  : "Ensure compliance with legal obligations, including age verification for alcohol purchases."}
              </li>
            </ul>
          </div>
        </section>

        {/* Section 3 */}
        <section className="w-full max-w-3xl">
          <h2 className="font-display text-2xl md:text-3xl text-mahogany uppercase mb-4">
            {isVi ? "03. Quyền Lợi Của Bạn" : "03. Your Rights"}
          </h2>
          <div className="space-y-4 text-on-surface-variant leading-relaxed">
            <p>
              {isVi
                ? "Bạn có quyền kiểm soát đối với dữ liệu cá nhân của mình. Tùy thuộc vào quy định pháp luật, bạn có các quyền:"
                : "You have control over your personal data. Depending on your jurisdiction, you may have the right to:"}
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                {isVi
                  ? "Truy cập thông tin cá nhân mà chúng tôi đang lưu giữ về bạn."
                  : "Access the personal information we hold about you."}
              </li>
              <li>
                {isVi
                  ? "Yêu cầu chỉnh sửa dữ liệu không chính xác hoặc không đầy đủ."
                  : "Request corrections to inaccurate or incomplete data."}
              </li>
              <li>
                {isVi
                  ? "Yêu cầu xóa dữ liệu cá nhân trong các điều kiện nhất định."
                  : "Request the deletion of your personal data under certain conditions."}
              </li>
              <li>
                {isVi
                  ? "Từ chối nhận các thông tin tiếp thị bất kỳ lúc nào."
                  : "Opt-out of marketing communications at any time."}
              </li>
            </ul>
            <p className="pt-4">
              {isVi
                ? "Để thực hiện các quyền này, vui lòng liên hệ bộ phận hỗ trợ của chúng tôi tại "
                : "To exercise these rights, please contact our support team at "}
              <a
                href="mailto:privacy@otterbeer.com"
                className="text-mahogany font-medium hover:text-secondary underline underline-offset-4 transition-colors"
              >
                privacy@otterbeer.com
              </a>
              .
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
