import type { Metadata } from "next";
import Link from "next/link";
import { DEFAULT_LOCALE } from "@/config/locales";
import { buildStaticPageMetadata } from "@/lib/seo";

interface TermsPageProps {
  params: Promise<{ locale: string }>;
}

// See the note in privacy/page.tsx — same fix, same reasons.
export async function generateMetadata({
  params,
}: TermsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const isVi = locale === DEFAULT_LOCALE;

  return buildStaticPageMetadata({
    locale,
    path: "/terms",
    title: isVi ? "Điều Khoản Sử Dụng" : "Terms of Service",
    description: isVi
      ? "Điều khoản sử dụng và hướng dẫn pháp lý khi truy cập website Otter Beer."
      : "The Terms of Service and legal guidelines for accessing and using the Otter Beer website.",
  });
}

export default async function TermsOfServicePage({ params }: TermsPageProps) {
  const { locale } = await params;
  const isVi = locale === DEFAULT_LOCALE;
  const prefix = isVi ? "" : `/${locale}`;

  return (
    <div className="relative min-h-screen bg-surface text-on-surface antialiased flex flex-col">
      {/* Main Content */}
      <main className="flex-1 w-full max-w-[1280px] mx-auto px-6 pt-28 sm:pt-36 lg:pt-40 pb-12 md:pb-20">
        <header className="mb-10 border-b border-surface-variant pb-6">
          <h1 className="font-display text-4xl md:text-6xl text-primary uppercase tracking-tight">
            {isVi ? "Điều Khoản Dịch Vụ" : "Terms of Service"}
          </h1>
          <p className="text-sm md:text-base text-on-surface-variant mt-2 font-mono">
            {isVi ? "Cập nhật lần cuối: 26 Tháng 10, 2023" : "Last Updated: October 26, 2023"}
          </p>
        </header>

        <article className="space-y-10 max-w-3xl text-on-surface leading-relaxed">
          {/* Section 01 */}
          <section>
            <h2 className="font-display text-2xl md:text-3xl text-primary mb-3 flex items-center gap-3">
              <span className="text-mahogany">01.</span>{" "}
              {isVi ? "Điều Khoản Sử Dụng" : "Terms of Use"}
            </h2>
            <p className="mb-3 text-on-surface-variant">
              {isVi
                ? "Chào mừng bạn đến với OTTER BEER. Bằng cách truy cập hoặc sử dụng trang web của chúng tôi, bạn đồng ý tuân thủ các Điều Khoản Dịch Vụ này. Nếu bạn không đồng ý với bất kỳ phần nào của các điều khoản này, bạn không thể truy cập dịch vụ của chúng tôi."
                : "Welcome to OTTER BEER. By accessing or using our website, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not access our services. These terms apply to all visitors, users, and others who access or use the Service."}
            </p>
            <p className="text-on-surface-variant">
              {isVi
                ? "Chúng tôi có quyền sửa đổi hoặc thay thế các Điều khoản này bất kỳ lúc nào. Bạn có trách nhiệm kiểm tra trang này định kỳ để cập nhật các thay đổi."
                : "We reserve the right to modify or replace these Terms at any time. It is your responsibility to check this page periodically for changes. Your continued use of or access to the website following the posting of any changes constitutes acceptance of those changes."}
            </p>
          </section>

          {/* Section 02 */}
          <section>
            <h2 className="font-display text-2xl md:text-3xl text-primary mb-3 flex items-center gap-3">
              <span className="text-mahogany">02.</span>{" "}
              {isVi ? "Xác Minh Độ Tuổi (18+ / 21+)" : "Age Verification (21+)"}
            </h2>
            <p className="mb-3 text-on-surface-variant">
              {isVi
                ? "Việc truy cập trang web này nghiêm cấm đối với cá nhân chưa đủ tuổi tiêu thụ đồ uống có cồn theo quy định pháp luật hiện hành tại khu vực của bạn."
                : "Access to this website is strictly restricted to individuals who are of legal drinking age in their respective jurisdiction. In the United States, this is 21 years of age or older."}
            </p>
            <p className="text-on-surface-variant">
              {isVi
                ? "Bằng cách truy cập trang web, bạn xác nhận rằng mình đã đủ tuổi uống rượu bia hợp pháp. Chúng tôi không cố ý thu thập thông tin từ cá nhân chưa đủ tuổi."
                : "By entering this site, you affirm that you are of legal drinking age. We do not knowingly collect personal information from individuals under the legal drinking age."}
            </p>
          </section>

          {/* Section 03 */}
          <section>
            <h2 className="font-display text-2xl md:text-3xl text-primary mb-3 flex items-center gap-3">
              <span className="text-mahogany">03.</span>{" "}
              {isVi ? "Sở Hữu Trí Tuệ" : "Intellectual Property"}
            </h2>
            <p className="mb-3 text-on-surface-variant">
              {isVi
                ? "Dịch vụ và nội dung gốc, tính năng cũng như giao diện thuộc sở hữu độc quyền của OTTER BEER BREWING CO. và các bên cấp phép."
                : "The Service and its original content, features, and functionality are and will remain the exclusive property of OTTER BEER BREWING CO. and its licensors."}
            </p>
            <p className="text-on-surface-variant">
              {isVi
                ? "Nhãn hiệu và nhận diện thương hiệu của chúng tôi không được sử dụng liên quan đến bất kỳ sản phẩm hoặc dịch vụ nào khác nếu không có sự đồng ý bằng văn bản."
                : "Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of OTTER BEER."}
            </p>
          </section>

          {/* Section 04 */}
          <section>
            <h2 className="font-display text-2xl md:text-3xl text-primary mb-3 flex items-center gap-3">
              <span className="text-mahogany">04.</span>{" "}
              {isVi ? "Giới Hạn Trách Nhiệm" : "Limitation of Liability"}
            </h2>
            <p className="text-on-surface-variant">
              {isVi
                ? "Trong mọi trường hợp, OTTER BEER hoặc các giám đốc, nhân viên, đối tác của công ty sẽ không chịu trách nhiệm đối với bất kỳ thiệt hại gián tiếp, ngẫu nhiên hoặc phát sinh nào từ việc bạn truy cập hoặc sử dụng Dịch vụ."
                : "In no event shall OTTER BEER, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages resulting from your access to or use of the Service."}
            </p>
          </section>

          {/* Action Button */}
          <div className="pt-6">
            <Link
              href={`${prefix}/`}
              className="inline-block bg-mahogany hover:bg-primary text-on-primary font-bold text-xs uppercase tracking-wider py-3 px-8 rounded-sm transition-colors duration-300"
            >
              {isVi ? "Xác Nhận & Tiếp Tục" : "Acknowledge & Continue"}
            </Link>
          </div>
        </article>
      </main>
    </div>
  );
}
