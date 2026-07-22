"use client";

import React from "react";
import Link from "next/link";
import { X, Shield, FileText, Settings, BarChart2, Layers, Cpu, HelpCircle, LogOut } from "lucide-react";

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  if (!isOpen) return null;

  const links = [
    { href: "/reports", label: "التقارير والتحليلات المالية", icon: BarChart2 },
    { href: "/documents", label: "إدارة المستندات والمكتبة", icon: FileText },
    { href: "/tasks", label: "المهام والإجراءات الإدارية", icon: Layers },
    { href: "/integrations", label: "التكاملات (ناجز / زكاة / سلة)", icon: Cpu },
    { href: "/ai-assistant", label: "الذكاء الاصطناعي والصياغة", icon: Shield },
    { href: "/admin", label: "إعدادات وصلاحيات المكتب", icon: Settings },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-4/5 max-w-sm bg-slate-900 text-white h-full shadow-2xl p-5 flex flex-col border-r border-slate-800 animate-in slide-in-from-left duration-300">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg">
              L
            </div>
            <div>
              <h3 className="font-bold text-base text-white">LegalOS Enterprise</h3>
              <p className="text-xs text-slate-400">مكتب الحارثي للمحاماة</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 py-4 overflow-y-auto space-y-1">
          {links.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition-all text-sm"
              >
                <Icon className="w-5 h-5 text-indigo-400" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="border-t border-slate-800 pt-4 flex flex-col gap-2">
          <button
            onClick={() => {
              onClose();
              window.location.href = "/auth/login";
            }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors text-sm font-semibold"
          >
            <LogOut className="w-5 h-5" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </div>
    </div>
  );
}
