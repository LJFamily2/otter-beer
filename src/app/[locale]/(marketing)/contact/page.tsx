import type { Metadata } from "next";
import ContactSection from "./contact";

interface ContactPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: ContactPageProps): Promise<Metadata> {
  const { locale } = await params;
  const isVi = locale === "vi";

  return {
    title: isVi ? "Liên hệ | Otter Beer" : "Contact | Otter Beer",
    description: isVi
      ? "Liên hệ với Otter Beer để đặt câu hỏi về sự kiện, phân phối sỉ, hoặc các thông tin về bia."
      : "Contact Otter Beer for private events, wholesale inquiries, and brewery details.",
  };
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { locale } = await params;

  return <ContactSection locale={locale} />;
}
