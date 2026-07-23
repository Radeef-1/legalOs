import React, { useState } from "react";
import { Sparkles, Workflow, Key, ShieldCheck, CheckCircle2, RefreshCw, Cpu, Server } from "lucide-react";

export function IntegrationsAiTab() {
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const [aiSettings, setAiSettings] = useState({
    defaultModel: "SAUDI_LOCAL_LLM",
    piiFilter: true,
    promptTemplate: "أنت مستشار قانوني سعودي ممارس خبير في الأنظمة السعودية ولوائح وزارة العدل 2026...",
    apiKeyStatus: "مفتاح نشط ومحمي بـ KMS 🟢",
  });

  const integrations = [
    { name: "منصة ناجز الإلكترونية (MOJ Najiz API)", status: "مرتبط 🟢", provider: "وزارة العدل" },
    { name: "هيئة الزكاة والضريبة والجمارك (ZATCA Phase 2)", status: "مرتبط 🟢", provider: "ZATCA E-Invoicing" },
    { name: "توثيق الرسائل المباشر (Authentica OTP SA)", status: "مرتبط 🟢", provider: "Authentica.sa" },
    { name: "البريد والتنبيهات (SMTP / SendGrid Enterprise)", status: "نشط 🟢", provider: "Secure Relay" },
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg("تم حفظ إعدادات مركز الذكاء الاصطناعي والربط الحكومي بنجاح 🟢");
    setTimeout(() => setStatusMsg(null), 3000);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {statusMsg && (
        <div className="p-3 rounded-card bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 text-label-md font-bold">
          {statusMsg}
        </div>
      )}

      {/* 01. AI Center & Legal LLM Gateway */}
      <div className="gestalt-region space-y-4">
        <h3 className="text-title-md font-bold text-primary flex items-center gap-2 border-b border-outline-variant pb-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <span>مركز الذكاء الاصطناعي وتخصيص النماذج (AI Center & Legal LLM)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="gestalt-group">
            <label className="text-label-sm font-semibold text-primary">الموديل الافتراضي للاستشارات والتحليل</label>
            <select
              value={aiSettings.defaultModel}
              onChange={(e) => setAiSettings({ ...aiSettings, defaultModel: e.target.value })}
              className="w-full bg-surface-container-low border border-outline-variant px-3 py-2 rounded-soft text-body-md"
            >
              <option value="SAUDI_LOCAL_LLM">الموديل المحلي السعودي (تخزين محلي معزول بالرياض)</option>
              <option value="CLAUDE_3_5_SONNET">Claude 3.5 Sonnet (مستقر وعالي الدقة)</option>
              <option value="GPT_4O_LEGAL">GPT-4o Enterprise (معالج الوثائق الضخمة)</option>
            </select>
          </div>

          <div className="gestalt-group">
            <label className="text-label-sm font-semibold text-primary">درع تنقية الهويات وحماية البيانات (PII Shield)</label>
            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                checked={aiSettings.piiFilter}
                onChange={(e) => setAiSettings({ ...aiSettings, piiFilter: e.target.checked })}
                className="w-5 h-5 accent-secondary cursor-pointer"
              />
              <span className="text-label-sm font-bold text-emerald-800">
                تطبييب وتشفير الهوايا ورقم الهوية الوطنية أوتوماتيكياً قبل المعالجة 🟢
              </span>
            </div>
          </div>
        </div>

        <div className="gestalt-group">
          <label className="text-label-sm font-semibold text-primary">التعليمات المخصصة للمستشار (Custom System Prompt)</label>
          <textarea
            rows={3}
            value={aiSettings.promptTemplate}
            onChange={(e) => setAiSettings({ ...aiSettings, promptTemplate: e.target.value })}
            className="w-full bg-surface-container-low border border-outline-variant px-3 py-2 rounded-soft text-body-md font-body"
          />
        </div>
      </div>

      {/* 02. External Government Integrations */}
      <div className="gestalt-region space-y-4">
        <h3 className="text-title-md font-bold text-primary flex items-center gap-2 border-b border-outline-variant pb-2">
          <Workflow className="w-5 h-5 text-secondary" />
          <span>منصات الربط الحكومي والخدمات الخارجية</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {integrations.map((item, idx) => (
            <div key={idx} className="p-4 rounded-card border border-outline-variant bg-surface-container-low flex items-center justify-between">
              <div>
                <h4 className="text-label-md font-bold text-primary">{item.name}</h4>
                <p className="text-label-sm text-on-surface-variant font-body mt-0.5">المزود: {item.provider}</p>
                <span className="text-xs font-bold text-emerald-700 mt-1 inline-block">{item.status}</span>
              </div>
              <button type="button" className="btn-secondary text-xs">اختبار الربط</button>
            </div>
          ))}
        </div>
      </div>
    </form>
  );
}
