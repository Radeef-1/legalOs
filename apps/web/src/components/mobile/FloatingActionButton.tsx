"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, Briefcase, UserPlus, Camera, Mic, Calendar, X } from "lucide-react";

interface FABProps {
  onOpenScanner?: () => void;
  onOpenVoice?: () => void;
}

export function FloatingActionButton({ onOpenScanner, onOpenVoice }: FABProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden fixed bottom-20 left-4 z-40 flex flex-col items-start">
      {/* Quick Action Popup Menu */}
      {isOpen && (
        <div className="mb-3 flex flex-col gap-2.5 items-end animate-in slide-in-from-bottom-4 duration-200">
          <Link
            href="/cases?action=new"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 bg-slate-900 text-white border border-slate-700/80 px-4 py-2.5 rounded-full shadow-xl text-xs font-semibold hover:bg-slate-800"
          >
            <span>قضية جديدة</span>
            <Briefcase className="w-4 h-4 text-indigo-400" />
          </Link>

          <Link
            href="/crm?action=new"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 bg-slate-900 text-white border border-slate-700/80 px-4 py-2.5 rounded-full shadow-xl text-xs font-semibold hover:bg-slate-800"
          >
            <span>إضافة موكل</span>
            <UserPlus className="w-4 h-4 text-emerald-400" />
          </Link>

          {onOpenScanner && (
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenScanner();
              }}
              className="flex items-center gap-2 bg-slate-900 text-white border border-slate-700/80 px-4 py-2.5 rounded-full shadow-xl text-xs font-semibold hover:bg-slate-800"
            >
              <span>مسح/تصوير مستند</span>
              <Camera className="w-4 h-4 text-amber-400" />
            </button>
          )}

          {onOpenVoice && (
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenVoice();
              }}
              className="flex items-center gap-2 bg-slate-900 text-white border border-slate-700/80 px-4 py-2.5 rounded-full shadow-xl text-xs font-semibold hover:bg-slate-800"
            >
              <span>تسجيل ملاحظة صوتية</span>
              <Mic className="w-4 h-4 text-rose-400" />
            </button>
          )}
        </div>
      )}

      {/* Main Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-13 h-13 rounded-full bg-gradient-to-r from-blue-700 to-indigo-700 text-white shadow-2xl flex items-center justify-center border border-white/20 transition-transform duration-300 ${
          isOpen ? "rotate-45 bg-rose-600" : "hover:scale-110"
        }`}
        aria-label="Quick actions"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}
