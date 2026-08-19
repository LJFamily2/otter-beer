import type { Metadata } from "next";
import { AgeVerificationGate } from "@/components/ui/AgeVerificationGate";

export const metadata: Metadata = {
  title: "Age Verification",
  description: "Please verify that you are 18 years of age or older to enter Otter Beer.",
};

interface AgeVerificationPageProps {
  params: Promise<{ locale: string }>;
}

export default async function AgeVerificationPage({
  params,
}: AgeVerificationPageProps) {
  const { locale } = await params;

  return <AgeVerificationGate locale={locale} isStandalone={true} />;
}
