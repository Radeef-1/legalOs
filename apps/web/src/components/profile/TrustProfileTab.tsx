import React from "react";
import { Share2, ExternalLink, ShieldCheck, Building2, Scale, MapPin, Phone, Mail, Award } from "lucide-react";

export function TrustProfileTab() {
  const shareUrl = "https://legalos.sa/firm/alotaibi-law";

  return (
    <div className="space-y-6">
      {/* Share Bar Header */}
      <div className="p-4 rounded-card bg-surface-container-low border border-outline-variant flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-title-md font-bold text-primary flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-secondary" />
            <span>بطاقة الثقة المعتمدة للمكتب (Verified Trust Profile)</span>
          </h3>
          <p className="text-body-md text-on-surface-variant text-xs mt-0.5">
            صفحة عامة موثقة تتيح للموكلين والجهات الحكومية التحقق من تراخيص وعناوين المكتب رسمياً.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="bg-surface-container-lowest border border-outline-variant px-3 py-1.5 rounded-soft text-label-sm font-tabular text-primary"
            dir="ltr"
          />
          <button
            onClick={() => navigator.clipboard.writeText(shareUrl)}
            className="btn-primary text-xs flex items-center gap-1.5"
          >
            <Share2 className="w-4 h-4" />
            نسخ الرابط
          </button>
        </div>
      </div>

      {/* Public Trust Profile Card Preview */}
      <div className="gestalt-region max-w-3xl mx-auto space-y-6 border-2 border-secondary/30 shadow-level-2">
        <div className="flex items-start justify-between flex-wrap gap-4 border-b border-outline-variant pb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-card bg-primary text-on-primary flex items-center justify-center text-title-lg font-bold shadow-md shrink-0">
              <Building2 className="w-8 h-8 text-secondary" />
            </div>
            <div>
              <h2 className="text-title-lg font-bold text-primary">
                مكتب العتيبي للمحاماة والاستشارات القانونية والشرعية
              </h2>
              <div className="flex items-center gap-2 mt-1 text-label-sm text-on-surface-variant">
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" />
                  مكتب محاماة موثق ومعتمد 🟢
                </span>
                <span>•</span>
                <span>الرياض، المملكة العربية السعودية</span>
              </div>
            </div>
          </div>
          <span className="bg-secondary/10 text-secondary border border-secondary/20 text-label-sm px-3 py-1 rounded-pill font-bold">
            رخصة وزارة العدل: SA-LAW-2026-9900
          </span>
        </div>

        {/* Credentials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-body-md text-on-surface">
          <div className="p-3 rounded-card bg-surface-container-low space-y-1">
            <div className="text-label-sm text-on-surface-variant font-bold">السجل التجاري الرسمية</div>
            <div className="font-semibold text-primary font-tabular">1010998877 (صادر من الرياض)</div>
          </div>

          <div className="p-3 rounded-card bg-surface-container-low space-y-1">
            <div className="text-label-sm text-on-surface-variant font-bold">الرقم الموحد والحساب الضريبي</div>
            <div className="font-semibold text-primary font-tabular">7009988776 | ZATCA 300998877600003</div>
          </div>

          <div className="p-3 rounded-card bg-surface-container-low space-y-1">
            <div className="text-label-sm text-on-surface-variant font-bold">مجالات الممارسة الرئيسية</div>
            <div className="font-semibold text-primary">القضايا التجارية، العقود والشركات، التحكيم، والتنفيذ القضائي</div>
          </div>

          <div className="p-3 rounded-card bg-surface-container-low space-y-1">
            <div className="text-label-sm text-on-surface-variant font-bold">العنوان الوطني المعتمد</div>
            <div className="font-semibold text-primary">7821 طريق الملك فهد - حي العليا - الرياض</div>
          </div>
        </div>
      </div>
    </div>
  );
}
