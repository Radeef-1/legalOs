import React, { useState } from "react";
import { Upload, FileCheck, CheckCircle2, ShieldCheck, Download, Trash2, Eye } from "lucide-react";

export function LegalDocumentsVaultTab() {
  const [stampPreview, setStampPreview] = useState<string | null>(null);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const mockDocuments = [
    { id: "doc-1", name: "السجل التجاري المعتمد (CR.pdf)", type: "سجل تجاري", date: "2026-01-15", size: "2.4 MB", status: "معتمد 🟢" },
    { id: "doc-2", name: "ترخيص رخصة المحاماة (MOJ_License.pdf)", type: "رخصة وزارة العدل", date: "2026-02-10", size: "1.8 MB", status: "معتمد 🟢" },
    { id: "doc-3", name: "شهادة التسجيل الضريبي (VAT_Certificate.pdf)", type: "ZATCA الضريبة", date: "2026-03-01", size: "1.1 MB", status: "معتمد 🟢" },
    { id: "doc-4", name: "خطاب الآيبان البنكي المعتمد (IBAN_Letter.pdf)", type: "آيبان بنكي", date: "2026-04-12", size: "950 KB", status: "معتمد 🟢" },
  ];

  const handleFileUpload = (type: string) => {
    setStatusMsg(`تم رفع ملف ${type} وتشفيره بختم الأمان الأوتوماتيكي 🟢`);
    setTimeout(() => setStatusMsg(null), 3000);
  };

  return (
    <div className="space-y-6">
      {statusMsg && (
        <div className="p-3 rounded-card bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 text-label-md font-bold">
          {statusMsg}
        </div>
      )}

      {/* 01. Official Stamp & Digital Signature Management */}
      <div className="gestalt-region space-y-4">
        <h3 className="text-title-md font-bold text-primary flex items-center gap-2 border-b border-outline-variant pb-2">
          <ShieldCheck className="w-5 h-5 text-secondary" />
          <span>إدارة الختم الرسمي والتوقيع الرقمي للمكتب</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Official Stamp Box */}
          <div className="border-2 border-dashed border-outline-variant p-6 rounded-card text-center bg-surface-container-low hover:bg-surface-container transition flex flex-col items-center justify-center min-h-[200px]">
            <div className="w-12 h-12 rounded-card bg-primary/10 text-primary flex items-center justify-center mb-3">
              <FileCheck className="w-6 h-6" />
            </div>
            <h4 className="text-label-md font-bold text-primary">الختم الرسمي المعتمد للمكتب</h4>
            <p className="text-label-sm text-on-surface-variant my-2 max-w-xs">
              يُستخدم في توشيح العقود، المذكرات، والفواتير الصادرة أوتوماتيكياً (PNG شفافة).
            </p>
            <button
              onClick={() => handleFileUpload("الختم الرسمي")}
              className="btn-secondary text-xs flex items-center gap-2 mt-2"
            >
              <Upload className="w-4 h-4" />
              رفع الختم الرسمي
            </button>
          </div>

          {/* Senior Partner Digital Signature Box */}
          <div className="border-2 border-dashed border-outline-variant p-6 rounded-card text-center bg-surface-container-low hover:bg-surface-container transition flex flex-col items-center justify-center min-h-[200px]">
            <div className="w-12 h-12 rounded-card bg-secondary/10 text-secondary flex items-center justify-center mb-3">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="text-label-md font-bold text-primary">التوقيع الرقمي المعتمد للشريك</h4>
            <p className="text-label-sm text-on-surface-variant my-2 max-w-xs">
              توقيع المحامي المسؤول المعتمد للربط بالأختام التقنية والعقود الإلكترونية.
            </p>
            <button
              onClick={() => handleFileUpload("التوقيع الرقمي")}
              className="btn-secondary text-xs flex items-center gap-2 mt-2"
            >
              <Upload className="w-4 h-4" />
              رفع التوقيع الرقمي
            </button>
          </div>
        </div>
      </div>

      {/* 02. Legal Registration Documents Table */}
      <div className="gestalt-region space-y-4">
        <div className="flex items-center justify-between border-b border-outline-variant pb-2 flex-wrap gap-2">
          <h3 className="text-title-md font-bold text-primary flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-primary" />
            <span>خزانة الوثائق والمستندات الرسمية</span>
          </h3>
          <button
            onClick={() => handleFileUpload("مستند رسمي جديد")}
            className="btn-primary text-xs flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            إضافة مستند جديد
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-body-md border-collapse">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container-low text-label-sm text-primary font-bold">
                <th className="p-3">اسم الوثيقة</th>
                <th className="p-3">نوع الوثيقة</th>
                <th className="p-3">تاريخ الرفع</th>
                <th className="p-3">الحجم</th>
                <th className="p-3">الحالة</th>
                <th className="p-3 text-left">الإجراء</th>
              </tr>
            </thead>
            <tbody>
              {mockDocuments.map((doc) => (
                <tr key={doc.id} className="border-b border-outline-variant/60 hover:bg-surface-container-low/50 transition">
                  <td className="p-3 font-semibold text-primary">{doc.name}</td>
                  <td className="p-3 text-on-surface-variant text-label-sm">{doc.type}</td>
                  <td className="p-3 font-tabular text-on-surface-variant text-label-sm">{doc.date}</td>
                  <td className="p-3 font-tabular text-on-surface-variant text-label-sm">{doc.size}</td>
                  <td className="p-3 font-bold text-emerald-700 text-label-sm">{doc.status}</td>
                  <td className="p-3 text-left space-x-2 space-x-reverse">
                    <button className="p-1 text-primary hover:bg-primary/10 rounded-soft" title="معاينة">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-secondary hover:bg-secondary/10 rounded-soft" title="تحميل">
                      <Download className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
