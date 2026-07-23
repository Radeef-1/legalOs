"use client";

import React, { useState } from "react";
import { Sparkles, MessageSquare, Send, X, Bot, PlayCircle, HelpCircle } from "lucide-react";

export function AiLegalMentorWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Array<{ role: "user" | "mentor"; text: string; actionText?: string }>>([
    {
      role: "mentor",
      text: "مرحباً بك! أنا المرشد التعليمي الذكي لنظام LegalOS ⚖️. كيف يمكنني مساعدتك اليوم في تصفح النظام أو تنفيذ مهمة قانونية؟",
    },
  ]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userText = query;
    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setQuery("");

    setTimeout(() => {
      let reply = "يمكنك إنجاز ذلك بسهولة عبر خطوات موجهة. هل ترغب في بدء الجولة التفاعلية الحية الآن؟";
      if (userText.includes("قضية")) {
        reply = "لإنشاء قضية جديدة، انتقل لقائمة 'إدارة القضايا والعملاء' واضغط زر 'تسجيل قضية جديدة'. سأقوم بتوجيهك خطوة بخطوة 🟢";
      } else if (userText.includes("دعوة")) {
        reply = "لإرسال دعوة محامي أو موكل، انتقل لـ 'محرك الدعوات والعضويات' من الإعدادات واضغط 'إنشاء دعوة جديدة' 📱";
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "mentor",
          text: reply,
          actionText: "بدء التوجيه التفاعلي الحي 🚀",
        },
      ]);
    }, 600);
  };

  return (
    <div className="fixed bottom-6 left-6 z-50 font-heading">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-primary text-on-primary border border-secondary/40 px-4 py-3 rounded-pill shadow-level-2 flex items-center gap-2.5 font-bold hover:brightness-110 transition animate-bounce"
        >
          <div className="w-7 h-7 rounded-pill bg-secondary text-on-secondary flex items-center justify-center font-bold shadow-sm">
            <Sparkles className="w-4 h-4 text-on-secondary" />
          </div>
          <span>اسأل المرشد الذكي (AI Mentor)</span>
        </button>
      ) : (
        <div className="w-96 bg-surface-container-lowest border border-outline-variant rounded-card shadow-level-2 overflow-hidden flex flex-col h-[460px]" dir="rtl">
          {/* Header */}
          <div className="bg-primary text-on-primary p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-pill bg-secondary text-on-secondary flex items-center justify-center font-bold">
                <Bot className="w-4 h-4 text-on-secondary" />
              </div>
              <div>
                <h4 className="text-label-md font-bold text-white">المرشد التعليمي الذكي</h4>
                <p className="text-[10px] text-white/70 font-body">LegalOS Adoption Assistant</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/10 rounded-soft text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-surface-container-low/30">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-card text-xs space-y-2 ${
                  m.role === "user"
                    ? "bg-primary text-white mr-auto max-w-[80%]"
                    : "bg-surface-container-lowest border border-outline-variant text-primary ml-auto max-w-[90%]"
                }`}
              >
                <p className="leading-relaxed font-body">{m.text}</p>
                {m.actionText && (
                  <button className="btn-secondary text-[11px] py-1 px-2.5 w-full flex items-center justify-center gap-1 mt-1">
                    <PlayCircle className="w-3.5 h-3.5" />
                    <span>{m.actionText}</span>
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Input Box */}
          <form onSubmit={handleSend} className="p-3 border-t border-outline-variant bg-surface-container-lowest flex items-center gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="كيف أضيف قضية؟ كيف أرسل دعوة؟..."
              className="flex-1 bg-surface-container-low border border-outline-variant px-3 py-2 rounded-soft text-xs text-primary"
            />
            <button type="submit" className="p-2 bg-primary text-white rounded-soft hover:bg-primary/90">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
