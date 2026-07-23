"use client";

import React from "react";
import { useTenant } from "./TenantProvider";

interface TenantTitleProps {
  className?: string;
  fallback?: string;
}

export function TenantTitle({ className = "", fallback }: TenantTitleProps) {
  const { tenant } = useTenant();
  return (
    <span className={className}>
      {tenant?.name || fallback || "مكتب العتيبي للمحاماة والاستشارات القانونية والشرعية"}
    </span>
  );
}
