"use client";

import React, { useState } from "react";
import { ShieldAlert, LogOut, Sparkles } from "lucide-react";

export function InteractiveSandboxBanner() {
  const [sandboxActive, setSandboxActive] = useState(false);

  if (!sandboxActive) {
    return (
      <button
        onClick={() => setSandboxActive(true)}
        className="btn-secondary text-xs flex items-center gap-1.5 border border-amber-500/30 bg-amber-500/10 text-amber-900 hover:bg-amber-500/20"
      >
        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
        <span>تجربة البيئة الوهمية (Sandbox Mode)</span>
      </button>
    );
  }

  return (
    <div className="bg-amber-500 text-amber-950 px-4 py-2 flex items-center justify-between text-xs font-bold shadow-level-1" dir="rtl">
      <div className="flex items-center gap-2">
        <ShieldAlert className="w-4 h-4 text-amber-950" />
        <span>أنت الآن بداخل البيئة التدريبية الوهمية (Sandbox Environment) • البيانات الحالية وهمية ويمكنك التجربة دون تأثير على بياناتك الحقيقية.</span>
      </div>
      <button
        onClick={() => setSandboxActive(false)}
        className="bg-amber-950 text-amber-100 px-3 py-1 rounded-pill flex items-center gap-1 hover:bg-black text-[11px]"
      >
        <LogOut className="w-3.5 h-3.5" />
        <span>الخروج من البيئة الوهمية (Exit Sandbox)</span>
      </button>
    </div>
  );
}
