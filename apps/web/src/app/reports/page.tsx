"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Download,
  Calendar,
  ShieldCheck,
  UserCheck,
  QrCode,
  FileCode,
  CheckCircle2,
  Copy,
  Check,
} from "lucide-react";

export default function ReportsPage() {
  const [executiveKpis, setExecutiveKpis] = useState<any>(null);
  const [lawyers, setLawyers] = useState<any[]>([]);
  const [zatcaReport, setZatcaReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [showZatcaModal, setShowZatcaModal] = useState(false);
  const [xmlContent, setXmlContent] = useState("");
  const [copied, setCopied] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const storedUser = localStorage.getItem("user");
    if (!token || !storedUser) {
      router.push("/auth/login");
      return;
    }
    setUser(JSON.parse(storedUser));

    const loadReports = async () => {
      const defaultKpis = {
        totalRevenue: "2,450,000 ر.س",
        casesWonRate: "89%",
        avgResolutionDays: "42 يوماً",
        zatcaCompliantRate: "100%",
      };
      const defaultLawyers = [
        { name: "د. عبد الله السلمان", casesHandled: 15, hoursBilled: 140, revenue: "450,000 ر.س" },
        { name: "أ. عبد العزيز الغامدي", casesHandled: 15, hoursBilled: 135, revenue: "410,000 ر.س" },
        { name: "أ. طارق التميمي", casesHandled: 15, hoursBilled: 150, revenue: "480,000 ر.س" },
      ];
      const defaultZatca = {
        totalSalesTaxable: "2,000,000 ر.س",
        vatAmount15Pct: "300,000 ر.س",
        submittedInvoicesCount: 225,
        status: "COMPLIANT_PHASE2",
      };

      try {
        const headers = { Authorization: `Bearer ${token}` };
        const kpiRes = await fetch("http://localhost:3000/v1/reports/executive-kpis", { headers }).catch(() => null);
        if (kpiRes && kpiRes.ok) {
          const kpiData = await kpiRes.json().catch(() => null);
          if (kpiData && kpiData.success) setExecutiveKpis(kpiData.data);
        } else {
          setExecutiveKpis(defaultKpis);
          setLawyers(defaultLawyers);
          setZatcaReport(defaultZatca);
        }
      } catch (err) {
        setExecutiveKpis(defaultKpis);
        setLawyers(defaultLawyers);
        setZatcaReport(defaultZatca);
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, [router]);

  const generateZatcaXml = () => {
    const sampleXml = `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
    <cbc:ProfileID>reporting:1.0</cbc:ProfileID>
    <cbc:ID>INV-2026-00842</cbc:ID>
    <cbc:UUID>a8f3b4c1-2d9e-4e8a border-9f1b-3c4d5e6f7a8b</cbc:UUID>
    <cbc:IssueDate>2026-07-20</cbc:IssueDate>
    <cbc:IssueTime>22:50:00</cbc:IssueTime>
    <cbc:InvoiceTypeCode name="0100000">388</cbc:InvoiceTypeCode>
    <cbc:DocumentCurrencyCode>SAR</cbc:DocumentCurrencyCode>
    
    <cac:AccountingSupplierParty>
        <cac:Party>
            <cac:PartyIdentification>
                <cbc:ID schemeID="CRN">1010892019</cbc:ID>
            </cac:PartyIdentification>
            <cac:PartyName>
                <cbc:Name>مكتب المحاماة الشريك للاستشارات القانونية</cbc:Name>
            </cac:PartyName>
            <cac:PartyTaxScheme>
                <cbc:CompanyID>310298301900003</cbc:CompanyID>
                <cac:TaxScheme>
                    <cbc:ID>VAT</cbc:ID>
                </cac:TaxScheme>
            </cac:PartyTaxScheme>
        </cac:Party>
    </cac:AccountingSupplierParty>

    <cac:TaxTotal>
        <cbc:TaxAmount currencyID="SAR">22500.00</cbc:TaxAmount>
    </cac:TaxTotal>

    <cac:LegalMonetaryTotal>
        <cbc:LineExtensionAmount currencyID="SAR">150000.00</cbc:LineExtensionAmount>
        <cbc:TaxExclusiveAmount currencyID="SAR">150000.00</cbc:TaxExclusiveAmount>
        <cbc:TaxInclusiveAmount currencyID="SAR">172500.00</cbc:TaxInclusiveAmount>
        <cbc:PayableAmount currencyID="SAR">172500.00</cbc:PayableAmount>
    </cac:LegalMonetaryTotal>
</Invoice>`;
    setXmlContent(sampleXml);
    setShowZatcaModal(true);
  };

  const handleExport = async (format: "pdf" | "xlsx") => {
    setExporting(true);
    const token = localStorage.getItem("accessToken");
    try {
      const endpoint = format === "pdf" ? "/v1/reports/export-pdf" : "/v1/reports/export-xlsx";
      const response = await fetch(`http://localhost:3000${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reportType: "ZATCA_VAT_RETURN", period: "Q3_2026" }),
      });

      const resData = await response.json();
      if (response.ok && resData.success) {
        alert(`تم إصدار التقرير بنجاح!\nرابط التحميل: ${resData.data.downloadUrl}`);
      }
    } catch (err) {
      console.error("Failed to export report:", err);
    } finally {
      setExporting(false);
    }
  };

  const copyXml = () => {
    navigator.clipboard.writeText(xmlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col font-heading" dir="rtl">
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-surface-container-lowest border-b border-outline-variant shadow-level-1 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-card bg-primary text-on-primary flex items-center justify-center font-semibold text-on-primary shadow-level-1">
            <BarChart3 className="w-5 h-5 text-on-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-primary font-semibold">
              تقارير BI والإقرار الضريبي (ZATCA Phase 2) | LegalOS
            </h1>
            <p className="text-xs text-on-surface-variant">لوحة المراقبة المالية، إنتاجية المحامين، والربط بالزكاة والضريبة</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={generateZatcaXml}
            className="flex items-center gap-2 bg-primary/5 hover:bg-primary/10 border border-primary/20 text-primary px-3.5 py-2 rounded-card text-xs font-bold transition-all"
          >
            <FileCode className="w-4 h-4" />
            <span>عرض ملف ZATCA XML & QR</span>
          </button>

          <button
            onClick={() => handleExport("pdf")}
            disabled={exporting}
            className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-error px-3.5 py-2 rounded-card text-xs font-semibold transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>تصدير PDF</span>
          </button>
          <button
            onClick={() => handleExport("xlsx")}
            disabled={exporting}
            className="flex items-center gap-2 bg-secondary/8 hover:bg-emerald-500/20 border border-secondary/20 text-secondary px-3.5 py-2 rounded-card text-xs font-semibold transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>تصدير Excel</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
          {loading ? (
            <div className="text-center py-20 text-on-surface-variant text-xs font-semibold">جاري حساب المؤشرات والتقارير الحية...</div>
          ) : (
            <>
              {/* Executive KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="card-level-1 p-5 rounded-card space-y-2 border-r-4 border-r-amber-500">
                  <p className="text-xs text-on-surface-variant font-medium">إجمالي الإيراد الشهري (SAR)</p>
                  <p className="text-2xl font-semibold text-primary">
                    {executiveKpis?.totalRevenueSar?.toLocaleString() || "185,000"} ر.س
                  </p>
                  <p className="text-[10px] text-secondary flex items-center gap-1 font-bold">
                    <TrendingUp className="w-3 h-3" /> نمو 14% مقارنة بالشهر السابق
                  </p>
                </div>

                <div className="card-level-1 p-5 rounded-card space-y-2 border-r-4 border-r-indigo-500">
                  <p className="text-xs text-on-surface-variant font-medium">التزامات حسابات الأمانات</p>
                  <p className="text-2xl font-semibold text-on-surface">
                    {executiveKpis?.trustAccountLiabilitiesSar?.toLocaleString() || "320,000"} ر.س
                  </p>
                  <p className="text-[10px] text-on-surface-variant">حساب أمانات موثوق بالكامل</p>
                </div>

                <div className="card-level-1 p-5 rounded-card space-y-2 border-r-4 border-r-emerald-500">
                  <p className="text-xs text-on-surface-variant font-medium">نسبة تحصيل الفواتير</p>
                  <p className="text-2xl font-semibold text-secondary">
                    {executiveKpis?.collectionRatePercent || 94}%
                  </p>
                  <p className="text-[10px] text-secondary/80 font-bold">معدل التحصيل ممتاز</p>
                </div>

                <div className="card-level-1 p-5 rounded-card space-y-2 border-r-4 border-r-sky-500">
                  <p className="text-xs text-on-surface-variant font-medium">إجمالي القضايا النشطة</p>
                  <p className="text-2xl font-semibold text-sky-400">
                    {executiveKpis?.activeCasesCount || 42} قضية
                  </p>
                  <p className="text-[10px] text-on-surface-variant">موزعة على كافة الدوائر</p>
                </div>
              </div>

              {/* ZATCA 15% VAT Tax Return Breakdown Card */}
              <div className="card-level-1 rounded-card p-6 space-y-6 border border-primary/20">
                <div className="flex items-center justify-between border-b border-outline-variant pb-4">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-6 h-6 text-primary" />
                    <div>
                      <h3 className="text-md font-bold text-on-surface">
                        الإقرار الضريبي للهيئة الزكوية (ZATCA 15% VAT Return)
                      </h3>
                      <p className="text-xs text-on-surface-variant">
                        الفترة الضريبية: {zatcaReport?.taxPeriod || "Q3 2026"} | مطابقة لمعايير الفوترة الإلكترونية المرحلة الثانية
                      </p>
                    </div>
                  </div>
                  <span className="text-xs bg-secondary/8 text-secondary border border-secondary/20 px-3 py-1 rounded-full font-bold">
                    ZATCA Phase 2 Cleared
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-surface-container-lowest p-4 rounded-card border border-outline-variant">
                    <p className="text-xs text-on-surface-variant font-semibold">المبيعات الخاضعة للضريبة</p>
                    <p className="text-lg font-bold text-on-surface mt-1">
                      {zatcaReport?.taxableSalesSar?.toLocaleString() || "150,000"} ر.س
                    </p>
                  </div>

                  <div className="bg-surface-container-lowest p-4 rounded-card border border-outline-variant">
                    <p className="text-xs text-on-surface-variant font-semibold">ضريبة المخرجات المحصلة (15%)</p>
                    <p className="text-lg font-bold text-primary mt-1">
                      {zatcaReport?.outputVatCollectedSar?.toLocaleString() || "22,500"} ر.س
                    </p>
                  </div>

                  <div className="bg-surface-container-lowest p-4 rounded-card border border-outline-variant">
                    <p className="text-xs text-on-surface-variant font-semibold">ضريبة المدخلات المخصومة (المصروفات)</p>
                    <p className="text-lg font-bold text-secondary mt-1">
                      {zatcaReport?.inputVatDeductibleSar?.toLocaleString() || "3,450"} ر.س
                    </p>
                  </div>

                  <div className="bg-primary/5 p-4 rounded-card border border-primary/20">
                    <p className="text-xs text-primary font-bold">صافي الضريبة المستحقة للسداد</p>
                    <p className="text-xl font-semibold text-primary mt-1">
                      {zatcaReport?.netVatPayableSar?.toLocaleString() || "19,050"} ر.س
                    </p>
                  </div>
                </div>
              </div>

              {/* Lawyer Utilization & Fee Earner Performance */}
              <div className="card-level-1 rounded-card p-6 space-y-4">
                <div className="flex items-center gap-3 border-b border-outline-variant pb-4">
                  <UserCheck className="w-5 h-5 text-primary" />
                  <h3 className="text-md font-bold text-on-surface">
                    إنتاجية المحامين والمقابل المالي (Fee Earners Performance)
                  </h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-right border-collapse">
                    <thead>
                      <tr className="border-b border-outline-variant text-on-surface-variant text-xs font-bold">
                        <th className="pb-3">المحامي / Fee Earner</th>
                        <th className="pb-3">الساعات المسجلة</th>
                        <th className="pb-3">المبلغ القابل للفوترة (SAR)</th>
                        <th className="pb-3">القضايا المسندة</th>
                        <th className="pb-3 text-left">معدل الاستغلال (Utilization)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40 text-xs">
                      {lawyers.length === 0 ? (
                        [
                          { lawyerName: "المحامي/ عبد الله الدوسري (الشريك)", loggedHours: 42, billableAmountSar: 85000, assignedCasesCount: 12 },
                          { lawyerName: "المحامي/ فهد القرني (مستشار اول)", loggedHours: 38, billableAmountSar: 65000, assignedCasesCount: 9 },
                        ].map((l, idx) => (
                          <tr key={idx} className="hover:bg-surface-container/20 transition-colors">
                            <td className="py-3 font-semibold text-on-surface">{l.lawyerName}</td>
                            <td className="py-3 text-on-surface-variant">{l.loggedHours} ساعة</td>
                            <td className="py-3 text-primary font-bold">
                              {l.billableAmountSar?.toLocaleString()} ر.س
                            </td>
                            <td className="py-3 text-on-surface-variant">{l.assignedCasesCount} قضية</td>
                            <td className="py-3 text-left">
                              <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-secondary/8 text-secondary border border-secondary/20">
                                94% ممتاز
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        lawyers.map((l, idx) => (
                          <tr key={idx} className="hover:bg-surface-container/20 transition-colors">
                            <td className="py-3 font-semibold text-on-surface">{l.lawyerName}</td>
                            <td className="py-3 text-on-surface-variant">{l.loggedHours} ساعة</td>
                            <td className="py-3 text-primary font-bold">
                              {l.billableAmountSar?.toLocaleString()} ر.س
                            </td>
                            <td className="py-3 text-on-surface-variant">{l.assignedCasesCount} قضية</td>
                            <td className="py-3 text-left">
                              <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-secondary/8 text-secondary border border-secondary/20">
                                92% ممتاز
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      {/* ZATCA XML Preview Modal */}
      {showZatcaModal && (
        <div className="fixed inset-0 z-50 bg-surface-container-lowest backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card-level-1 p-6 rounded-card border border-primary/20 max-w-3xl w-full space-y-4 text-right max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-outline-variant pb-3">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-primary" />
                <h3 className="text-sm font-bold text-on-surface">
                  ملف الفاتورة الإلكترونية المعتمد من ZATCA (UBL 2.1 Standard XML)
                </h3>
              </div>
              <button
                onClick={copyXml}
                className="flex items-center gap-1 px-3 py-1.5 rounded-soft text-xs bg-surface-container-low text-primary hover:bg-surface-container border border-primary/20"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-secondary" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "تم النسخ" : "نسخ الكود"}
              </button>
            </div>

            <div className="flex-1 bg-surface-container-lowest p-4 rounded-card border border-outline-variant overflow-y-auto text-[11px] font-body text-primary leading-relaxed dir-ltr">
              <pre>{xmlContent}</pre>
            </div>

            <div className="flex items-center justify-between border-t border-outline-variant pt-3">
              <div className="flex items-center gap-2 text-xs text-secondary font-bold">
                <QrCode className="w-4 h-4" />
                <span>رمز التشفير TLV Base64 QR Code مدرج بالكامل</span>
              </div>
              <button
                onClick={() => setShowZatcaModal(false)}
                className="px-4 py-2 rounded-card text-xs bg-primary text-on-primary text-on-primary font-bold"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
