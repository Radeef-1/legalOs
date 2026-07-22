# معمارية النظام (System Architecture Document)
### منصة LegalOS — نظام إدارة المكاتب القانونية للمستأجرين المتعددين

---

## 1. نظرة عامة على النظام (System Overview)

يتبع نظام **LegalOS** نمط التطبيق المونوليثي المجزأ (Modular Monolith) لتسهيل التطوير والصيانة مع الحفاظ على الفصل الواضح بين الموديولات البرمجية في الخلفية، بينما يعتمد على مستودع موحد (Monorepo) يحتوي على:
1. **الواجهة الأمامية (web):** تطبيق Next.js 15 (React 19 + TypeScript + Tailwind CSS).
2. **الواجهة الخلفية (api):** تطبيق NestJS (TypeScript + Prisma ORM + PostgreSQL + Redis).

---

## 2. معمارية عزل البيانات (Multi-Tenant Isolation)

اعتمدنا نموذج **قاعدة البيانات المشتركة مع عزل الأسطر (Shared Database + Row-Level Security)** لتوفير أقصى قدر من توفير التكاليف التشغيلية والأمان للبيانات القانونية الحساسة.

### 2.1 تدفق معالجة الطلب وسياق المستأجر (Request Lifecycle & Tenant Context)

عند ورود أي طلب HTTP إلى واجهات الـ REST API في الخلفية، يمر عبر المراحل التالية لضمان تأمين البيانات:

```text
               HTTP Request with JWT Bearer Token
                              │
                              ▼
                     JWT Auth Guard (NestJS)
           (يتحقق من التوكن ويستخرج tenant_id و user_id)
                              │
                              ▼
                   Tenant Interceptor/Guard
       (يخزن المعرفات في AsyncLocalStorage - TenantContext)
                              │
                              ▼
                    Controller -> Service
               (يستدعي prismaService.db.case.findMany)
                              │
                              ▼
                 Prisma Client RLS Extension
       (يفتح Transaction تلقائي ويشغل SET LOCAL app.current_tenant_id)
                              │
                              ▼
                 PostgreSQL RLS Engine (Database)
        (يفلتر أسطر الجدول أوتوماتيكياً ويعيد البيانات للمستأجر الحالي)
```

### 2.2 مصفوفة عزل المكونات (Component-level Isolation Matrix)

* **قاعدة البيانات (PostgreSQL):** يتم تفعيل RLS على كافة جداول العمل القانوني (مثل: القضايا، الموكلين، الفواتير، الملفات، سجلات التدقيق).
* **الكاش (Redis):** يتم تزويد جميع مفاتيح الكاش ببادئة المستأجر أوتوماتيكياً: `tenant:{tenant_id}:{key}`.
* **طوابير العمل (BullMQ):** كل مهمة تُشحن في الطابور تحمل حقل `tenant_id` كحقل إلزامي يتم التحقق منه قبل التنفيذ.
* **تخزين الملفات (Object Storage):** تُعزل الملفات بمسار خاص بكل مستأجر: `/storage/{tenant_id}/{case_id}/{file_id}`.

---

## 3. تكامل منصة ناجز مطورين (Najiz API Integration)

يتبع النظام **النموذج A (الربط الفردي للمكتب)**:
* يقوم كل مكتب بتسجيل حسابه واستصدار مفاتيح الاتصال (Consumer Key / Consumer Secret) من بوابة ناجز مطورين.
* يتم إدخال هذه المفاتيح وتشفيرها في جدول `najiz_connections` باستخدام خوارزمية **AES-256-GCM** ومفتاح تشفير فريد لكل مكتب (Envelope Encryption).
* للتطوير المحلي ولتجنب التأثير بأي توقف من منصة ناجز، يتم تفعيل **Mock Adapter** يقوم بمحاكاة ردود بوابة ناجز ببيانات افتراضية واقعية.

---

## 4. طوابير العمل والخلفية (BullMQ & Background Jobs)

نستخدم **BullMQ** لإدارة المهام الخلفية المعزولة لضمان عدم توقف الواجهات عند استدعاء العمليات الثقيلة:
1. **مزامنة ناجز (Najiz Sync):** مهمة مجدولة دورياً (كل ساعة أو يومياً) تبحث في جدول `najiz_connections` النشطة، وتتصل ببوابة ناجز للتحقق من أي تغييرات في القضايا أو الجلسات وتحديث قاعدة البيانات المحلية.
2. **التنبيهات (Notifications Dispatcher):** معالجة وإرسال البريد الإلكتروني (عبر SES/Resend) والرسائل النصية للتذكير بالجلسات قبل موعدها بـ 24 ساعة.
