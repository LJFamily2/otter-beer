import { ProductShowcase } from "@/components/sections/ProductShowcase";
import { BrandStorySection } from "@/components/sections/BrandStorySection";

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  return (
    <>
      <ProductShowcase locale={locale} />
      <BrandStorySection locale={locale} />
    </>
  );
}
