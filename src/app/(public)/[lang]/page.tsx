import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/lib/i18n/dictionaries";
import { Hero } from "@/components/marketing/Hero";
import { StatsStrip } from "@/components/marketing/StatsStrip";
import { ServicesGrid } from "@/components/marketing/ServicesGrid";
import { WhyTrust } from "@/components/marketing/WhyTrust";
import { ProcessSteps } from "@/components/marketing/ProcessSteps";
import { CareCards } from "@/components/marketing/CareCards";
import { DoctorsPreview } from "@/components/marketing/DoctorsPreview";
import { Testimonials } from "@/components/marketing/Testimonials";
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
      <StatsStrip dict={dict} />
      <ServicesGrid lang={lang} dict={dict} />
      <WhyTrust lang={lang} dict={dict} />
      <ProcessSteps lang={lang} dict={dict} />
      <CareCards dict={dict} />
      <DoctorsPreview lang={lang} dict={dict} />
      <Testimonials dict={dict} />
      <CTABand lang={lang} dict={dict} />
    </>
  );
}
