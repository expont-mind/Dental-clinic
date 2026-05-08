import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/lib/i18n/dictionaries";
import { Hero } from "@/components/marketing/Hero";
import { ServicesGrid } from "@/components/marketing/ServicesGrid";
import { DoctorsPreview } from "@/components/marketing/DoctorsPreview";
import { TrustStrip } from "@/components/marketing/TrustStrip";
import { CTABand } from "@/components/marketing/CTABand";

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <>
      <Hero lang={lang} dict={dict} />
      <TrustStrip dict={dict} />
      <ServicesGrid lang={lang} dict={dict} />
      <DoctorsPreview lang={lang} dict={dict} />
      <CTABand lang={lang} dict={dict} />
    </>
  );
}
