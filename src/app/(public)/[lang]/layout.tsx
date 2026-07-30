import type { Metadata } from "next";
import { Manrope, Inter, Allura } from "next/font/google";
import { notFound } from "next/navigation";
import "../../globals.css";
import { getDictionary, hasLocale, LOCALES } from "@/lib/i18n/dictionaries";
import { Header } from "@/components/layout/Header";
import { HeaderGate } from "@/components/layout/HeaderGate";
import { Footer } from "@/components/layout/Footer";
import { FooterGate } from "@/components/layout/FooterGate";
import { Toaster } from "sonner";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const fraunces = Inter({
  variable: "--font-fraunces",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const allura = Allura({
  variable: "--font-allura",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  ? process.env.NEXT_PUBLIC_SITE_URL
  : process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3001";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Dentaris",
    template: "%s · Dentaris",
  },
  description:
    "Modern dental care center — cosmetic dentistry, orthodontics and oral surgery. Online booking, gentle techniques and personalized treatment plans.",
  openGraph: {
    type: "website",
    siteName: "Dentaris",
    title: "Dentaris",
    description:
      "Modern dental care center — cosmetic dentistry, orthodontics and oral surgery.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dentaris",
    description:
      "Modern dental care center — cosmetic dentistry, orthodontics and oral surgery.",
  },
};

export async function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <html
      lang={lang}
      className={`${manrope.variable} ${fraunces.variable} ${allura.variable} antialiased`}
    >
      <body className="min-h-screen flex flex-col bg-bg text-ink">
        <Toaster richColors position="top-right" />
        <HeaderGate>
          <Header lang={lang} dict={dict} />
        </HeaderGate>
        {/* min-height keeps short pages (booking steps, account) filling the
            viewport so the tall footer stays below the fold instead of
            crowding up from the bottom. */}
        <main className="flex-1 min-h-[calc(100dvh-4rem)]">{children}</main>
        <FooterGate>
          <Footer dict={dict} />
        </FooterGate>
      </body>
    </html>
  );
}
