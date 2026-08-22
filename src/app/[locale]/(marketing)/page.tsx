import { HeroSection } from "@/components/sections/HeroSection";
import { TaglineSection } from "@/components/sections/TaglineSection";
import { ProductShowcase } from "@/components/sections/ProductShowcase";
import { BrandStorySection } from "@/components/sections/BrandStorySection";
import ContactSection from "./contact/contact";
import { ContactCtaSection } from "@/components/sections/ContactCtaSection";


interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  return (
    <>
      <HeroSection />
      <BrandStorySection locale={locale} />
      <TaglineSection locale={locale} />
      <ProductShowcase locale={locale} />
      <ContactCtaSection locale={locale} />
      <ContactSection locale={locale} />
    </>
  );
}
