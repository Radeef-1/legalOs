"use client";

import React from "react";

interface AppButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  children: React.ReactNode;
}

export function AppButton({ variant = "primary", children, className = "", ...props }: AppButtonProps) {
  const baseClasses =
    "px-4 py-2 rounded-card text-label-md font-bold transition-all duration-200 shadow-level-1 flex items-center justify-center gap-2 cursor-pointer";
  
  const variantClasses =
    variant === "secondary"
      ? "bg-secondary text-on-secondary hover:brightness-110"
      : variant === "outline"
      ? "border border-outline-variant bg-surface-container-low text-primary hover:bg-surface-container-high"
      : "bg-primary text-on-primary hover:brightness-110";

  return (
    <button className={`${baseClasses} ${variantClasses} ${className}`} {...props}>
      {children}
    </button>
  );
}
