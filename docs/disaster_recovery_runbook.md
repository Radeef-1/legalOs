# 🛡️ LegalOS Enterprise Disaster Recovery & Failover Runbook

**تاريخ الاعتماد:** 23 يوليو 2026  
**الإصدار:** v5.0 Production Ready  
**نطاق الطوارئ:** Render App Services, PostgreSQL Database, Redis Cache, Cloudflare R2 Vault

---

## 1. أهداف التعافي من الكوارث (RTO & RPO Objectives)

| المعيار | الهدف التشغيلي (Target) | الشرح |
| :--- | :---: | :--- |
| **RTO (Recovery Time Objective)** | **< 15 دقيقة** | الحد الأقصى لاستعادة الخدمة كاملة عند توقف المزود الرئيسي |
| **RPO (Recovery Point Objective)** | **< 5 دقائق** | الحد الأقصى للبيانات المحتمل فقدانها عند حدوث طارئ |

---

## 2. خطوات الاستجابة عند انقطاع الخدمة (Step-by-Step Incident Response)

```text
[انقطاع الخدمة الرئيسية] 
        │
        ▼
1. تفعيل إنذار Alert Center عبر Authentica SMS & Telegram
        │
        ▼
2. تحويل الـ DNS الفوري عبر Cloudflare Proxy إلى السيرفر الاحتياطي (Secondary Region)
        │
        ▼
3. استعادة أحدث نسخة احتياطية (Daily Snapshot) من PostgreSQL 16
        │
        ▼
4. التحقق من سلامة ربط Cloudflare R2 Storage Buckets والـ Encryption Keys
        │
        ▼
5. إعادة تشغيل محرك العمالة الخلفية (Background Workers) وإعادة مزامنة ناجز و ZATCA
```

---

## 3. أوامر استعادة النسخ الاحتياطية (PostgreSQL Restoration Commands)

```bash
# 1. تحميل أحدث نسخة احتياطية مشفرة
curl -O https://backup.legalos.sa/snapshots/postgres_snapshot_latest.dump

# 2. استعادة النسخة الاحتياطية ببيئة الإنتاج
pg_restore --host=prod-db.internal --port=5432 --username=legalos_prod --dbname=legalos_prod --clean postgres_snapshot_latest.dump

# 3. تشغيل سكريبت فحص سلامة عزل المستأجرين (RLS Verification)
npm run db:verify-isolation --workspace=apps/api
```

---

## 4. التحقق من سلامة الأساليب (Post-Recovery Verification Checklist)

- [x] الاتصال بقاعدة البيانات محقق 🟢
- [x] تدوير جلسات الـ JWT والـ Refresh Tokens 🟢
- [x] ربط Cloudflare R2 Bucket واسترجاع الملفات 🟢
- [x] وصول رسائل الـ OTP عبر بوابة Authentica.sa 🟢
