"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import {
  FileText,
  Bot,
  UploadCloud,
  ShieldCheck,
  Sparkles,
  Send,
  File,
  Eye,
  Download,
  Plus,
  Edit3,
  CheckCircle2,
  Filter,
  Search,
  BookOpen,
  Copy,
  Check,
  Scale,
  RefreshCw,
} from "lucide-react";

export default function DocumentsPage() {
  const router = useRouter();

  // Documents State
  const [documents, setDocuments] = useState<any[]>([
    {
      id: "doc-1",
      fileName: "صك الحكم الابتدائي - القضية التجارية 44901.pdf",
      fileType: "PDF",
      category: "الأحكام",
      ocrStatus: "تم الاستخراج بالذكاء",
      createdAt: "2026-07-20",
      ocrText: "حكمت المحكمة التجارية بإلزام المدعى عليه بدفع مبلغ 1,450,000 ر.س مع المصاريف القضائية.",
    },
    {
      id: "doc-2",
      fileName: "المذكرة الجوابية الشارحة - عقود المقاولات.docx",
      fileType: "DOCX",
      category: "المذكرات",
      ocrStatus: "تم الاستخراج بالذكاء",
      createdAt: "2026-07-18",
      ocrText: "الدفع بعدم اختصاص المحكمة ولائحة الدفوع الشكلية والموضوعية المرفقة.",
    },
    {
      id: "doc-3",
      fileName: "عقد أتعاب محاماة وتوكيل إلكتروني.pdf",
      fileType: "PDF",
      category: "العقود",
      ocrStatus: "موقع وموثق",
      createdAt: "2026-07-15",
      ocrText: "اتفاقية أتعاب محاماة بنسبة 10% من المبالغ المحصلة مسجلة بنظام RLS.",
    },
    {
      id: "doc-4",
      fileName: "صورة الوكالة الشرعية الرسمية - ناجز.pdf",
      fileType: "PDF",
      category: "التوكيلات",
      ocrStatus: "سارية المفعول",
      createdAt: "2026-07-10",
      ocrText: "رقم الوكالة 449810293 الصادرة من وزارة العدل وتوثيق الترافع المباشر.",
    },
  ]);

  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Saudi Legal Templates Modal State
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("commercial_memo");
  const [generatedDraft, setGeneratedDraft] = useState("");
  const [draftingLoading, setDraftingLoading] = useState(false);
  const [copiedDraft, setCopiedDraft] = useState(false);

  // File Upload State
  const [uploading, setUploading] = useState(false);

  // AI Chat Assistant
  const [chatMessages, setChatMessages] = useState<any[]>([
    {
      role: "assistant",
      content: "أهلاً بك! أنا محرك التحليل القانوني الذكي لـ LegalOS. يمكنك سؤالي عن صياغة المذكرات، استخراج الدفوع من المستندات، أو توليد لائحة استئناف معتمدة.",
    },
  ]);
  const [prompt, setPrompt] = useState("");

  const filteredDocs = documents.filter((doc) => {
    const matchesCategory = activeCategory === "all" || doc.category === activeCategory;
    const matchesSearch = doc.fileName.includes(searchQuery) || doc.category.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  const handleGenerateTemplate = () => {
    setDraftingLoading(true);
    setTimeout(() => {
      let draftText = "";
      if (selectedTemplate === "commercial_memo") {
        draftText = `بسم الله الرحمن الرحيم

أصحاب الفضيلة رئيس وأعضاء الدائرة التجارية الأولى بمحكمة الاستئناف بالرياض - حفظهم الله

السلام عليكم ورحمة الله وبركاته،،،

الموضوع: لائحة مسببة ومذكرة جوابية في الدعوى رقم (44901928)

أولاً: الدفوع الشكلية (الدفع بعدم قبول الدعوى لعدم سبق الإخطار الكتابي وفق المادة 19 من نظام المحاكم التجارية).
ثانياً: الدفوع الموضوعية (استيفاء الأعمال والتوريدات بموجب محاضر الاستلام المرفقة وخلو الذمة من الأرقام المطالب بها).

الطلبات:
1. رد دعوى المدعي وإلزامهم بالمصاريف القضائية والأتعاب.
2. تقييد الحكم النهائي وتسليمه إلكترونياً عبر ناجز.

مقدمه: وكيل المدعى عليه / د. عبد الله السلمان - محامي ممارس ترخيص (SA-LAW-8800)`;
      } else if (selectedTemplate === "labor_appeal") {
        draftText = `بسم الله الرحمن الرحيم
لائحة اعتراض واستئناف على صك الحكم العمالي الصادر من المحكمة العمالية بجدة
الوقائع: المطالبة بمكافأة نهاية الخدمة وفق المادة 84 و 85 من نظام العمل السعودي.
الدفوع: عدم احتساب البدلات الثابتة ضمن الأجر الفعلي للموظف المستقيل.
الطلبات: تعديل صك الحكم وإلزام الشركة بصرف المبلغ المتبقي قدره 85,000 ر.س.`;
      } else {
        draftText = `عقد اتفاقية أتعاب محاماة واستشارات قانونية
المحامي: مكتب السلمان للمحاماة (ترخيص SA-LAW-8800)
الموكل: شركة التنمية والتطوير المحدودة
البند الأول: يتولى المكتب الترافع في القضية التجارية رقم CAS-2026-00226.
البند الثاني: الأتعاب المتفق عليها 145,000 ر.س تدفع على دفعتين مقترنة بإنجاز الجلسات.`;
      }

      setGeneratedDraft(draftText);
      setDraftingLoading(false);
    }, 1200);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setUploading(true);

    setTimeout(() => {
      const newDoc = {
        id: `doc-${Date.now()}`,
        fileName: file.name,
        fileType: file.name.endsWith(".pdf") ? "PDF" : "DOCX",
        category: "المرفقات الحية",
        ocrStatus: "تم الاستخراج بالذكاء",
        createdAt: new Date().toISOString().split("T")[0],
        ocrText: "تم فحص المستند واستخراج النصوص وتطابق الشروط مع نظام المعاملات المدنية.",
      };
      setDocuments([newDoc, ...documents]);
      setUploading(false);
    }, 1500);
  };

  const handleSendPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    const userText = prompt.trim();
    setChatMessages((prev) => [...prev, { role: "user", content: userText }]);
    setPrompt("");

    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `بناءً على نظام المعاملات المدنية ونظام المحاكم التجارية السعودي: يُنصح بتضمين الدفع بعدم قبول الدعوى أو انقضاء الالتزام مع إرفاق السند الكتابي قبل 3 أيام من موعد الجلسة المقررة.`,
        },
      ]);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col md:flex-row font-heading" dir="rtl">
      <Sidebar />

      <main className="flex-1 p-6 md:p-8 space-y-6 max-w-[1600px] w-full mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-outline-variant pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-card bg-primary text-on-primary flex items-center justify-center font-semibold shadow-level-1">
              <FileText className="w-6 h-6 text-on-primary" />
            </div>
            <div>
              <h1 className="text-title-md text-primary font-bold flex items-center gap-2">
                مركز المستندات والتحليل الذكي (Document Center & AI OCR)
                <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded-pill font-body font-bold">
                  محرك صياغة المذكرات
                </span>
              </h1>
              <p className="text-label-sm text-on-surface-variant font-body">
                أرشيف المستندات القانونية، الفحص الآلي بالذكاء، وتوليد اللوائح وفق الأنظمة السعودية.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setTemplateModalOpen(true);
                handleGenerateTemplate();
              }}
              className="btn-secondary text-label-sm py-2 px-4 flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-secondary" />
              <span>مولّد المذكرات والقوالب النظامية</span>
            </button>

            <label className="btn-primary text-label-sm py-2 px-4 flex items-center gap-1.5 cursor-pointer shadow-level-1">
              <UploadCloud className="w-4 h-4" />
              <span>{uploading ? "جاري الرفع والفحص..." : "رفع مستند جديد (PDF/DOCX)"}</span>
              <input type="file" onChange={handleFileUpload} className="hidden" accept=".pdf,.docx,.doc" />
            </label>
          </div>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="card-level-1 p-4 rounded-card border border-outline-variant flex flex-wrap items-center justify-between gap-4 shadow-level-1">
          <div className="flex items-center gap-2 border border-outline-variant bg-surface-container-lowest px-3 py-1.5 rounded-soft text-body-md min-w-[280px]">
            <Search className="w-4 h-4 text-primary shrink-0" />
            <input
              type="text"
              placeholder="ابحث في أصل المستندات والمذكرات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-on-surface focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto">
            {[
              { id: "all", label: "جميع المستندات" },
              { id: "الأحكام", label: "صكوك الأحكام" },
              { id: "المذكرات", label: "المذكرات القضائية" },
              { id: "العقود", label: "العقود والاتفاقيات" },
              { id: "التوكيلات", label: "التوكيلات والوكالات" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-pill text-label-sm font-semibold transition ${
                  activeCategory === cat.id
                    ? "bg-primary text-on-primary shadow-level-1"
                    : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Layout (Docs Grid + AI Assistant Sidebar) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Documents Grid */}
          <div className="lg:col-span-2 space-y-4">
            {filteredDocs.map((doc) => (
              <div
                key={doc.id}
                className="card-level-1 p-5 rounded-card border border-outline-variant hover:border-primary/40 transition-all space-y-3 shadow-level-1"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-card bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 border border-primary/20">
                      {doc.fileType}
                    </div>
                    <div>
                      <h3 className="text-body-md font-bold text-on-surface">{doc.fileName}</h3>
                      <p className="text-label-sm text-on-surface-variant font-body">
                        التصنيف: <span className="font-semibold text-primary">{doc.category}</span> | التاريخ: {doc.createdAt}
                      </p>
                    </div>
                  </div>

                  <span className="badge-success text-label-sm font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {doc.ocrStatus}
                  </span>
                </div>

                {doc.ocrText && (
                  <div className="p-3 bg-surface-container-low border border-outline-variant rounded-soft text-label-sm text-on-surface-variant font-body">
                    <span className="font-bold text-primary block pb-0.5">النص المستخرج عبر AI OCR:</span>
                    {doc.ocrText}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-outline-variant/60">
                  <span className="text-[11px] text-on-surface-variant font-body flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    ختم المكتب والتوقيع الرقمي معتمد
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => alert(`معاينة المستند الرسمي: ${doc.fileName}`)}
                      className="btn-secondary text-label-sm py-1 px-3 flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      معاينة
                    </button>

                    <button
                      onClick={() => alert(`جاري تنزيل النسخة المعتمدة من ${doc.fileName}...`)}
                      className="btn-primary text-label-sm py-1 px-3.5 flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      تنزيل PDF
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* AI Legal Assistant Panel */}
          <div className="card-level-1 p-5 rounded-card border border-primary/20 space-y-4 flex flex-col h-[520px] shadow-level-1">
            <div className="flex items-center justify-between border-b border-outline-variant pb-3">
              <h3 className="text-title-md font-bold text-primary flex items-center gap-2">
                <Bot className="w-5 h-5 text-primary" />
                المساعد القانوني الذكي (AI Legal Advisor)
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-surface-container-low rounded-card border border-outline-variant">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-card text-label-sm font-body ${
                    msg.role === "user"
                      ? "bg-primary text-on-primary mr-auto max-w-[85%]"
                      : "bg-surface-container-lowest text-on-surface border border-outline-variant max-w-[90%]"
                  }`}
                >
                  {msg.content}
                </div>
              ))}
            </div>

            <form onSubmit={handleSendPrompt} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="اسأل AI في الدفوع أو مراجعة النصوص..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="flex-1 bg-surface-container-lowest border border-outline-variant px-3 py-2 rounded-soft text-label-sm text-on-surface focus:outline-none"
              />
              <button type="submit" className="btn-primary p-2 rounded-soft shadow-level-1">
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Saudi Legal Memo Generator Modal */}
      {templateModalOpen && (
        <div className="fixed inset-0 z-50 bg-on-surface/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card-level-2 max-w-2xl w-full p-6 rounded-card space-y-4 text-right font-heading">
            <div className="flex items-center justify-between border-b border-outline-variant pb-2">
              <h3 className="text-title-md font-bold text-primary flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-secondary" />
                مولّد المذكرات واللوائح القانونية بالذكاء الاصطناعي
              </h3>
              <button onClick={() => setTemplateModalOpen(false)} className="text-on-surface-variant">
                ✕
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "commercial_memo", label: "مذكرة تجارية شارحة" },
                { id: "labor_appeal", label: "لائحة اعتراض عمالية" },
                { id: "fee_contract", label: "عقد أتعاب محاماة" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setSelectedTemplate(t.id);
                    handleGenerateTemplate();
                  }}
                  className={`p-2.5 rounded-soft text-label-sm font-bold border transition ${
                    selectedTemplate === t.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-outline-variant text-on-surface-variant"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="relative bg-surface-container-lowest border border-outline-variant rounded-card p-4 min-h-[220px]">
              {draftingLoading ? (
                <div className="flex items-center justify-center h-48 text-body-md text-primary font-bold gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>جاري صياغة المسودة وفق الأنظمة السعودية...</span>
                </div>
              ) : (
                <textarea
                  rows={10}
                  value={generatedDraft}
                  onChange={(e) => setGeneratedDraft(e.target.value)}
                  className="w-full bg-transparent text-body-md text-on-surface font-body leading-relaxed focus:outline-none"
                ></textarea>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatedDraft);
                  setCopiedDraft(true);
                  setTimeout(() => setCopiedDraft(false), 1500);
                }}
                className="btn-secondary text-label-sm py-2 px-4 flex items-center gap-1.5"
              >
                {copiedDraft ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedDraft ? "تم نسخ النص!" : "نسخ المسودة"}</span>
              </button>

              <button
                onClick={() => {
                  alert("تم حفظ المذكرة وإضافتها لقائمة مستندات القضية المعتمدة بنجاح!");
                  setTemplateModalOpen(false);
                }}
                className="btn-primary text-label-sm py-2 px-5 shadow-level-1"
              >
                اعتماد المذكرة وحفظها بالمستندات
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
