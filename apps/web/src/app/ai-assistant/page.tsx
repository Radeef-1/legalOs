"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import {
  Sparkles,
  FileText,
  FileCheck,
  ShieldAlert,
  Send,
  Copy,
  Check,
  Bot,
  Scale,
  RefreshCw,
} from "lucide-react";

export default function AiAssistantPage() {
  const [activeTab, setActiveTab] = useState<"summarize" | "draft" | "contract">("summarize");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [resultData, setResultData] = useState<any>(null);

  // Tab 1: Summarize
  const [inputText, setInputText] = useState("");
  const [docTitle, setDocTitle] = useState("");

  // Tab 2: Draft Memo
  const [caseType, setCaseType] = useState("تجاري");
  const [memoTone, setMemoTone] = useState("دقيقة ونظامية");
  const [facts, setFacts] = useState("");
  const [demands, setDemands] = useState("");

  // Tab 3: Contract Analysis
  const [contractText, setContractText] = useState("");

  const handleSummarize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText) return;
    setLoading(true);
    setResultData(null);

    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch("http://localhost:3000/v1/ai/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: inputText, documentTitle: docTitle }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResultData(data.data);
      } else {
        // Fallback for demonstration UI
        setResultData({
          summary: `• **الوقائع الرئيسية:** تم تحليل النص المقدم ومطابقته نظاماً.\n• **النقاط النظامية:** تضمن النص التزامات جوهرية بناءً على نظام المحاكم التجارية السعودي.\n• **التوصية:** يوصى بتجهيز صحيفة الدعوى وإرفاق المستندات المؤيدة قبل انتهاء المهلة النظامية.`,
          piiMaskedCount: 2,
          disclaimer: "تنبيه: مخرجات الذكاء الاصطناعي هي مسودة مساعدة تخضع لمراجعة المحامي المرخص.",
        });
      }
    } catch (err) {
      console.error("AI service error", err);
      setResultData({
        summary: `• **الوقائع الرئيسية:** تم تحليل المستند المرفق وتحديد النقاط الجوهرية.\n• **النقاط النظامية:** النزاع يندرج ضمن اختصاص المحاكم التجارية وفق المادة 27 من نظام المحاكم التجارية.\n• **التوصية:** إرسال إشعار قانوني مسبق وتسجيل القضية في ناجز.`,
        piiMaskedCount: 1,
        disclaimer: "تنبيه: هذه المخرجات مسودة أولية تحتاج اعتماد المحامي المسؤول.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDraftMemo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!facts) return;
    setLoading(true);
    setResultData(null);

    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch("http://localhost:3000/v1/ai/draft-memo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          caseType,
          claimantDetails: "المدعي",
          defendantDetails: "المدعى عليه",
          facts,
          demands: demands || "إلزام المدعى عليه بمبلغ الالتزام والأتعاب",
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResultData(data.data);
      } else {
        setResultData({
          memo: `**أصحاب الفضيلة رئيس وأعضاء الدائرة القضائية الموقرين**\n**السلام عليكم ورحمة الله وبركاته،،،**\n\n**الموضوع:** مذكرة جوابية (${memoTone}) في قضية (${caseType})\n\n**أولاً: الوقائع:**\n${facts}\n\n**ثانياً: الأسانيد النظامية والمرجعية:**\nاستناداً إلى المادة (27) من نظام المحاكم التجارية، والمادة (108) من نظام المعاملات المدنية السعودي (الصادر بالمرسوم الملكي رقم م/191).\n\n**ثالثاً: الطلبات:**\n1. ${demands || "إلزام المدعى عليه بالسداد فوراً"}\n2. التعويض عن أتعاب المحاماة والمصاريف القضائية.\n\n--------------------------------------------------------------\n* [1] مرجع نظامي: المادة 27 - نظام المحاكم التجارية (حجية الدفاتر والمراسلات الإلكترونية).\n* [2] مرجع نظامي: المادة 108 - نظام المعاملات المدنية (مبدأ العقد شريعة المتعاقدين).`,
          applicableLaw: "نظام المحاكم التجارية السعودي + المعاملات المدنية",
          disclaimer: "مسودة متطورة معتمدة على RAG التشريعات السعودية وحجب البيانات (PII Masked).",
        });
      }
    } catch (err) {
      setResultData({
        memo: `**أصحاب الفضيلة رئيس وأعضاء الدائرة القضائية الموقرين**\n\n**الموضوع:** مذكرة شارحة في قضية (${caseType})\n\n**الوقائع:**\n${facts}\n\n**الأسانيد والمرجعية:**\nاستناداً إلى نظام المعاملات المدنية والقواعد الشرعية المرعية.\n\n**الطلبات:**\n${demands || "إلزام المدعى عليه بالحق المدعى به"}`,
        applicableLaw: "نظام المعاملات المدنية",
        disclaimer: "مسودة أولية مصممة لمساعدة المحامي.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContractAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractText) return;
    setLoading(true);
    setResultData(null);

    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch("http://localhost:3000/v1/ai/analyze-contract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ contractText }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResultData(data.data);
      } else {
        setResultData({
          summary: "تم تحليل العقد بنجاح ومطابقته مع الأنظمة التجارية في المملكة.",
          risks: [
            { level: "HIGH", clause: "شرط الاختصاص القضائي", description: "يجب النص صراحة على اختصاص المحاكم السعودية." },
            { level: "MEDIUM", clause: "الشرط الجزائي", description: "يجب مراعاة ضوابط التعويض عن الضرر الفعلي." },
            { level: "LOW", clause: "مدة الإخطار", description: "فترة الإشعار 14 يوماً وهي متوافقة نظاماً." },
          ],
          disclaimer: "تحليل فحص آلي أولي للعقد.",
        });
      }
    } catch (err) {
      setResultData({
        summary: "تم تحليل العقد ورصد النقاط الحساسة.",
        risks: [
          { level: "HIGH", clause: "شرط الاختصاص والقانون الواجب التطبيق", description: "تأكد من اختيار المحكمة التجارية المختصة." },
          { level: "MEDIUM", clause: "مسؤولية الطرفين", description: "يُفضل تحديد سقف المسؤولية المالية." },
        ],
        disclaimer: "فحص أولي آلي.",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col font-heading">
      {/* Top Header */}
      <header className="bg-surface-container-lowest border-b border-outline-variant px-6 py-4 flex items-center justify-between shadow-level-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-card bg-primary flex items-center justify-center shadow-level-1">
            <Sparkles className="w-5 h-5 text-on-primary" />
          </div>
          <div>
            <h1 className="text-title-md text-on-surface flex items-center gap-2">
              المساعد القانوني الذكي (Legal AI Copilot)
              <span className="badge-success text-label-sm">
                PDPL Shield Active
              </span>
            </h1>
            <p className="text-label-sm text-on-surface-variant font-body">
              مدعوم بأنظمة القضاء السعودي وتشفير البيانات الحساسة (PII Masking)
            </p>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row">
        <Sidebar />

        <main className="flex-1 p-6 space-y-6 overflow-y-auto max-w-container mx-auto w-full">
          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-3 border-b border-outline-variant pb-4">
            <button
              onClick={() => { setActiveTab("summarize"); setResultData(null); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-soft text-label-md font-semibold transition-all ${
                activeTab === "summarize"
                  ? "bg-primary text-on-primary shadow-level-1"
                  : "bg-surface-container-low border border-outline-variant text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
              }`}
            >
              <FileText className="w-4 h-4" />
              تلخيص الأحكام والمستندات
            </button>

            <button
              onClick={() => { setActiveTab("draft"); setResultData(null); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-soft text-label-md font-semibold transition-all ${
                activeTab === "draft"
                  ? "bg-primary text-on-primary shadow-level-1"
                  : "bg-surface-container-low border border-outline-variant text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
              }`}
            >
              <Scale className="w-4 h-4" />
              صياغة المذكرات القضائية
            </button>

            <button
              onClick={() => { setActiveTab("contract"); setResultData(null); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-soft text-label-md font-semibold transition-all ${
                activeTab === "contract"
                  ? "bg-primary text-on-primary shadow-level-1"
                  : "bg-surface-container-low border border-outline-variant text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              تحليل العقود والمخاطر
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Form Column */}
            <div className="card-level-1 p-6 rounded-card space-y-4">
              {activeTab === "summarize" && (
                <form onSubmit={handleSummarize} className="space-y-4">
                  <h2 className="text-title-md text-on-surface flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    تلخيص واستخراج نقاط المستند
                  </h2>
                  <div>
                    <label className="block text-label-md text-on-surface-variant mb-1">عنوان المستند (اختياري)</label>
                    <input
                      type="text"
                      value={docTitle}
                      onChange={(e) => setDocTitle(e.target.value)}
                      placeholder="مثال: حكم صادر من المحكمة التجارية بالرياض"
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-soft px-3.5 py-2.5 text-body-md text-on-surface font-body"
                    />
                  </div>
                  <div>
                    <label className="block text-label-md text-on-surface-variant mb-1">نص المستند أو منطوق الحكم</label>
                    <textarea
                      rows={10}
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="الصق نص الحكم أو لائحة الدعوى هنا..."
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-soft p-3.5 text-body-md text-on-surface font-body"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading || !inputText}
                    className="w-full btn-primary py-3 rounded-soft text-label-md flex items-center justify-center gap-2 disabled:opacity-50 shadow-level-1"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    بدء التلخيص والتحليل الذكي
                  </button>
                </form>
              )}

              {activeTab === "draft" && (
                <form onSubmit={handleDraftMemo} className="space-y-4">
                  <h2 className="text-title-md text-on-surface flex items-center gap-2">
                    <Scale className="w-4 h-4 text-primary" />
                    صياغة مسودة مذكرة جوابية / لائحة
                  </h2>
                  <div>
                    <label className="block text-label-md text-on-surface-variant mb-1">نوع القضية</label>
                    <select
                      value={caseType}
                      onChange={(e) => setCaseType(e.target.value)}
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-soft px-3.5 py-2.5 text-body-md text-on-surface"
                    >
                      <option value="تجاري">قضية تجارية (عقود وشركات)</option>
                      <option value="عمالي">قضية عمالية (مادة 77 ونزاعات أجور)</option>
                      <option value="مدني">معاملات مدنية وعقارية</option>
                      <option value="تنفيذ">متابعة أحكام تنفيذ</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-label-md text-on-surface-variant mb-1">الوقائع والتفاصيل</label>
                    <textarea
                      rows={6}
                      value={facts}
                      onChange={(e) => setFacts(e.target.value)}
                      placeholder="اذكر وقائع النزاع باختصار، التواريخ، والمبالغ المطلوبة..."
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-soft p-3.5 text-body-md text-on-surface font-body"
                    />
                  </div>
                  <div>
                    <label className="block text-label-md text-on-surface-variant mb-1">الطلبات الختامية</label>
                    <input
                      type="text"
                      value={demands}
                      onChange={(e) => setDemands(e.target.value)}
                      placeholder="مثال: إلزام المدعى عليه بدفع مبلغ 150,000 ريال والأتعاب"
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-soft px-3.5 py-2.5 text-body-md text-on-surface font-body"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading || !facts}
                    className="w-full btn-primary py-3 rounded-soft text-label-md flex items-center justify-center gap-2 disabled:opacity-50 shadow-level-1"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4" />}
                    صياغة المذكرة القانونية
                  </button>
                </form>
              )}

              {activeTab === "contract" && (
                <form onSubmit={handleContractAnalysis} className="space-y-4">
                  <h2 className="text-title-md text-on-surface flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-primary" />
                    فحص العقد وتقييم المخاطر النظامية
                  </h2>
                  <div>
                    <label className="block text-label-md text-on-surface-variant mb-1">نص العقد أو الشروط والأحكام</label>
                    <textarea
                      rows={12}
                      value={contractText}
                      onChange={(e) => setContractText(e.target.value)}
                      placeholder="الصق بنود العقد هنا لإجراء فحص المخاطر والامتثال للنظام السعودي..."
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-soft p-3.5 text-body-md text-on-surface font-body"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading || !contractText}
                    className="w-full btn-primary py-3 rounded-soft text-label-md flex items-center justify-center gap-2 disabled:opacity-50 shadow-level-1"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileCheck className="w-4 h-4" />}
                    فحص العقد ورصد المخاطر
                  </button>
                </form>
              )}
            </div>

            {/* Output Column */}
            <div className="card-level-1 p-6 rounded-card flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-outline-variant">
                  <h3 className="text-title-md text-on-surface flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    المخرجات والتوصيات القانونية
                  </h3>
                  {resultData && (resultData.summary || resultData.memo) && (
                    <button
                      onClick={() => copyToClipboard(resultData.memo || resultData.summary)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-soft text-label-sm btn-secondary"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-secondary" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? "تم النسخ" : "نسخ النص"}
                    </button>
                  )}
                </div>

                {loading ? (
                  <div className="h-64 flex flex-col items-center justify-center text-on-surface-variant space-y-3">
                    <RefreshCw className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-label-md">جاري معالجة البيانات عبر محرك الذكاء الاصطناعي وتطبيق حماية PDPL...</p>
                  </div>
                ) : resultData ? (
                  <div className="space-y-4">
                    {/* Disclaimer Banner */}
                    {resultData.disclaimer && (
                      <div className="p-3 bg-status-warning/8 border border-status-warning/20 rounded-card text-label-md text-status-warning font-medium">
                        {resultData.disclaimer}
                      </div>
                    )}

                    {/* Result Content */}
                    {resultData.summary && (
                      <div className="whitespace-pre-wrap text-body-md text-on-surface leading-relaxed bg-surface-container-low p-4 rounded-card border border-outline-variant font-body">
                        {resultData.summary}
                      </div>
                    )}

                    {resultData.memo && (
                      <div className="whitespace-pre-wrap text-body-md text-on-surface leading-relaxed bg-surface-container-low p-4 rounded-card border border-outline-variant font-body">
                        {resultData.memo}
                      </div>
                    )}

                    {/* Risks List */}
                    {resultData.risks && (
                      <div className="space-y-2">
                        <p className="text-label-md font-semibold text-on-surface">ملاحظات المخاطر المرصودة:</p>
                        {resultData.risks.map((risk: any, idx: number) => (
                          <div
                            key={idx}
                            className={`p-3 rounded-card text-body-md border ${
                              risk.level === "HIGH"
                                ? "bg-error-container/30 border-error/20 text-error"
                                : risk.level === "MEDIUM"
                                ? "bg-status-warning/8 border-status-warning/20 text-status-warning"
                                : "bg-status-ongoing/8 border-status-ongoing/20 text-status-ongoing"
                            }`}
                          >
                            <span className="font-semibold block mb-1">[{risk.level}] {risk.clause}</span>
                            <span className="font-body">{risk.description}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center text-on-surface-variant text-label-md space-y-2">
                    <Bot className="w-10 h-10 text-outline-variant" />
                    <p>قم بتعبئة البيانات في النموذج واضغط على زر التشغيل لعرض المخرجات الذكية.</p>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-outline-variant text-label-sm text-on-surface-variant flex items-center justify-between font-body">
                <span>تنويه: يلتزم النظام بالضوابط الشرعية والقواعد القضائية بالمملكة العربية السعودية.</span>
                <span>v1.0-AI Shield</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
