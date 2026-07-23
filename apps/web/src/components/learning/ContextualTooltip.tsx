"use client";

import React, { useState } from "react";
import { HelpCircle } from "lucide-react";

interface ContextualTooltipProps {
  title: string;
  content: string;
}

export function ContextualTooltip({ title, content }: ContextualTooltipProps) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative inline-block" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      <button
        type="button"
        className="text-on-surface-variant hover:text-secondary p-0.5 rounded-soft transition"
        title={title}
      >
        <HelpCircle className="w-4 h-4" />
      </button>

      {show && (
        <div
          className="absolute bottom-full mb-2 right-0 z-50 w-64 p-3 bg-primary text-on-primary text-xs rounded-card shadow-level-2 space-y-1 animate-in fade-in zoom-in duration-150 font-body"
          dir="rtl"
        >
          <div className="font-bold text-secondary text-label-sm">{title}</div>
          <p className="leading-relaxed opacity-90">{content}</p>
        </div>
      )}
    </div>
  );
}
