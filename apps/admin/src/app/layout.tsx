import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LegalOS Enterprise Control Center (v5.0)",
  description: "Enterprise Control Plane for LegalOS Multi-Tenant SaaS Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-heading bg-surface text-on-surface antialiased selection:bg-primary/20 selection:text-primary">
        {children}
      </body>
    </html>
  );
}
