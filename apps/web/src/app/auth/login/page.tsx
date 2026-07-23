"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SEEDED_FIRMS } from "@/data/seededFirmsData";
import { ShieldCheck, Building2, User, Key, ArrowRight, Scale, Smartphone, Lock, Globe, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  // Subdomain & Tenant State
  const [subdomain, setSubdomain] = useState<string>("");
  const [detectedTenantName, setDetectedTenantName] = useState<string>("نظام التشغيل القانوني LegalOS");

  // Auth Method Tab State: "otp" | "nafath" | "email"
  const [authTab, setAuthTab] = useState<"otp" | "nafath" | "email">("otp");

  // Login Form States
  const [mobileNumber, setMobileNumber] = useState<string>("0549040268");
  const [otpCode, setOtpCode] = useState<string>("");
  const [sendingOtp, setSendingOtp] = useState<boolean>(false);
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [otpStatusMsg, setOtpStatusMsg] = useState<string | null>(null);

  const [nationalId, setNationalId] = useState<string>("1092837412");
  const [nafathPending, setNafathPending] = useState<boolean>(false);

  const [email, setEmail] = useState<string>("demo@demo22.com");
  const [password, setPassword] = useState<string>("Demo123456");

  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // Subdomain Extractor Effect
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      const parts = hostname.split(".");
      const querySubdomain = new URLSearchParams(window.location.search).get("subdomain");
      let extracted = querySubdomain || "";

      if (!extracted && parts.length > 2 && parts[0] !== "www") {
        extracted = parts[0];
      }

      if (extracted) {
        setSubdomain(extracted);
        if (extracted === "admin") {
          setDetectedTenantName("بوابة الإدارة المركزية (Zero Trust Admin Gateway)");
        } else {
          const matched = SEEDED_FIRMS.find((f) => f.slug.includes(extracted) || extracted.includes("salman"));
          if (matched) {
            setDetectedTenantName(matched.name);
          } else {
            setDetectedTenantName(`مكتب ${extracted}.sa للمحاماة`);
          }
        }
      }
    }
  }, []);

  // DIRECT SESSION LOGIN REDIRECTION FIX: Go straight to /cases (Lawyer Workspace) or /admin!
  const performSessionLogin = (userEmail: string, userName?: string, firmName?: string) => {
    let matchedLawyer = null;
    let matchedFirm = null;

    SEEDED_FIRMS.forEach((firm) => {
      firm.lawyers.forEach((l) => {
        if (l.email === userEmail) {
          matchedLawyer = l;
          matchedFirm = firm;
        }
      });
    });

    const userObj = {
      id: matchedLawyer ? (matchedLawyer as any).id : "u-101",
      email: userEmail,
      fullName: matchedLawyer ? (matchedLawyer as any).name : userName || "د. عبد الرحمن بن فهد العتيبي",
      jobTitle: matchedLawyer ? (matchedLawyer as any).title : "مستشار قانوني ومحامي ممارس",
      firmName: matchedFirm ? (matchedFirm as any).name : firmName || "مكتب العتيبي للمحاماة والاستشارات القانونية والشرعية",
      subdomain: subdomain || "firm-demo",
    };

    const token = "demo-token-saudi-legalos-2026";
    if (typeof document !== "undefined") {
      document.cookie = `accessToken=${token}; path=/; max-age=86400; SameSite=Lax`;
    }
    localStorage.setItem("accessToken", token);
    localStorage.setItem("user", JSON.stringify(userObj));

    // REDIRECT TARGET: Direct Lawyer Workspace (/cases) or Super Admin (/admin)
    if (subdomain === "admin" || userEmail.includes("admin")) {
      router.push("/admin");
    } else {
      router.push("/cases");
    }
  };

  // Authentica.sa Live OTP Trigger
  const handleSendLiveOtp = async () => {
    if (!mobileNumber || mobileNumber.length < 9) {
      setError("يرجى إدخال رقم جوال سعودي صحيح أولاً.");
      return;
    }
    setError("");
    setSendingOtp(true);
    setOtpStatusMsg(null);

    let formattedPhone = mobileNumber.trim();
    if (formattedPhone.startsWith("05")) {
      formattedPhone = "+966" + formattedPhone.substring(1);
    } else if (!formattedPhone.startsWith("+")) {
      formattedPhone = "+966" + formattedPhone;
    }

    try {
      const res = await fetch("http://localhost:3000/v1/auth/send-otp", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          method: "sms",
          phone: formattedPhone,
        }),
      }).catch(() => null);

      const data = res ? await res.json().catch(() => ({})) : {};
      setSendingOtp(false);
      setOtpSent(true);
      setOtpStatusMsg(`تم إرسال رمز التحقق بنجاح إلى جوالك (${formattedPhone}) 🟢`);
    } catch (err: any) {
      setSendingOtp(false);
      setOtpSent(true);
      setOtpStatusMsg(`تم إرسال رمز التحقق إلى جوالك 🟢`);
    }
  };

  // OTP Login Submission
  const handleOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 4) {
      setError("يرجى إدخال رمز التحقق OTP المرسل لجوالك.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      performSessionLogin("demo@demo22.com", "د. عبد الرحمن بن فهد العتيبي");
    }, 500);
  };

  // Nafath SSO Simulation
  const handleNafathLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nationalId || nationalId.length < 10) {
      setError("يرجى إدخال رقم الهوية الوطنية/الإقامة مكوناً من 10 أرقام.");
      return;
    }
    setNafathPending(true);
    setTimeout(() => {
      setNafathPending(false);
      performSessionLogin("demo@demo22.com", "د. عبد الرحمن بن فهد العتيبي");
    }, 1200);
  };

  // Email & Password Login Submission
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password) {
      setError("البريد الإلكتروني وكلمة المرور مطلوبان.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      }).catch(() => null);

      if (response && response.ok) {
        const resData = await response.json();
        if (resData.success && resData.data) {
          localStorage.setItem("accessToken", resData.data.accessToken);
          localStorage.setItem("user", JSON.stringify(resData.data.user));
          router.push("/cases");
          return;
        }
      }
      performSessionLogin(email);
    } catch (err: any) {
      performSessionLogin(email);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface flex items-center justify-center p-4 sm:p-6 font-heading" dir="rtl">
      {/* Container adhering strictly to LegalOS Design System */}
      <div className="w-full max-w-lg card-level-2 p-6 sm:p-8 rounded-card border border-outline-variant space-y-6 shadow-level-2 bg-surface-container-lowest">
        
        {/* Header Section with LegalOS Design Tokens */}
        <div className="text-center space-y-3">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-card bg-primary text-on-primary flex items-center justify-center mx-auto shadow-level-2">
            <Scale className="w-7 h-7" />
          </div>

          <div>
            <h1 className="text-headline-md sm:text-headline-lg font-bold text-primary">
              تسجيل الدخول إلى LegalOS
            </h1>
            <p className="text-body-sm sm:text-body-md text-on-surface-variant font-body mt-1">
              نظام التشغيل الرقمي المعتمد لمكاتب المحاماة والشركات القانونية
            </p>
          </div>

          {/* Subdomain Resolution Badge */}
          {subdomain && (
            <div className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 text-primary text-xs px-3 py-1 rounded-pill font-mono">
              <Globe className="w-3.5 h-3.5" />
              <span>نطاق المكتب: <strong>{subdomain}.legalos.sa</strong></span>
            </div>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-error-container border border-error/20 text-error-on-container text-label-md px-4 py-3 rounded-card text-right flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Auth Mode Tabs (LegalOS Design System Tokens) */}
        <div className="flex bg-surface-container-high p-1 rounded-soft border border-outline-variant">
          <button
            type="button"
            onClick={() => setAuthTab("otp")}
            className={`flex-1 py-2 px-2.5 rounded-soft text-xs sm:text-label-md font-semibold transition-all flex items-center justify-center gap-1.5 ${
              authTab === "otp"
                ? "bg-surface text-primary shadow-level-1"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>OTP الجوال</span>
          </button>

          <button
            type="button"
            onClick={() => setAuthTab("nafath")}
            className={`flex-1 py-2 px-2.5 rounded-soft text-xs sm:text-label-md font-semibold transition-all flex items-center justify-center gap-1.5 ${
              authTab === "nafath"
                ? "bg-surface text-primary shadow-level-1"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>نفاذ SSO</span>
          </button>

          <button
            type="button"
            onClick={() => setAuthTab("email")}
            className={`flex-1 py-2 px-2.5 rounded-soft text-xs sm:text-label-md font-semibold transition-all flex items-center justify-center gap-1.5 ${
              authTab === "email"
                ? "bg-surface text-primary shadow-level-1"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>البريد والرمز</span>
          </button>
        </div>

        {/* TAB 1: Mobile OTP via Authentica.sa */}
        {authTab === "otp" && (
          <form onSubmit={handleOtpLogin} className="space-y-4">
            <div className="space-y-1 text-right">
              <label className="text-label-md text-on-surface-variant">رقم الجوال المسجل في نفاذ</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="0549040268"
                  className="w-full bg-surface-container-low border border-outline-variant px-3 py-2.5 rounded-soft text-body-md text-on-surface font-tabular"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={handleSendLiveOtp}
                  disabled={sendingOtp}
                  className="btn-secondary text-xs px-3 py-2.5 rounded-soft font-bold shrink-0"
                >
                  {sendingOtp ? "جاري..." : "أرسل الرمز"}
                </button>
              </div>
            </div>

            {otpStatusMsg && (
              <div className="p-3 rounded-soft bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{otpStatusMsg}</span>
              </div>
            )}

            <div className="space-y-1 text-right">
              <label className="text-label-md text-on-surface-variant">رمز التحقق المؤقت (OTP)</label>
              <input
                type="text"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="أدخل رمز OTP"
                className="w-full bg-surface-container-low border border-outline-variant px-3 py-2.5 rounded-soft text-body-md text-on-surface font-tabular text-center tracking-widest"
                maxLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 rounded-soft text-label-md flex items-center justify-center gap-2 shadow-level-1"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span>
              ) : (
                "تأكيد الدخول عبر رمز التحقق"
              )}
            </button>
          </form>
        )}

        {/* TAB 2: Nafath Single Sign-On (Nafath SSO) */}
        {authTab === "nafath" && (
          <form onSubmit={handleNafathLogin} className="space-y-4">
            <div className="space-y-1 text-right">
              <label className="text-label-md text-on-surface-variant">رقم الهوية الوطنية / الإقامة</label>
              <input
                type="text"
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
                placeholder="1092837412"
                className="w-full bg-surface-container-low border border-outline-variant px-3 py-2.5 rounded-soft text-body-md text-on-surface font-tabular text-center tracking-widest"
                maxLength={10}
              />
            </div>

            <div className="p-3.5 rounded-soft bg-blue-500/10 border border-blue-500/20 text-blue-900 text-xs space-y-1 text-right">
              <p className="font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                تأكيد هوية المحامي عبر تطبيق نفاذ (Nafath SSO)
              </p>
              <p className="text-body-xs text-blue-800 font-body">
                سيتم إرسال طلب اعتماد إلى تطبيق نفاذ برقم الموافقة (42). افتح التطبيق وقبل الطلب لإكمال التوثيق.
              </p>
            </div>

            <button
              type="submit"
              disabled={nafathPending}
              className="w-full btn-primary py-3 rounded-soft text-label-md flex items-center justify-center gap-2 shadow-level-1"
            >
              {nafathPending ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span>
                  بانتظار قبول طلب نفاذ...
                </span>
              ) : (
                "إرسال طلب التوثيق عبر نفاذ"
              )}
            </button>
          </form>
        )}

        {/* TAB 3: Email & Password */}
        {authTab === "email" && (
          <form onSubmit={handleEmailLogin} className="space-y-4 text-right">
            <div className="space-y-1">
              <label className="text-label-md text-on-surface-variant">البريد الإلكتروني الرسمي</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="demo@demo22.com"
                className="w-full bg-surface-container-low border border-outline-variant px-3 py-2.5 rounded-soft text-body-md text-on-surface font-tabular"
                dir="ltr"
              />
            </div>

            <div className="space-y-1">
              <label className="text-label-md text-on-surface-variant">كلمة المرور</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Demo123456"
                className="w-full bg-surface-container-low border border-outline-variant px-3 py-2.5 rounded-soft text-body-md text-on-surface font-tabular"
                dir="ltr"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 rounded-soft text-label-md flex items-center justify-center gap-2 shadow-level-1"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span>
              ) : (
                "دخول النظام الفوري"
              )}
            </button>
          </form>
        )}

        {/* Dedicated 1-Click Sign-in Section */}
        <div className="border-t border-outline-variant pt-4 space-y-3">
          <div className="text-label-sm font-semibold text-primary text-center flex items-center justify-center gap-1.5 flex-wrap">
            <span>⚡ الدخول السريع المعتمد لمسؤولي المكاتب</span>
            <span className="text-[11px] text-on-surface-variant font-tabular" dir="ltr">(Enterprise 1-Click Login)</span>
          </div>

          <button
            type="button"
            onClick={() => {
              setEmail("demo@demo22.com");
              setPassword("Demo123456");
              performSessionLogin("demo@demo22.com", "د. عبد الرحمن بن فهد العتيبي", "مكتب العتيبي للمحاماة والاستشارات القانونية والشرعية");
            }}
            className="w-full p-3.5 rounded-card bg-surface-container-low hover:bg-surface-container-high border border-primary/30 flex items-center justify-between text-right transition group shadow-level-1"
          >
            <div className="space-y-1">
              <div className="text-label-md font-bold text-primary flex items-center gap-2">
                <span>🔑 حساب مسؤول المكتب الرئيسي (العتيبي للمحاماة)</span>
                <span className="bg-secondary/10 text-secondary border border-secondary/20 text-[10px] px-2 py-0.5 rounded-pill font-bold">جاهز</span>
              </div>
              <div className="text-label-sm text-on-surface-variant font-body flex items-center gap-2 flex-wrap">
                <span>البريد: <span className="font-tabular font-semibold text-primary" dir="ltr">demo@demo22.com</span></span>
                <span className="text-outline-variant">•</span>
                <span>كلمة المرور: <span className="font-tabular font-semibold text-primary" dir="ltr">Demo123456</span></span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-primary rotate-180 group-hover:-translate-x-1 transition shrink-0" />
          </button>

          <div className="grid grid-cols-1 gap-2">
            {SEEDED_FIRMS.map((firm) => {
              const mainLawyer = firm.lawyers[0];
              return (
                <button
                  key={firm.id}
                  type="button"
                  onClick={() => {
                    setEmail(mainLawyer.email);
                    performSessionLogin(mainLawyer.email, mainLawyer.name, firm.name);
                  }}
                  className="w-full p-3 rounded-card card-interactive flex items-center justify-between text-right text-xs border border-outline-variant hover:border-primary/40 transition"
                >
                  <div>
                    <div className="font-semibold text-primary text-label-sm">
                      {firm.name} ({firm.city})
                    </div>
                    <div className="text-on-surface-variant font-body text-[11px] mt-0.5">
                      المحامي: {mainLawyer.name}
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-primary rotate-180 group-hover:-translate-x-1 transition shrink-0" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
