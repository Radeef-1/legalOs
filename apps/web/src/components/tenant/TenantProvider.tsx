"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface TenantConfig {
  id: string;
  slug: string;
  name: string;
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  language: string;
  timezone: string;
  dateFormat: string;
  currency: string;
  supportEmail: string;
  supportPhone: string;
  workingHours: string;
  theme: string;
  customCss?: string;
  settings: {
    branding: {
      primary: string;
      secondary: string;
      logo?: string;
      favicon?: string;
    };
    theme: {
      mode: "light" | "dark" | "auto";
      font: string;
      density: "compact" | "comfortable" | "enterprise";
    };
    navigation: {
      layout: "sidebar" | "top" | "hybrid";
      hiddenModules: string[];
    };
    features: {
      ai: boolean;
      portal: boolean;
      calendar: boolean;
      billing: boolean;
      crm: boolean;
      accounting: boolean;
    };
    communication: {
      emailSignature?: string;
      smsSender?: string;
    };
  };
}

const defaultTenantConfig: TenantConfig = {
  id: "org-salman-2026",
  slug: "otaibi-law",
  name: "مكتب العتيبي للمحاماة والاستشارات القانونية والشرعية",
  primaryColor: "#041627",
  secondaryColor: "#1b6d24",
  fontFamily: "Cairo",
  language: "ar",
  timezone: "Asia/Riyadh",
  dateFormat: "YYYY-MM-DD",
  currency: "SAR",
  supportEmail: "info@lawfirm.sa",
  supportPhone: "0549040268",
  workingHours: "الأحد - الخميس: 8:00 ص - 5:00 م",
  theme: "light",
  settings: {
    branding: {
      primary: "#041627",
      secondary: "#1b6d24",
    },
    theme: {
      mode: "light",
      font: "Cairo",
      density: "comfortable",
    },
    navigation: {
      layout: "sidebar",
      hiddenModules: [],
    },
    features: {
      ai: true,
      portal: true,
      calendar: true,
      billing: true,
      crm: true,
      accounting: true,
    },
    communication: {
      emailSignature: "جميع الحقوق محفوظة © 2026 مكتب العتيبي للمحاماة",
      smsSender: "العتيبي",
    },
  },
};

const TenantContext = createContext<{
  tenant: TenantConfig;
  updateTenantSettings: (newSettings: Partial<TenantConfig>) => void;
  loading: boolean;
}>({
  tenant: defaultTenantConfig,
  updateTenantSettings: () => {},
  loading: false,
});

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [tenant, setTenant] = useState<TenantConfig>(defaultTenantConfig);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 1. Resolve Tenant Config from Host / Backend Endpoint
    const fetchConfig = async () => {
      try {
        const host = typeof window !== "undefined" ? window.location.host : "otaibi-law";
        const res = await fetch(`http://localhost:3000/v1/tenant/config?slug=${encodeURIComponent(host)}`).catch(() => null);
        if (res && res.ok) {
          const data = await res.json();
          if (data.config) {
            setTenant(data.config);
          }
        }
      } catch (err) {}
    };

    fetchConfig();
  }, []);

  useEffect(() => {
    // 2. Dynamic Runtime Injector: Apply CSS Variables, Document Title & Favicon
    if (typeof document !== "undefined") {
      const root = document.documentElement;

      // Primary & Secondary CSS Colors Injection
      root.style.setProperty("--primary", tenant.settings.branding.primary || tenant.primaryColor);
      root.style.setProperty("--secondary", tenant.settings.branding.secondary || tenant.secondaryColor);
      root.style.setProperty("--font-family", tenant.settings.theme.font || tenant.fontFamily || "Cairo, sans-serif");

      // Dynamic Document Title
      document.title = `${tenant.name} | نظام التشغيل القانوني`;

      // Dynamic Favicon Injection
      let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
      if (!link) {
        link = document.createElement("link");
        link.type = "image/x-icon";
        link.rel = "shortcut icon";
        document.getElementsByTagName("head")[0].appendChild(link);
      }
      if (tenant.settings.branding.favicon || tenant.faviconUrl) {
        link.href = tenant.settings.branding.favicon || tenant.faviconUrl || "/favicon.ico";
      }

      // Dynamic Custom CSS Injector
      if (tenant.customCss) {
        let styleTag = document.getElementById("tenant-custom-css");
        if (!styleTag) {
          styleTag = document.createElement("style");
          styleTag.id = "tenant-custom-css";
          document.head.appendChild(styleTag);
        }
        styleTag.innerHTML = tenant.customCss;
      }
    }
  }, [tenant]);

  const updateTenantSettings = (newSettings: Partial<TenantConfig>) => {
    setTenant((prev) => {
      const updated = {
        ...prev,
        ...newSettings,
        settings: {
          ...prev.settings,
          ...newSettings.settings,
        },
      };
      if (typeof window !== "undefined") {
        localStorage.setItem("organizationData", JSON.stringify(updated));
      }
      return updated;
    });
  };

  return (
    <TenantContext.Provider value={{ tenant, updateTenantSettings, loading }}>
      {children}
    </TenantContext.Provider>
  );
}

export const useTenant = () => useContext(TenantContext);
