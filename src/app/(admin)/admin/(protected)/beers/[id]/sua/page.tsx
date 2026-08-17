import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { MODULE_KEYS } from "@/config/permissions";
import { beerService } from "@/services/BeerService";
import { BeerForm, type BeerFormInitialData } from "../../BeerForm";

export const metadata: Metadata = {
  title: "Chỉnh sửa sản phẩm",
  robots: { index: false, follow: false },
};

interface EditBeerPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBeerPage({ params }: EditBeerPageProps) {
  const session = await auth();
  if (!session?.user?.permissions?.[MODULE_KEYS.BEERS]?.edit) {
    redirect("/admin/beers");
  }

  const { id } = await params;
  const beer = await beerService.getById(id);
  if (!beer) {
    notFound();
  }

  const initialData: BeerFormInitialData = {
    imageKey: beer.imageKey,
    abv: beer.abv,
    ibu: beer.ibu,
    shopUrl: beer.shopUrl,
    findLocallyUrl: beer.findLocallyUrl,
    isFeatured: beer.isFeatured,
    status: beer.status,
    translations: Object.fromEntries(
      beer.translations.map((t) => [
        t.locale,
        { style: t.style, headline: t.headline, description: t.description },
      ])
    ) as BeerFormInitialData["translations"],
  };

  return <BeerForm mode="edit" beerId={id} initialData={initialData} />;
}
