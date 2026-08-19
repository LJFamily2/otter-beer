import { TaglineSection } from "@/components/sections/TaglineSection";
import { ProductShowcase } from "@/components/sections/ProductShowcase";
import { BrandStorySection } from "@/components/sections/BrandStorySection";
import { ContactCtaSection } from "@/components/sections/ContactCtaSection";

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  return (
    <>
      <ProductShowcase locale={locale} />
      <TaglineSection locale={locale} />
      <BrandStorySection locale={locale} />
      <ContactCtaSection locale={locale} />
    </>
  );
}
