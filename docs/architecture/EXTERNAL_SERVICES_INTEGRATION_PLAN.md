# 🌐 LegalOS Enterprise External Services & Integrations Master Plan (خطة الخدمات الخارجية والتكاملات الرقمية)

**تاريخ الاعتماد:** 23 يوليو 2026  
**الإصدار:** v5.0 Production Ready  
**الهدف:** توثيق وتوزيع جميع الخدمات الخارجية، البوابات الحكومية، والمزودين التقنيين المطلوبة لتشغيل منصة **LegalOS** بالكامل في المملكة العربية السعودية.

---

## 1. البوابات والخدمات الحكومية السعودية (KSA Government Gateways)

| الخدمة / المنصة | الجهة التنظيمية | الغرض التشغيلي | حالة الربط برمجياً | متطلبات البيئة الحية |
| :--- | :--- | :--- | :---: | :--- |
| **ناجز مطورين (MOJ Najiz)** | وزارة العدل | استعلام القضايا، مواعيد الجلسات، التوثيق، والتنفيذ | **مربوط 🟢** (`NajizConnection`) | حساب قطاع خاص بـ Apigee + اتفاقية مشاركة بيانات |
| **نفاذ الوطني الموحد (Nafath)** | مركز المعلومات الوطني | التوثيق برقم الهوية والتحقق من شخصية المحامي والموكل | **مربوط 🟢** (`IamModule`) | تسجيل مزود خدمة في نفاذ (IAM Service Provider) |
| **فاتورة الزكاة (ZATCA Phase 2)** | هيئة الزكاة والضريبة والجمارك | الفوترة الإلكترونية المرحلة الثانية (UBL 2.1 XML) | **مربوط 🟢** (`ZatcaGovernmentAdapter`) | شهادة cryptographic stamp مخصصة لكل مكتب |
| **المركز السعودي للأعمال (MC)** | وزارة التجارة | التحقق التلقائي من السجلات التجارية الـ 700 وترخيص وزارة العدل | **مربوط 🟢** (`OnboardingService`) | API Key موحد للمركز السعودي للأعمال |

---

## 2. بوابات التواصل والتصديق الحيوي (Communication & Verification Gateways)

| الخدمة / المزود | التكنولوجيا المستخدمة | الغرض التشغيلي | حالة الربط برمجياً | التكلفة التقديرية |
| :--- | :--- | :--- | :---: | :--- |
| **Authentica.sa** | REST API v2 | الـ OTP عبر SMS والواتساب، والبصمة الحيوية بالوجه والصوت | **مربوط حياً 🟢** (`AuthenticaService`) | 0.05 SAR / OTP |
| **Infobip / Unifonic** | SMS & WhatsApp API | البوابة الاحتياطية للإشعارات والتنبيهات المباشرة | **مربوط 🟢** (`NotificationQueueService`) | حسب الاستهلاك |
| **Resend / SendGrid** | SMTP & Transactional API | إرسال الفواتير التفاعلية وإشعارات الجلسات بالبريد | **مربوط 🟢** (`EmailModule`) | مجاني حتى 3,000 بريد/شهر |

---

## 3. البنية التحتية وقواعد البيانات (Cloud Infrastructure & Storage)

| المزود السحابي | الخدمة | الغرض التشغيلي | التكلفة والمنطقة |
| :--- | :--- | :--- | :--- |
| **Cloudflare** | WAF + Zero Trust + R2 Vault | حماية الـ DNS، التخزين المشفر للوثائق بـ R2، وجدار الحماية السيبراني | KSA Edge Network / 0.015$ / GB |
| **Render / AWS KSA** | Web App & API Hosting | استضافة خوادم Next.js 15 و NestJS 11 ومحرك العمالة الخلفية | منطقة الرياض / ME-CENTRAL-1 |
| **Supabase / RDS Postgres** | PostgreSQL 16 Managed DB | قاعدة البيانات الرئيسية مع عزل المستأجرين بـ PostgreSQL RLS | Managed DB بـ Backup يومي |
| **Upstash / ElastiCache** | Managed Redis 7 | تخزين الجلسات، ذاكرة التخزين المؤقت، وطوابير BullMQ | Latency < 5ms |

---

## 4. نماذج الذكاء الاصطناعي وقراءة المستندات (Legal AI & Arabic OCR)

| الخدمة / المزود | التكنولوجيا | الغرض التشغيلي | حالة الربط برمجياً |
| :--- | :--- | :--- | :---: |
| **Saudi Legal LLM / OpenAI** | GPT-4o / Claude 3.5 | تلخيص الأحكام، صياغة المذكرات، وتقييم مخاطر الـ Hallucination | **مربوط 🟢** (`LlmGatewayService`) |
| **Google Vision / Tesseract** | Advanced Arabic OCR | استخراج النصوص من اللوائح والصكوك ومحاضر الجلسات الممسوحة | **مربوط 🟢** (`DocumentIntelligenceService`) |

---

## 5. بوابات الدفع الإلكتروني (Payment Gateways & Subscriptions)

| الخدمة | وسائل الدفع المدعومة | الغرض | حالة الربط |
| :--- | :--- | :--- | :---: |
| **Moyasar / Tap Payments** | مدى، Visa، Mastercard، Apple Pay | تحصيل اشتراكات مكاتب المحاماة وأتعاب القضايا | **مربوط 🟢** (`BillingModule`) |

---

## 💡 توصية وتكاليف التجهيز الحية (Operational Readiness Cost Estimate)

- **رسوم بوابة Authentica.sa الحالية**: الرصيد الحالي محمل وشغال بـ **99.00 SAR**.
- **رسوم Cloudflare R2**: مجانية للـ 10 GB الأولى.
- **رسوم Render / Managed Database**: بيئة جاهزة ومجربة.
