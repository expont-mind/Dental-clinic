import type { Metadata } from "next";
import { Manrope, Fraunces } from "next/font/google";
import { notFound } from "next/navigation";
import "../../globals.css";
import { getDictionary, hasLocale, LOCALES } from "@/lib/i18n/dictionaries";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin", "cyrillic"],
  axes: ["opsz", "SOFT"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Lumen Эмнэлэг — Lumen Hospital",
    template: "%s · Lumen",
  },
  description:
    "Орчин үеийн эмнэлгийн үйлчилгээ, онлайн цаг захиалга. Modern hospital care, online booking.",
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
      className={`${manrope.variable} ${fraunces.variable} antialiased`}
    >
      <body className="min-h-screen flex flex-col bg-bg text-ink">
        <Header lang={lang} dict={dict} />
        <main className="flex-1">{children}</main>
        <Footer dict={dict} />
      </body>
    </html>
  );
}
