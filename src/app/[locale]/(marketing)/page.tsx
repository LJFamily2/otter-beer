import { HeroSection } from "@/components/sections/HeroSection";
import { TaglineSection } from "@/components/sections/TaglineSection";
import { ProductShowcase } from "@/components/sections/ProductShowcase";
import { BrandStorySection } from "@/components/sections/BrandStorySection";
import ContactSection from "./contact/contact";
import { ContactCtaSection } from "@/components/sections/ContactCtaSection";
import { beerService } from "@/services/BeerService";
import { toShowcaseItem } from "@/lib/utils/BeerPresenter";

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;

  const beers = await beerService
    .listShowcasePublished()
    .then((items) => items.map((beer) => toShowcaseItem(beer, locale)).filter((item) => item !== null))
    .catch(() => []);

  return (
    <>
      <HeroSection />
      <BrandStorySection locale={locale} />
      <TaglineSection locale={locale} />
      {beers.length > 0 ? <ProductShowcase locale={locale} beers={beers} /> : null}
      <ContactCtaSection locale={locale} />
      <ContactSection locale={locale} />
    </>
  );
}
