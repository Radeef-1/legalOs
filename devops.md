# LegalOS — Technical Foundation Pack
### القرار المعماري + تصميم قاعدة البيانات + مواصفات الـ API + SRS لموديولات MVP

**الإصدار:** 1.0
**التاريخ:** يوليو 2026
**الحالة:** جاهز للبناء (Build-Ready) — يُبنى عليه تطوير الأسبوع القادم

**سياق:** هذه الوثيقة مبنية على PRD إصدار 1.0، وتحوّل الرؤية إلى قرارات معمارية قابلة للتنفيذ مباشرة، قبل استقبال أول 16 عميل. الذكاء الاصطناعي مؤجَّل بالكامل (Phase 3 في الـ Roadmap) وغير مشمول في هذه الوثيقة.

---

# القسم 1: قرار Multi-Tenant Architecture

## 1.1 المقارنة بين الخيارات

| الخيار | الوصف | التكلفة التشغيلية | العزل الأمني | سهولة التوسع |
|---|---|---|---|---|
| **Shared Database + Row-Level Isolation** | جدول واحد لكل كيان، عمود `tenant_id` في كل جدول، عزل عبر Row-Level Security | منخفضة جداً | جيد (لو مُطبّق بصرامة) | ممتاز — عميل جديد = صف جديد، بدون أي بنية إضافية |
| **Separate Schema per Tenant** | نفس قاعدة البيانات، Schema مستقل لكل عميل | متوسطة | ممتاز | متوسط — يحتاج Migration script لكل عميل جديد |
| **Separate Database per Tenant** | قاعدة بيانات مستقلة فعلياً لكل عميل | عالية جداً | ممتاز جداً | ضعيف على نطاق 16-50+ عميل، مناسب فقط لعقود Enterprise كبرى |

## 1.2 القرار

**نعتمد: Shared Database + Row-Level Isolation (PostgreSQL Row-Level Security) لـ MVP وحتى Phase 2.**

**السبب:**
- عندك 16 عميل جاهزين الآن، معظمهم Solo/Boutique — التكلفة التشغيلية والسرعة أهم من العزل شديد الصرامة اللازم فقط لعقود Enterprise الكبرى.
- PostgreSQL RLS يعطي عزلاً حقيقياً على مستوى الصف، مُطبَّقاً في طبقة قاعدة البيانات نفسها (لا يعتمد فقط على منطق التطبيق) — هذا يقلل خطر "الثغرة البرمجية التي تُسرّب بيانات عميل لعميل آخر".
- الانتقال لاحقاً لـ Separate Schema لعميل Enterprise واحد ممكن دون إعادة بناء كامل النظام (Migration مستهدف لعميل واحد فقط، لا للجميع).

**قاعدة تنفيذ صارمة:**
كل استعلام على قاعدة البيانات **يجب** أن يمرّ عبر Middleware يُلزم بحقن `tenant_id` تلقائياً — لا يُسمح بأي Query مباشر يتجاوز هذه الطبقة، ولو من كود Admin داخلي.

```sql
-- مثال على RLS Policy لجدول القضايا
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_cases ON cases
    USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
```

## 1.3 العزل على مستوى الطبقات الأخرى

| الطبقة | استراتيجية العزل |
|---|---|
| **قاعدة البيانات** | RLS بعمود `tenant_id` (القرار أعلاه) |
| **تخزين الملفات (Storage)** | مسار منفصل لكل Tenant: `/storage/{tenant_id}/cases/{case_id}/...` + صلاحيات IAM منفصلة على مستوى Bucket/Prefix |
| **الكاش (Cache/Redis)** | Prefix إلزامي على كل مفتاح: `tenant:{tenant_id}:key` |
| **الطابور (Queue)** | كل Job يحمل `tenant_id` في Payload، ويُرفض أي Job بلا هذا الحقل في مرحلة Validation |
| **البحث (Search)** | فلترة إلزامية بـ `tenant_id` كـ Mandatory Filter في كل استعلام بحث، وليست اختيارية |
| **رموز الدخول لناجز (Najiz Tokens)** | كل Tenant له Consumer Key/Secret مستقل تماماً — لا مشاركة توكن بين عملاء تحت أي ظرف |

## 1.4 نموذج التوكنات مع ناجز (تأكيد القرار من PRD)

**القرار النهائي:** الخيار A — كل مكتب محاماة (Tenant) يسجّل حسابه في ناجز مطورين ويربط توكنه الخاص بـ LegalOS. LegalOS لا يخزّن توكن موحّد بالنيابة عن الجميع.

**الأثر التقني:** جدول `najiz_connections` (موصوف في القسم 2) يخزّن Consumer Key/Secret **مشفّرة** لكل Tenant على حدة، ويُستخدم Vault/KMS منفصل لتشفير هذه الأسرار بمفتاح خاص بكل Tenant (Envelope Encryption)، لا مفتاح تشفير واحد للنظام كله.

---

# القسم 2: تصميم قاعدة البيانات (ERD)

## 2.1 الكيانات الأساسية (Core Entities)

### `organizations` (المكاتب / Tenants)
| الحقل | النوع | ملاحظات |
|---|---|---|
| id | UUID (PK) | |
| name | varchar | اسم المكتب |
| commercial_registration | varchar | رقم السجل التجاري |
| unified_national_number | varchar | الرقم الوطني الموحد (للتحقق من ناجز) |
| plan_tier | enum | solo / boutique / enterprise |
| status | enum | active / suspended / trial |
| created_at | timestamp | |

### `branches` (الفروع — للمكاتب متعددة الفروع)
| الحقل | النوع | ملاحظات |
|---|---|---|
| id | UUID (PK) | |
| organization_id | UUID (FK → organizations) | |
| name | varchar | |
| city | varchar | |

### `users`
| الحقل | النوع | ملاحظات |
|---|---|---|
| id | UUID (PK) | |
| organization_id | UUID (FK) | |
| branch_id | UUID (FK, nullable) | |
| full_name | varchar | |
| email | varchar (unique) | |
| national_id | varchar | مطلوب لو المستخدم نفسه بيسجّل دخول ناجز مباشرة |
| role_id | UUID (FK → roles) | |
| status | enum | active / inactive |
| mfa_enabled | boolean | |
| created_at | timestamp | |

### `roles` / `permissions`
| الحقل | النوع | ملاحظات |
|---|---|---|
| roles.id | UUID (PK) | Partner / Associate / Paralegal / ReadOnly |
| permissions.id | UUID (PK) | مثل: cases.create, cases.delete, billing.view |
| role_permissions | جدول ربط (many-to-many) | |

### `clients` (عملاء المكتب — أصحاب القضايا)
| الحقل | النوع | ملاحظات |
|---|---|---|
| id | UUID (PK) | |
| organization_id | UUID (FK) | |
| name | varchar | |
| national_id / cr_number | varchar | فرد أو منشأة |
| phone | varchar | |
| email | varchar | |
| portal_access_enabled | boolean | يفعّل Client Portal |

### `cases` (القضايا — الكيان المركزي)
| الحقل | النوع | ملاحظات |
|---|---|---|
| id | UUID (PK) | |
| organization_id | UUID (FK) | |
| client_id | UUID (FK → clients) | |
| assigned_lawyer_id | UUID (FK → users) | |
| case_number_internal | varchar | رقم داخلي بالمكتب |
| najiz_case_number | varchar (nullable) | رقم القضية في ناجز — nullable لأنه ممكن ما يترّبط فوراً |
| case_type | enum | تجاري / عمالي / أحوال شخصية / تنفيذ ... |
| court_name | varchar | |
| status | enum | مفتوحة / قيد النظر / منتهية / منفَّذة |
| last_synced_at | timestamp (nullable) | آخر مزامنة مع ناجز |
| opened_at | timestamp | |
| closed_at | timestamp (nullable) | |

### `hearings` (الجلسات)
| الحقل | النوع | ملاحظات |
|---|---|---|
| id | UUID (PK) | |
| case_id | UUID (FK → cases) | |
| hearing_date | timestamp | |
| source | enum | manual / najiz_sync |
| notes | text | |

### `documents`
| الحقل | النوع | ملاحظات |
|---|---|---|
| id | UUID (PK) | |
| organization_id | UUID (FK) | |
| case_id | UUID (FK, nullable) | |
| uploaded_by | UUID (FK → users) | |
| storage_path | varchar | يشمل tenant_id في المسار |
| file_type | varchar | |
| ocr_status | enum (Phase 2) | pending / done / not_applicable |

### `invoices` / `payments` (Phase 1-lite → توسّع كامل Phase 2)
| الحقل | النوع | ملاحظات |
|---|---|---|
| invoices.id | UUID (PK) | |
| invoices.case_id | UUID (FK) | |
| invoices.client_id | UUID (FK) | |
| invoices.amount | decimal | |
| invoices.status | enum | draft / sent / paid / overdue |
| payments.invoice_id | UUID (FK) | |
| payments.amount_paid | decimal | |
| payments.paid_at | timestamp | |

### `najiz_connections` (تكامل ناجز — حرج أمنياً)
| الحقل | النوع | ملاحظات |
|---|---|---|
| id | UUID (PK) | |
| organization_id | UUID (FK, unique) | كل Tenant له اتصال واحد |
| consumer_key_encrypted | text | مشفّر بـ Envelope Encryption |
| consumer_secret_encrypted | text | مشفّر |
| access_token_encrypted | text (nullable) | يُجدَّد دورياً |
| token_expires_at | timestamp | |
| environment | enum | GSN / IAM / Internet |
| connection_status | enum | connected / expired / failed |
| last_verified_at | timestamp | |

### `audit_logs` (سجل تدقيق — إلزامي لكل تعديل حساس)
| الحقل | النوع | ملاحظات |
|---|---|---|
| id | UUID (PK) | |
| organization_id | UUID (FK) | |
| user_id | UUID (FK) | |
| action | varchar | مثل: case.updated, invoice.deleted |
| entity_type / entity_id | varchar / UUID | |
| old_value / new_value | jsonb | |
| ip_address | varchar | |
| created_at | timestamp | |

### `notifications`
| الحقل | النوع | ملاحظات |
|---|---|---|
| id | UUID (PK) | |
| user_id | UUID (FK) | |
| type | enum | hearing_reminder / invoice_due / case_status_changed |
| read_at | timestamp (nullable) | |

## 2.2 مخطط العلاقات (مبسّط)

```
organizations 1───N branches
organizations 1───N users
organizations 1───N clients
organizations 1───1 najiz_connections
organizations 1───N cases
clients        1───N cases
cases          1───N hearings
cases          1───N documents
cases          1───N invoices
invoices       1───N payments
users          N───1 roles
roles          N───N permissions
* (جميع الجداول) ── audit_logs (Polymorphic tracking)
```

---

# القسم 3: مواصفات الـ API (Cases + Najiz Integration)

## 3.1 مبادئ عامة

- **Base URL:** `https://api.legalos.sa/v1`
- **Authentication:** `Authorization: Bearer {jwt_token}` — JWT يحمل `tenant_id` و `user_id` و `role`
- **Rate Limiting:** 120 request/دقيقة لكل Tenant على endpoints القراءة، 30 request/دقيقة على endpoints الكتابة (تُضبط لاحقاً حسب الاستخدام الفعلي)
- **صيغة الأخطاء الموحّدة:**
```json
{
  "error": {
    "code": "CASE_NUMBER_DUPLICATE",
    "message": "رقم القضية الداخلي مستخدم مسبقاً في هذا المكتب",
    "field": "case_number_internal"
  }
}
```

## 3.2 Cases API

### `POST /cases`
**الصلاحية المطلوبة:** `cases.create`

**Request:**
```json
{
  "client_id": "uuid",
  "assigned_lawyer_id": "uuid",
  "case_number_internal": "string (اختياري — يُولَّد تلقائياً لو غير موجود)",
  "case_type": "commercial | labor | personal_status | execution",
  "court_name": "string"
}
```

**Response 201:**
```json
{
  "id": "uuid",
  "case_number_internal": "CASE-2026-0042",
  "status": "open",
  "created_at": "2026-07-18T10:00:00Z"
}
```

**قواعد التحقق (Validation Rules):**
- `client_id` يجب أن يكون تابعاً لنفس `organization_id` — رفض فوري لو انتمى لـ Tenant آخر (فحص إلزامي في طبقة Middleware، ليس فقط في التطبيق)
- `case_number_internal` — لو أُدخل يدوياً، يجب أن يكون فريداً **ضمن نفس المكتب فقط** (Unique constraint مركّب: `organization_id + case_number_internal`)
- لو رقم مكرر → خطأ `409 Conflict` بكود `CASE_NUMBER_DUPLICATE`

**Business Rules:**
- إنشاء قضية يُسجَّل تلقائياً في `audit_logs`
- إنشاء قضية يُرسل Notification لـ `assigned_lawyer_id`
- القضية تُنشأ بحالة `open` دائماً، لا يمكن إنشاؤها بحالة أخرى مباشرة

### `GET /cases/{id}`
**الصلاحية:** `cases.view` — مع فلترة إضافية: Associate يرى فقط قضاياه المُكلَّف بها، إلا لو كان Partner

**Response 200:** بيانات القضية الكاملة + آخر حالة مزامنة مع ناجز

**Errors:**
- `404` لو القضية غير موجودة **أو** تابعة لـ Tenant آخر (لا نُميّز بين الحالتين في الرد لأسباب أمنية — منع Enumeration Attack)

### `PATCH /cases/{id}`
**الصلاحية:** `cases.update`

**قواعد:**
- لا يمكن تعديل `najiz_case_number` يدوياً بعد أول مزامنة ناجحة — الحقل يُصبح Read-only (لتجنّب تعارض بيانات مع النظام القضائي الرسمي)
- تغيير `status` إلى `closed` يتطلب صلاحية إضافية `cases.close` (منفصلة عن `cases.update` العامة)

### `DELETE /cases/{id}`
**الصلاحية:** `cases.delete` — **مقصورة على Partner فقط بشكل افتراضي**

**قاعدة حرجة:** لا يوجد Hard Delete. كل حذف هو Soft Delete (`deleted_at` timestamp) — البيانات القانونية لا تُحذف فعلياً أبداً، فقط تُخفى من الواجهة، للامتثال ولإمكانية التدقيق المستقبلي.

### `GET /cases/{id}/najiz-status` (تكامل ناجز)
**الوظيفة:** استعلام حالة القضية من ناجز مباشرة (Live query، ليس من الكاش المحلي فقط)

**Response 200:**
```json
{
  "najiz_case_number": "string",
  "current_stage": "string",
  "next_hearing_date": "2026-08-01T09:00:00Z",
  "last_updated_source": "najiz_live",
  "synced_at": "2026-07-18T10:05:00Z"
}
```

**Error handling:**
- لو توكن ناجز منتهي/فاشل → `503 Service Unavailable` بكود `NAJIZ_CONNECTION_FAILED`، مع رسالة توضيحية للمستخدم "تعذّر الاتصال بناجز، يُعرض آخر بيانات محفوظة" + عرض تلقائي للبيانات المخزّنة محلياً كـ Fallback (لا يتوقف النظام كلياً بسبب انقطاع خارجي)

## 3.3 Najiz Integration API (طبقة داخلية)

### `POST /integrations/najiz/connect`
**الوظيفة:** ربط Tenant بحسابه في ناجز (تخزين Consumer Key/Secret مشفّرة)

**Request:**
```json
{
  "consumer_key": "string",
  "consumer_secret": "string",
  "environment": "internet | gsn | iam"
}
```

**قاعدة أمنية صارمة:** بعد الحفظ، لا يُعاد `consumer_secret` في أي Response لاحق أبداً — فقط `consumer_key` جزئياً مقنّع (مثل: `****3xK9`)

### `POST /integrations/najiz/verify-connection`
يطابق "نموذج اختبار اتصال المنتج" الموصوف في دليل ناجز — يُستخدم لتأكيد الاتصال قبل الاعتماد عليه في أي Sync حقيقي.

---

# القسم 4: SRS مصغّر لموديولات MVP

## 4.1 Case Engine (محرك القضايا)

**User Story 1:** بصفتي محامي (Associate)، أريد إنشاء قضية جديدة وربطها بعميل موجود، لكي أبدأ تتبعها فوراً.

**Acceptance Criteria:**
- ✅ لا يمكن إنشاء قضية بدون `client_id` صالح
- ✅ النظام يعرض تحذيراً لو `case_number_internal` مُدخل مسبقاً (بدل الرفض الصامت)
- ✅ عند الإنشاء، يظهر خيار "ربط برقم قضية ناجز الآن" أو "لاحقاً" — لا إلزام فوري

**Validation Rules:** (موضحة في القسم 3.2)

**Business Rules:**
- قضية بحالة `closed` لا يمكن تعديل بياناتها الجوهرية (نوع القضية، العميل) — فقط الإضافات (مستندات، ملاحظات) مسموحة
- محاولة حذف قضية تحتوي فواتير غير مدفوعة → تحذير إلزامي "توجد فواتير مرتبطة، هل أنت متأكد؟" قبل تنفيذ Soft Delete

**Error Handling:**
| الحالة | الاستجابة |
|---|---|
| فقدان الاتصال بناجز وقت الإنشاء | القضية تُنشأ محلياً بنجاح، تُعلَّم بـ `najiz_sync_pending: true`، تُعاد المحاولة تلقائياً كل ساعة (Background Job) |
| مستخدم بدون صلاحية | `403 Forbidden` + رسالة عربية واضحة، لا رسالة تقنية |

**Notifications:**
- إشعار للمحامي المُكلَّف عند إنشاء القضية
- إشعار قبل 24 ساعة من أي جلسة مزامنة من ناجز (`hearing_reminder`)

## 4.2 Client Portal (بوابة العميل)

**User Story:** بصفتي عميل مكتب محاماة، أريد رؤية حالة قضيتي دون الاتصال بمحاميّ لأعرف "وصلت لإيه".

**Acceptance Criteria:**
- ✅ العميل يرى: اسم القضية، الحالة الحالية، تاريخ آخر تحديث، الجلسة القادمة (لو موجودة)
- ✅ العميل **لا يرى** أي بيانات مالية داخلية أو ملاحظات المحامي الخاصة — فقط الحقول المُصنَّفة "Client-visible"
- ✅ لو `portal_access_enabled = false` على مستوى العميل، لا يُرسل أي دعوة دخول

**Business Rule حرجة:** كل حقل في قاعدة البيانات يحتاج علم `visible_to_client: boolean` صريح — القاعدة الافتراضية "غير ظاهر" (Deny by default)، لا "ظاهر إلا ما استُثني".

**Empty State:** لو العميل بلا قضايا نشطة حالياً → رسالة "لا توجد قضايا نشطة حالياً" بدل شاشة فاضية بلا توضيح.

## 4.3 Document Management (أساسي)

**User Story:** بصفتي محامي، أريد رفع مستند وربطه بقضية معينة، لكي أرجع له وقت الحاجة.

**Acceptance Criteria:**
- ✅ الملف يُخزَّن في مسار يحتوي `organization_id` إلزامياً
- ✅ الحد الأقصى لحجم الملف: يُحدَّد (مثلاً 25MB) مع رسالة خطأ واضحة لو تجاوز
- ✅ الصيغ المدعومة: PDF, DOCX, JPG, PNG (بدون OCR في MVP — مؤجّل Phase 2)

## 4.4 User & Roles Management

**User Story:** بصفتي Partner (مدير الحساب)، أريد إضافة محامي جديد وتحديد صلاحياته، بحيث لا يرى إلا قضاياه.

**Acceptance Criteria:**
- ✅ إضافة مستخدم تتطلب: الاسم، البريد الإلكتروني، الدور — يماثل تماماً نموذج "إضافة مستخدم من قِبل مدير الحساب" في دليل ناجز (بريد + OTP للتحقق)
- ✅ تعطيل مستخدم (`status: inactive`) لا يحذف بياناته أو سجله في `audit_logs` — فقط يمنع تسجيل الدخول

## 4.5 Billing (أساسي — تأسيس لـ Phase 2)

**نطاق MVP المحدود:** إنشاء فاتورة يدوية بسيطة مرتبطة بقضية، بدون تتبع ساعات تلقائي (ده Phase 2 الكامل).

**Acceptance Criteria:**
- ✅ الفاتورة تُنشأ بحالة `draft` دائماً أولاً، ثم تتحول لـ `sent` عند التأكيد الصريح
- ✅ لا يمكن حذف فاتورة `paid` — فقط Soft Delete مع سجل تدقيق كامل (متطلب قانوني/محاسبي)

---

# القسم 5: ملخص القرارات المعمارية (Decision Log)

| # | القرار | الحالة |
|---|---|---|
| 1 | Multi-tenancy: Shared DB + Row-Level Security | ✅ محسوم |
| 2 | Najiz Token Model: كل Tenant يربط توكنه الخاص (الخيار A) | ✅ محسوم |
| 3 | Soft Delete إلزامي على كل الكيانات القانونية (قضايا، فواتير) | ✅ محسوم |
| 4 | Client Portal: Deny-by-default على كل حقل | ✅ محسوم |
| 5 | AI Assistant: مؤجَّل بالكامل خارج نطاق MVP | ✅ محسوم (بطلبك) |
| 6 | استراتيجية OCR للمستندات | ⏳ مؤجَّل لـ Phase 2 |
| 7 | نموذج التسعير النهائي لكل Tier | ⏳ يحتاج قرار قبل Onboarding العميل الأول |

---

*هذه الوثيقة جاهزة لتُسلَّم مباشرة لفريق التطوير أو لمطوّر مستقل/وكالة كنقطة انطلاق. الخطوة التالية المنطقية: Wireframes للشاشات الأساسية (Dashboard، القضايا، بوابة العميل) لضمان توافق الرؤية البصرية قبل بدء الـ Frontend.*
