import React, { useState } from "react";
import { Building2, Save, MapPin, Clock, Scale, FileText } from "lucide-react";

export function OrganizationInfoTab() {
  const [savedStatus, setSavedStatus] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nameAr: "مكتب العتيبي للمحاماة والاستشارات القانونية والشرعية",
    nameEn: "Al-Otaibi Law Firm & Legal Consultancies",
    shortName: "العتيبي للمحاماة",
    crNumber: "1010998877",
    crExpiry: "2027-05-15",
    licenseNumber: "SA-LAW-2026-9900",
    licenseExpiry: "2026-09-30",
    taxNumber: "300998877600003",
    unifiedNumber: "7009988776",
    nationalAddress: "7821 طريق الملك فهد - حي العليا - الرياض 12214 - المملكة العربية السعودية",
    email: "info@lawfirm.sa",
    phone: "0114904000",
    mobile: "0549040268",
    firmType: "شركة محاماة مهنية ذات مسؤولية محدودة",
    practiceAreas: ["دعاوى تجارية", "قضايا عمالية", "عقود وشركات", "تحكيم دولي", "تنفيذ قضاء"],
  });

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("organizationData");
      if (saved) {
        try {
          setFormData(JSON.parse(saved));
        } catch (e) {}
      }
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      localStorage.setItem("organizationData", JSON.stringify(formData));
      const userObj = localStorage.getItem("user");
      if (userObj) {
        try {
          const parsed = JSON.parse(userObj);
          parsed.firmName = formData.nameAr;
          localStorage.setItem("user", JSON.stringify(parsed));
        } catch (e) {}
      }
    }
    setSavedStatus("تم حفظ وحفظ بيانات المنشأة والتعديلات دائمياً 🟢");
    setTimeout(() => setSavedStatus(null), 3000);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {savedStatus && (
        <div className="p-3 rounded-card bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 text-label-md font-bold flex items-center justify-between">
          <span>{savedStatus}</span>
        </div>
      )}

      {/* 01. Basic Information */}
      <div className="gestalt-region space-y-4">
        <h3 className="text-title-md font-bold text-primary flex items-center gap-2 border-b border-outline-variant pb-2">
          <Building2 className="w-5 h-5 text-secondary" />
          <span>البيانات الأساسية للمنشأة القانونية</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="gestalt-group">
            <label className="text-label-sm font-semibold text-primary">الاسم الرسمي (بالعربية)</label>
            <input
              type="text"
              value={formData.nameAr}
              onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
              className="w-full bg-surface-container-low border border-outline-variant px-3 py-2 rounded-soft text-body-md"
            />
          </div>

          <div className="gestalt-group">
            <label className="text-label-sm font-semibold text-primary">الاسم الرسمي (بالإنجليزية)</label>
            <input
              type="text"
              value={formData.nameEn}
              onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
              className="w-full bg-surface-container-low border border-outline-variant px-3 py-2 rounded-soft text-body-md font-tabular"
              dir="ltr"
            />
          </div>

          <div className="gestalt-group">
            <label className="text-label-sm font-semibold text-primary">نوع الكيان القانوني</label>
            <input
              type="text"
              value={formData.firmType}
              onChange={(e) => setFormData({ ...formData, firmType: e.target.value })}
              className="w-full bg-surface-container-low border border-outline-variant px-3 py-2 rounded-soft text-body-md"
            />
          </div>

          <div className="gestalt-group">
            <label className="text-label-sm font-semibold text-primary">الاسم المختصر للمكتب</label>
            <input
              type="text"
              value={formData.shortName}
              onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
              className="w-full bg-surface-container-low border border-outline-variant px-3 py-2 rounded-soft text-body-md"
            />
          </div>
        </div>
      </div>

      {/* 02. Legal & Regulatory Credentials */}
      <div className="gestalt-region space-y-4">
        <h3 className="text-title-md font-bold text-primary flex items-center gap-2 border-b border-outline-variant pb-2">
          <Scale className="w-5 h-5 text-secondary" />
          <span>البيانات النظامية والتراخيص الحكومية</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="gestalt-group">
            <label className="text-label-sm font-semibold text-primary">رقم رخصة المحاماة (وزارة العدل)</label>
            <input
              type="text"
              value={formData.licenseNumber}
              onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
              className="w-full bg-surface-container-low border border-outline-variant px-3 py-2 rounded-soft text-body-md font-tabular"
            />
          </div>

          <div className="gestalt-group">
            <label className="text-label-sm font-semibold text-primary">تاريخ انتهاء الرخصة</label>
            <input
              type="date"
              value={formData.licenseExpiry}
              onChange={(e) => setFormData({ ...formData, licenseExpiry: e.target.value })}
              className="w-full bg-surface-container-low border border-outline-variant px-3 py-2 rounded-soft text-body-md font-tabular"
            />
          </div>

          <div className="gestalt-group">
            <label className="text-label-sm font-semibold text-primary">رقم السجل التجاري (CR)</label>
            <input
              type="text"
              value={formData.crNumber}
              onChange={(e) => setFormData({ ...formData, crNumber: e.target.value })}
              className="w-full bg-surface-container-low border border-outline-variant px-3 py-2 rounded-soft text-body-md font-tabular"
            />
          </div>

          <div className="gestalt-group">
            <label className="text-label-sm font-semibold text-primary">الرقم الضريبي (ZATCA VAT)</label>
            <input
              type="text"
              value={formData.taxNumber}
              onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })}
              className="w-full bg-surface-container-low border border-outline-variant px-3 py-2 rounded-soft text-body-md font-tabular"
            />
          </div>

          <div className="gestalt-group">
            <label className="text-label-sm font-semibold text-primary">الرقم الموحد (700)</label>
            <input
              type="text"
              value={formData.unifiedNumber}
              onChange={(e) => setFormData({ ...formData, unifiedNumber: e.target.value })}
              className="w-full bg-surface-container-low border border-outline-variant px-3 py-2 rounded-soft text-body-md font-tabular"
            />
          </div>

          <div className="gestalt-group">
            <label className="text-label-sm font-semibold text-primary">البريد الإلكتروني الرسمي</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-surface-container-low border border-outline-variant px-3 py-2 rounded-soft text-body-md font-tabular"
              dir="ltr"
            />
          </div>
        </div>

        <div className="gestalt-group">
          <label className="text-label-sm font-semibold text-primary">العنوان الوطني المعتمد (واصل)</label>
          <input
            type="text"
            value={formData.nationalAddress}
            onChange={(e) => setFormData({ ...formData, nationalAddress: e.target.value })}
            className="w-full bg-surface-container-low border border-outline-variant px-3 py-2 rounded-soft text-body-md"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button type="submit" className="btn-primary flex items-center gap-2 shadow-level-1">
          <Save className="w-4 h-4" />
          حفظ بيانات المنشأة
        </button>
      </div>
    </form>
  );
}
