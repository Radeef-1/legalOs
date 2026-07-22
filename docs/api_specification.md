# مواصفات واجهة الـ API (API Specification Document)
### منصة LegalOS — نظام إدارة المكاتب القانونية للمستأجرين المتعددين

---

## 1. مبادئ التصميم العامة (General Design Principles)

* **Base URL:** `https://api.legalos.sa/v1`
* **Content-Type:** `application/json`
* **معايير التوثيق:** تُدمج حزمة Swagger تلقائياً في المشروع لتوليد التوثيق الحي على المسار `/api/docs`.

### 1.1 العناوين المطلوبة (Headers)
لكل طلب خارج موديول المصادقة العامة، يُشترط تمرير العنوان التالي:
* `Authorization: Bearer {jwt_token}` (يحتوي التوكن على `tenantId` و `userId` و `role`).

---

## 2. الهيكل الموحد للاستجابات (Standard Response Formats)

### 2.1 استجابة البيانات المفردة (Single Item Response)
```json
{
  "success": true,
  "data": {
    "id": "77777777-7777-7777-7777-777777777777",
    "caseNumberInternal": "CASE-A-001",
    "status": "open",
    "createdAt": "2026-07-18T10:00:00Z"
  }
}
```

### 2.2 استجابة القوائم والتصفح (Paginated List Response)
يتم إجبار التصفح (Pagination) في جميع استدعاءات القوائم لضمان كفاءة قواعد البيانات:
```json
{
  "success": true,
  "data": [
    {
      "id": "77777777-7777-7777-7777-777777777777",
      "caseNumberInternal": "CASE-A-001",
      "status": "open"
    }
  ],
  "meta": {
    "total": 120,
    "page": 1,
    "limit": 10,
    "totalPages": 12
  }
}
```

### 2.3 استجابة الأخطاء الموحدة (Error Response)
تتبع جميع الاستثناءات هيكلاً ثابتاً يضم كوداً برمجياً للخطأ ورسالة للمستخدم النهائي باللغة العربية:
```json
{
  "success": false,
  "error": {
    "code": "AUTH_INVALID_CREDENTIALS",
    "message": "اسم المستخدم أو كلمة المرور غير صحيحة",
    "details": null
  }
}
```

---

## 3. نقاط الاتصال الأساسية (Core API Endpoints)

### 3.1 المصادقة (Authentication Module)

#### `POST /auth/login`
* **المسؤولية:** التحقق من الهوية وإصدار توكنات الدخول.
* **المدخلات:**
  ```json
  {
    "email": "lawyer.a@firma.sa",
    "password": "secure_password_123"
  }
  ```
* **الاستجابة (200):**
  ```json
  {
    "success": true,
    "data": {
      "accessToken": "eyJhbGciOi...",
      "refreshToken": "eyJhbGciOi...",
      "expiresIn": 3600,
      "user": {
        "id": "33333333-3333-3333-3333-333333333333",
        "fullName": "Lawyer A",
        "email": "lawyer.a@firma.sa",
        "role": "Partner",
        "tenantId": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"
      }
    }
  }
  ```

#### `POST /auth/refresh`
* **المسؤولية:** تجديد الـ Access Token باستخدام الـ Refresh Token.
* **المدخلات:**
  ```json
  {
    "refreshToken": "eyJhbGciOi..."
  }
  ```

---

### 3.2 القضايا (Cases Engine)

#### `GET /cases`
* **المسؤولية:** جلب قائمة القضايا المعزولة للمستأجر الحالي.
* **خيارات التصفية والبحث (Query Parameters):**
  * `page` (الافتراضي: 1)
  * `limit` (الافتراضي: 10، الحد الأقصى: 100)
  * `search` (البحث بالرقم الداخلي، رقم ناجز، أو اسم العميل)
  * `status` (مفتوحة، قيد النظر، منتهية، مغلقة)
* **الاستجابة (200):** تعيد هيكل Paginated List.

#### `POST /cases`
* **المسؤولية:** إنشاء قضية جديدة وربطها بموكل للمستأجر الحالي.
* **المدخلات:**
  ```json
  {
    "clientId": "55555555-5555-5555-5555-555555555555",
    "assignedLawyerId": "33333333-3333-3333-3333-333333333333",
    "caseNumberInternal": "CASE-A-002",
    "caseType": "commercial",
    "courtName": "المحكمة التجارية بالرياض"
  }
  ```

#### `GET /cases/:id`
* **المسؤولية:** جلب تفاصيل قضية محددة. تعيد خطأ `404 Not Found` أمنياً إذا كانت القضية تابعة لمستأجر آخر لمنع كشف أرقام الـ IDs.
