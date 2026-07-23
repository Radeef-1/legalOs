import React, { useState } from "react";
import { UploadCloud, FileSpreadsheet, CheckCircle2, X, AlertTriangle } from "lucide-react";

interface BulkInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (count: number) => void;
}

export function BulkInviteModal({ isOpen, onClose, onSuccess }: BulkInviteModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  if (!isOpen) return null;

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      onSuccess(5); // Simulate 5 bulk invited users
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-card p-6 max-w-lg w-full space-y-4 shadow-level-2" dir="rtl">
        <div className="flex items-center justify-between border-b border-outline-variant pb-3">
          <h3 className="text-title-md font-bold text-primary flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-secondary" />
            <span>استيراد والدعوة الجماعية (Bulk Excel/CSV Import)</span>
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-surface-container-low rounded-soft text-on-surface-variant">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleUpload} className="space-y-4">
          <div className="border-2 border-dashed border-outline-variant p-6 rounded-card text-center bg-surface-container-low hover:bg-surface-container transition flex flex-col items-center justify-center">
            <UploadCloud className="w-10 h-10 text-primary mb-2 opacity-75" />
            <h4 className="text-label-md font-bold text-primary">اسحب ملف Excel أو CSV الخاص بأعضاء الفريق هنا</h4>
            <p className="text-label-sm text-on-surface-variant my-1">
              يجب أن يحتوي الملف على الأعمدة التالية: <span className="font-tabular font-bold">FullName, Email, Phone, Role</span>
            </p>
            <input
              type="file"
              accept=".csv, .xlsx, .xls"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
              id="bulk-file-input"
            />
            <label htmlFor="bulk-file-input" className="btn-secondary text-xs mt-3 cursor-pointer">
              {file ? file.name : "اختر ملف الاكسل من جهازك"}
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary text-xs">إلغاء</button>
            <button type="submit" disabled={uploading} className="btn-primary text-xs">
              {uploading ? "جاري معالجة الملف وإرسال الدعوات..." : "بدء الاستيراد والدعوة الجماعية"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
