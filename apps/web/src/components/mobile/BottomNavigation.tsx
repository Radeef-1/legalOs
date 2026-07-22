"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Briefcase, Calendar, Bell, Menu } from "lucide-react";

interface BottomNavigationProps {
  onOpenDrawer: () => void;
}

export function BottomNavigation({ onOpenDrawer }: BottomNavigationProps) {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: "الرئيسية", icon: Home },
    { href: "/cases", label: "القضايا", icon: Briefcase },
    { href: "/calendar", label: "التقويم", icon: Calendar },
    { href: "/portal", label: "البوابة", icon: Bell },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 shadow-2xl px-2 py-1 flex items-center justify-around text-slate-400">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 ${
              isActive
                ? "text-indigo-400 font-bold bg-indigo-500/10 scale-105"
                : "hover:text-slate-200"
            }`}
          >
            <Icon className={`w-5 h-5 mb-0.5 ${isActive ? "text-indigo-400 stroke-[2.5]" : ""}`} />
            <span className="text-[11px] font-medium">{item.label}</span>
          </Link>
        );
      })}

      {/* Drawer Toggle */}
      <button
        onClick={onOpenDrawer}
        className="flex flex-col items-center justify-center py-1 px-3 rounded-xl hover:text-slate-200 transition-all"
      >
        <Menu className="w-5 h-5 mb-0.5 text-slate-400" />
        <span className="text-[11px] font-medium">المزيد</span>
      </button>
    </nav>
  );
}
