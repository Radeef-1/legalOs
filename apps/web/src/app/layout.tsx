import "./globals.css";
import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic, Inter } from "next/font/google";
import { LegalCopilotDrawer } from "@/components/LegalCopilotDrawer";
import { PWAInstaller } from "@/pwa/pwa-installer";
import { SkipToContent } from "@/components/SkipToContent";

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-ibm-plex-arabic",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "LegalOS — منصة إدارة المكاتب القانونية الذكية",
    template: "%s | LegalOS Enterprise",
  },
  description: "نظام SaaS متكامل لإدارة مكاتب المحاماة والاستشارات القانونية مدمج مع منصة ناجز وهيئة الزكاة والضريبة والجمارك ZATCA",
  manifest: "/manifest.json",
  authors: [{ name: "LegalOS Enterprise Team" }],
  keywords: ["محاماة", "ناجز", "ZATCA", "قضايا", "استشارات قانونية", "السعودية", "SaaS"],
  robots: { index: true, follow: true },
  openGraph: {
    title: "LegalOS — منصة إدارة المكاتب القانونية الذكية",
    description: "نظام SaaS متكامل لإدارة مكاتب المحاماة في المملكة العربية السعودية",
    url: "https://legalos.sa",
    siteName: "LegalOS Enterprise",
    locale: "ar_SA",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={`${ibmPlexArabic.variable} ${inter.variable}`}>
      <head>
        <meta name="theme-color" content="#041627" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="font-heading bg-surface text-on-surface antialiased">
        <SkipToContent />
        <main id="main-content">{children}</main>
        <LegalCopilotDrawer />
        <PWAInstaller />
      </body>
    </html>
  );
}
