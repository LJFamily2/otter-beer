import { HeroSection } from "@/components/sections/HeroSection";
import { BrandStorySection } from "@/components/sections/BrandStorySection";

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  return (
    <>
      <HeroSection locale={locale} />
      <BrandStorySection locale={locale} />
    </>
  );
}
