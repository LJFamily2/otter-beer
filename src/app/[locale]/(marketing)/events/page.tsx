import type { Metadata } from "next";
import { buildStaticPageMetadata } from "@/lib/seo";

interface EventsPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: EventsPageProps): Promise<Metadata> {
  const { locale } = await params;
  return buildStaticPageMetadata({
    locale,
    path: "/events",
    title: locale === "vi" ? "Sự Kiện" : "Events",
    description:
      locale === "vi"
        ? "Cập nhật các sự kiện mới nhất tại Otter Beer."
        : "Stay updated with the latest events at Otter Beer.",
  });
}

export default async function EventsPage({ params }: EventsPageProps) {
  const { locale } = await params;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen pt-[72px] sm:pt-[88px] bg-[#0f0e0c] text-white px-6">
      <h1 className="font-anton text-4xl sm:text-6xl text-amber-500 mb-6 uppercase tracking-wider text-center">
        {locale === "vi" ? "Sự Kiện Sắp Tới" : "Upcoming Events"}
      </h1>
      <p className="text-zinc-400 max-w-2xl text-center text-lg leading-relaxed">
        {locale === "vi"
          ? "Hiện tại chúng tôi chưa có sự kiện nào. Vui lòng quay lại sau!"
          : "We don't have any upcoming events right now. Please check back later!"}
      </p>
    </div>
  );
}
