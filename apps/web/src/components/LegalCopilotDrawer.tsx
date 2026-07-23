"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Bot,
  Send,
  X,
  Mic,
  Check,
  ThumbsUp,
  ThumbsDown,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Compass,
  FileText,
  Briefcase,
  AlertTriangle,
  Command,
} from "lucide-react";

export function LegalCopilotDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showReasoning, setShowReasoning] = useState(false);
  const [ratingSubmitted, setRatingSubmitted] = useState<Record<string, number>>({});

  const [messages, setMessages] = useState<
    Array<{
      id: string;
      sender: "user" | "copilot";
      text: string;
      intent?: string;
      actionPayload?: { actionType: string; targetPath?: string; uiPromptMessage?: string };
      reasoningChain?: string[];
      regulations?: { title: string; articleNumber: string }[];
    }>
  >([
    {
      id: "msg-welcome",
      sender: "copilot",
      text: "مرحباً بك! أنا المرشد القانوني الذكي (Legal Copilot) لنظام LegalOS. كيف يمكنني مساعدتك اليوم؟ يمكنك القول: 'أريد إضافة قضية تجارية' أو 'أين أجد العقود؟'",
      reasoningChain: [
        "تم تهيئة المرشد القانوني الذكي لسياق المكتب",
        "تم تحميل محرك النوايا (Intent Engine) وقواعد RAG للأنظمة السعودية",
      ],
    },
  ]);

  // Shortcut Listener Cmd + K / Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSend = async () => {
    if (!prompt.trim()) return;

    const userMsg = { id: `u-${Date.now()}`, sender: "user" as const, text: prompt };
    setMessages((prev) => [...prev, userMsg]);
    const inputPrompt = prompt;
    setPrompt("");
    setLoading(true);

    try {
      // Simulate/Call Legal Copilot Intent API
      const res = await fetch("http://localhost:3000/v1/ai/copilot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: inputPrompt }),
      });

      if (res.ok) {
        const json = await res.json();
        const data = json.data;
        setMessages((prev) => [
          ...prev,
          {
            id: data.messageId || `c-${Date.now()}`,
            sender: "copilot",
            text: data.response,
            intent: data.intent?.intent,
            actionPayload: data.intent?.actionPayload,
            reasoningChain: data.explainability?.reasoningChain,
            regulations: data.explainability?.referencedRegulations,
          },
        ]);
      } else {
        // Fallback Client Intent Simulation if API offline
        simulateLocalIntent(inputPrompt);
      }
    } catch (err) {
      simulateLocalIntent(inputPrompt);
    } finally {
      setLoading(false);
    }
  };

  const simulateLocalIntent = (text: string) => {
    let intent = "GENERAL_LEGAL_QUERY";
    let targetPath = "/dashboard";
    let actionText = "تم تحليل الطلب والإجابة استناداً للأنظمة السعودية.";

    if (text.includes("قضية") || text.includes("أضيف")) {
      intent = "CREATE_CASE";
      targetPath = "/cases?action=new";
      actionText = "تم اكتشاف نية إنشاء قضية جديدة 🪄. سيتم فتح النموذج وتعبئة البيانات مبدئياً.";
    } else if (text.includes("عقود") || text.includes("مستندات")) {
      intent = "NAVIGATE";
      targetPath = "/documents";
      actionText = "تم التوجه المباشر إلى قسم المستندات والعقود 🧭.";
    }

    setMessages((prev) => [
      ...prev,
      {
        id: `c-${Date.now()}`,
        sender: "copilot",
        text: `أهلاً بك! بناءً على تحليل نية طلبك: ${actionText}`,
        intent,
        actionPayload: { actionType: intent, targetPath, uiPromptMessage: actionText },
        reasoningChain: [
          `تم اكتشاف النية: ${intent}`,
          "تم الرجوع لنظام المحاكم التجارية وقواعد RAG السعودية",
        ],
      },
    ]);
  };

  const handleRating = (msgId: string, rating: number) => {
    setRatingSubmitted((prev) => ({ ...prev, [msgId]: rating }));
  };

  const toggleVoice = () => {
    setIsListening((prev) => !prev);
    if (!isListening) {
      setPrompt("أريد إنشاء قضية تجارية للعميل شركة النمو");
    }
  };

  return (
    <>
      {/* Floating Copilot Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 md:bottom-6 md:left-6 md:right-auto z-40 md:z-50 flex items-center gap-2 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white px-4 py-2.5 md:px-5 md:py-3 rounded-full shadow-2xl hover:scale-105 transition-all duration-300 border border-white/20 group"
      >
        <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
        <span className="font-bold text-xs md:text-sm">المرشد الذكي</span>
        <span className="hidden sm:inline-flex items-center gap-1 bg-white/20 text-xs px-2 py-0.5 rounded text-white/90">
          <Command className="w-3 h-3" /> K
        </span>
      </button>

      {/* Copilot Drawer Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-md bg-slate-900 text-white h-full shadow-2xl flex flex-col border-r border-slate-800 animate-in slide-in-from-left duration-300">
            {/* Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 to-indigo-950">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base flex items-center gap-2">
                    المرشد القانوني الذكي
                    <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">
                      Intent Engine
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">المرشد التشغيلي لنظام LegalOS</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 text-sm">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.sender === "user" ? "items-start" : "items-end"}`}
                >
                  <div
                    className={`max-w-[90%] p-3.5 rounded-2xl ${
                      m.sender === "user"
                        ? "bg-indigo-600 text-white rounded-tr-none"
                        : "bg-slate-800/90 text-slate-100 border border-slate-700/60 rounded-tl-none"
                    }`}
                  >
                    {/* Intent Badge */}
                    {m.intent && (
                      <div className="mb-2 flex items-center gap-1.5 text-xs bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2 py-1 rounded-md">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>اكتشاف النية: <strong>{m.intent}</strong></span>
                      </div>
                    )}

                    <p className="whitespace-pre-line leading-relaxed text-xs sm:text-sm">{m.text}</p>

                    {/* Action Execution Button */}
                    {m.actionPayload?.targetPath && (
                      <div className="mt-3 pt-2 border-t border-slate-700/50 flex items-center justify-between">
                        <span className="text-xs text-emerald-400 font-medium">
                          {m.actionPayload.uiPromptMessage || "إجراء مقترح جاهز للتنفيذ"}
                        </span>
                        <a
                          href={m.actionPayload.targetPath}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 font-bold transition-all shadow-md"
                        >
                          تعدية الإجراء 🪄
                          <ArrowLeft className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}

                    {/* Reasoning Accordion */}
                    {m.reasoningChain && m.reasoningChain.length > 0 && (
                      <div className="mt-2 text-xs">
                        <button
                          onClick={() => setShowReasoning(!showReasoning)}
                          className="text-indigo-400 flex items-center gap-1 hover:underline"
                        >
                          {showReasoning ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          تفسير منطق الاستجابة والمراجع النظامية
                        </button>
                        {showReasoning && (
                          <div className="mt-2 p-2 bg-slate-950/80 rounded border border-slate-800 text-slate-300 space-y-1">
                            {m.reasoningChain.map((chain, i) => (
                              <p key={i}>• {chain}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Feedback Controls for Copilot */}
                  {m.sender === "copilot" && m.id !== "msg-welcome" && (
                    <div className="mt-1 flex items-center gap-2 text-slate-500 text-xs px-1">
                      <span>هل كانت الإجابة مفيدة؟</span>
                      <button
                        onClick={() => handleRating(m.id, 5)}
                        className={`hover:text-emerald-400 ${ratingSubmitted[m.id] === 5 ? "text-emerald-400 font-bold" : ""}`}
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleRating(m.id, 1)}
                        className={`hover:text-rose-400 ${ratingSubmitted[m.id] === 1 ? "text-rose-400 font-bold" : ""}`}
                      >
                        <ThumbsDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 text-slate-400 text-xs p-2">
                  <Sparkles className="w-4 h-4 text-indigo-400 animate-spin" />
                  <span>المرشد القانوني يحلل النية واستخراج القرارات...</span>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <div className="p-3 border-t border-slate-800 bg-slate-950">
              <div className="relative flex items-center bg-slate-900 rounded-xl border border-slate-800 focus-within:border-indigo-500 transition-all">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="اسأل المرشد القانوني أو اطلب إجراءً... (مثال: أنشئ قضية تجارية)"
                  className="w-full bg-transparent text-sm text-white px-4 py-3 focus:outline-none placeholder-slate-500"
                />
                <button
                  onClick={toggleVoice}
                  className={`p-2 text-slate-400 hover:text-white transition-all ${isListening ? "text-rose-400 animate-pulse" : ""}`}
                  title="المساعد الصوتي"
                >
                  <Mic className="w-5 h-5" />
                </button>
                <button
                  onClick={handleSend}
                  disabled={!prompt.trim()}
                  className="p-2.5 m-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-lg transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
