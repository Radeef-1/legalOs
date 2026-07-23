"use client";

import React from "react";
import { useTenant } from "./TenantProvider";
import { Building2 } from "lucide-react";

interface TenantLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function TenantLogo({ className = "", size = "md" }: TenantLogoProps) {
  const { tenant } = useTenant();
  const logo = tenant?.settings?.branding?.logo || tenant?.logoUrl;
  const name = tenant?.name || "مكتب العتيبي للمحاماة";

  const sizeClasses =
    size === "sm"
      ? "w-7 h-7 text-xs"
      : size === "lg"
      ? "w-14 h-14 text-xl"
      : "w-9 h-9 text-sm";

  if (logo) {
    return (
      <img
        src={logo}
        alt={name}
        className={`${sizeClasses} rounded-card object-contain ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses} rounded-card bg-secondary text-on-secondary flex items-center justify-center font-bold shadow-md shrink-0 ${className}`}
    >
      <Building2 className="w-5 h-5 text-on-secondary" />
    </div>
  );
}
