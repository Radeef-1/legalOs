import React, { useState } from "react";
import { Sparkles, Save, Upload, Palette, Image as ImageIcon, FileText } from "lucide-react";

export function BrandingCenterTab() {
  const [savedStatus, setSavedStatus] = useState<string | null>(null);

  const [branding, setBranding] = useState({
    primaryColor: "#041627",
    secondaryColor: "#1b6d24",
    tertiaryColor: "#00162a",
    watermarkText: "مكتب العتيبي للمحاماة - وثيقة رسمية معتمدة",
    emailFooterText: "جميع الحقوق محفوظة © 2026 مكتب العتيبي للمحاماة والاستشارات القانونية.",
    smsSignature: "[العتيبي للمحاماة]",
  });

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("brandingSettings");
      if (saved) {
        try {
          setBranding(JSON.parse(saved));
        } catch (e) {}
      }
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      localStorage.setItem("brandingSettings", JSON.stringify(branding));
    }
    setSavedStatus("تم حفظ إعدادات الهوية البصرية والعلامات دائمياً 🟢");
    setTimeout(() => setSavedStatus(null), 3000);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {savedStatus && (
        <div className="p-3 rounded-card bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 text-label-md font-bold">
          {savedStatus}
        </div>
      )}

      {/* 01. Brand Colors & Logo Accent */}
      <div className="gestalt-region space-y-4">
        <h3 className="text-title-md font-bold text-primary flex items-center gap-2 border-b border-outline-variant pb-2">
          <Palette className="w-5 h-5 text-secondary" />
          <span>الألوان والهوية البصرية الرسمية</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="gestalt-group">
            <label className="text-label-sm font-semibold text-primary">اللون الرئيسي (Primary Color)</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={branding.primaryColor}
                onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                className="w-10 h-10 rounded-soft border border-outline-variant cursor-pointer"
              />
              <input
                type="text"
                value={branding.primaryColor}
                onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                className="w-full bg-surface-container-low border border-outline-variant px-3 py-2 rounded-soft text-body-md font-tabular"
              />
            </div>
          </div>

          <div className="gestalt-group">
            <label className="text-label-sm font-semibold text-primary">اللون الثانوي (Secondary Color)</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={branding.secondaryColor}
                onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                className="w-10 h-10 rounded-soft border border-outline-variant cursor-pointer"
              />
              <input
                type="text"
                value={branding.secondaryColor}
                onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                className="w-full bg-surface-container-low border border-outline-variant px-3 py-2 rounded-soft text-body-md font-tabular"
              />
            </div>
          </div>

          <div className="gestalt-group">
            <label className="text-label-sm font-semibold text-primary">اللون الثالث (Tertiary Color)</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={branding.tertiaryColor}
                onChange={(e) => setBranding({ ...branding, tertiaryColor: e.target.value })}
                className="w-10 h-10 rounded-soft border border-outline-variant cursor-pointer"
              />
              <input
                type="text"
                value={branding.tertiaryColor}
                onChange={(e) => setBranding({ ...branding, tertiaryColor: e.target.value })}
                className="w-full bg-surface-container-low border border-outline-variant px-3 py-2 rounded-soft text-body-md font-tabular"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 02. PDF & Document Branding */}
      <div className="gestalt-region space-y-4">
        <h3 className="text-title-md font-bold text-primary flex items-center gap-2 border-b border-outline-variant pb-2">
          <FileText className="w-5 h-5 text-primary" />
          <span>تخصيص مستندات الـ PDF والرسائل الرسمية</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="gestalt-group">
            <label className="text-label-sm font-semibold text-primary">نص العلامة المائية للـ PDF (Watermark)</label>
            <input
              type="text"
              value={branding.watermarkText}
              onChange={(e) => setBranding({ ...branding, watermarkText: e.target.value })}
              className="w-full bg-surface-container-low border border-outline-variant px-3 py-2 rounded-soft text-body-md"
            />
          </div>

          <div className="gestalt-group">
            <label className="text-label-sm font-semibold text-primary">توقيع الرسائل النصية القصيرة (SMS Signature)</label>
            <input
              type="text"
              value={branding.smsSignature}
              onChange={(e) => setBranding({ ...branding, smsSignature: e.target.value })}
              className="w-full bg-surface-container-low border border-outline-variant px-3 py-2 rounded-soft text-body-md"
            />
          </div>
        </div>

        <div className="gestalt-group">
          <label className="text-label-sm font-semibold text-primary">تذييل البريد الإلكتروني الرسمي (Email Footer)</label>
          <textarea
            rows={2}
            value={branding.emailFooterText}
            onChange={(e) => setBranding({ ...branding, emailFooterText: e.target.value })}
            className="w-full bg-surface-container-low border border-outline-variant px-3 py-2 rounded-soft text-body-md"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button type="submit" className="btn-primary flex items-center gap-2 shadow-level-1">
          <Save className="w-4 h-4" />
          حفظ إعدادات الهوية
        </button>
      </div>
    </form>
  );
}
