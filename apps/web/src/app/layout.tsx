import "./globals.css";
import type { Metadata } from "next";
import { LegalCopilotDrawer } from "@/components/LegalCopilotDrawer";
import { PWAInstaller } from "@/pwa/pwa-installer";

export const metadata: Metadata = {
  title: "LegalOS — نظام إدارة المكاتب القانونية الذكي",
  description: "منصة SaaS متكاملة للمحاماة والاستشارات القانونية مدمجة مع منصة ناجز",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1a365d" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-heading bg-surface text-on-surface antialiased">
        {children}
        <LegalCopilotDrawer />
        <PWAInstaller />
      </body>
    </html>
  );
}
