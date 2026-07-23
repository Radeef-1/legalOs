import React, { useState } from "react";
import { Globe, Clock, DollarSign, Moon, Sun, Save, Eye, Check } from "lucide-react";

export function PreferencesTab() {
  const [savedStatus, setSavedStatus] = useState<string | null>(null);
  const [prefs, setPrefs] = useState({
    language: "ar",
    timezone: "Asia/Riyadh (GMT+3)",
    calendarType: "hijri-gregorian",
    currency: "SAR (ريال سعودي)",
    dateFormat: "YYYY-MM-DD",
    theme: "light-gestalt",
    density: "comfortable",
  });

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("userPreferences");
      if (saved) {
        try {
          setPrefs(JSON.parse(saved));
        } catch (e) {}
      }
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      localStorage.setItem("userPreferences", JSON.stringify(prefs));
    }
    setSavedStatus("تم حفظ وحفظ تفضيلات المستخدم والنظام بالفعل دائمياً 🟢");
    setTimeout(() => setSavedStatus(null), 3000);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {savedStatus && (
        <div className="p-3 rounded-card bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 text-label-md font-bold">
          {savedStatus}
        </div>
      )}

      {/* 01. Localization Settings */}
      <div className="gestalt-region space-y-4">
        <h3 className="text-title-md font-bold text-primary flex items-center gap-2 border-b border-outline-variant pb-2">
          <Globe className="w-5 h-5 text-secondary" />
          <span>تفضيلات اللغة، المنطقة، والتقويم (Localization & Calendar)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="gestalt-group">
            <label className="text-label-sm font-semibold text-primary">لغة الواجهة الرئيسية</label>
            <select
              value={prefs.language}
              onChange={(e) => setPrefs({ ...prefs, language: e.target.value })}
              className="w-full bg-surface-container-low border border-outline-variant px-3 py-2 rounded-soft text-body-md"
            >
              <option value="ar">العربية (Saudi Arabic)</option>
              <option value="en">English (US)</option>
            </select>
          </div>

          <div className="gestalt-group">
            <label className="text-label-sm font-semibold text-primary">النطاق الزمني (Timezone)</label>
            <input
              type="text"
              value={prefs.timezone}
              onChange={(e) => setPrefs({ ...prefs, timezone: e.target.value })}
              className="w-full bg-surface-container-low border border-outline-variant px-3 py-2 rounded-soft text-body-md font-tabular"
            />
          </div>

          <div className="gestalt-group">
            <label className="text-label-sm font-semibold text-primary">نوع التقويم المزدوج</label>
            <select
              value={prefs.calendarType}
              onChange={(e) => setPrefs({ ...prefs, calendarType: e.target.value })}
              className="w-full bg-surface-container-low border border-outline-variant px-3 py-2 rounded-soft text-body-md"
            >
              <option value="hijri-gregorian">هجري / ميلادي (مزدوج - معيار وزارة العدل)</option>
              <option value="gregorian">ميلادي فقط</option>
              <option value="hijri">هجري أم القرى فقط</option>
            </select>
          </div>

          <div className="gestalt-group">
            <label className="text-label-sm font-semibold text-primary">العملة الافتراضية للفواتير</label>
            <input
              type="text"
              value={prefs.currency}
              onChange={(e) => setPrefs({ ...prefs, currency: e.target.value })}
              className="w-full bg-surface-container-low border border-outline-variant px-3 py-2 rounded-soft text-body-md"
            />
          </div>

          <div className="gestalt-group">
            <label className="text-label-sm font-semibold text-primary">صيغة عرض التواريخ</label>
            <input
              type="text"
              value={prefs.dateFormat}
              onChange={(e) => setPrefs({ ...prefs, dateFormat: e.target.value })}
              className="w-full bg-surface-container-low border border-outline-variant px-3 py-2 rounded-soft text-body-md font-tabular"
            />
          </div>

          <div className="gestalt-group">
            <label className="text-label-sm font-semibold text-primary">مظهر الواجهة (Theme Density)</label>
            <select
              value={prefs.density}
              onChange={(e) => setPrefs({ ...prefs, density: e.target.value })}
              className="w-full bg-surface-container-low border border-outline-variant px-3 py-2 rounded-soft text-body-md"
            >
              <option value="comfortable">مريح مع مبادئ Gestalt (موصى به)</option>
              <option value="compact">مكثف للمحاكم والقضايا الكثيرة</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button type="submit" className="btn-primary flex items-center gap-2 shadow-level-1">
          <Save className="w-4 h-4" />
          حفظ التفضيلات الشخصية
        </button>
      </div>
    </form>
  );
}
