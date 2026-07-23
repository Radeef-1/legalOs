"use client";

import React, { useState, useEffect } from "react";
import { Search, Command, Briefcase, FileText, Users, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { useRouter } from "next/navigation";

export function CommandKModal() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const router = useRouter();

  // Keyboard shortcut listener: CTRL+K or CMD+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!isOpen) return null;

  const quickActions = [
    { title: "قضية جديدة", icon: Briefcase, url: "/cases?action=new", tag: "إضافة" },
    { title: "رفع مستند وحفظ بالـ Vault", icon: FileText, url: "/documents?action=upload", tag: "أرشيف" },
    { title: "تسجيل موكل جديد", icon: Users, url: "/portal?action=new-client", tag: "عملاء" },
    { title: "مركز الأمان وتدقيق الـ SOC", icon: ShieldCheck, url: "/admin?tab=security", tag: "أمان" },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 bg-slate-950/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Search Input Bar */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-slate-800 bg-slate-950/40">
          <Search className="w-5 h-5 text-amber-400 ml-3 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن قضية، موكل، مستند، أو اكتب أمراً..."
            className="w-full bg-transparent text-slate-100 placeholder-slate-500 focus:outline-none text-base font-medium"
            autoFocus
          />
          <div className="flex items-center gap-1 bg-slate-800 text-slate-400 text-xs px-2 py-1 rounded-md font-mono shrink-0 mr-2">
            <span>ESC</span>
          </div>
        </div>

        {/* Quick Navigation Items */}
        <div className="p-3 max-h-[380px] overflow-y-auto space-y-1">
          <div className="text-[11px] font-semibold text-slate-400 px-3 py-1.5 uppercase tracking-wider">
            أوامر وإجراءات سريعة (Command Palette)
          </div>

          {quickActions.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                onClick={() => {
                  setIsOpen(false);
                  router.push(item.url);
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-slate-300 hover:bg-amber-500/10 hover:text-amber-300 transition-all text-right group border border-transparent hover:border-amber-500/30"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-800 group-hover:bg-amber-500/20 text-slate-300 group-hover:text-amber-400 transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium">{item.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-slate-800 group-hover:bg-amber-500/20 text-slate-400 group-hover:text-amber-300 px-2 py-0.5 rounded-full">
                    {item.tag}
                  </span>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 text-amber-400 transition-opacity -rotate-180" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-2.5 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>ابحث باللغة العربية أو استخدم الكود المعرف</span>
          </div>
          <div className="flex items-center gap-1 font-mono text-[11px]">
            <Command className="w-3 h-3 text-slate-400" />
            <span>+ K للتفعيل في أي مكان</span>
          </div>
        </div>
      </div>
    </div>
  );
}
