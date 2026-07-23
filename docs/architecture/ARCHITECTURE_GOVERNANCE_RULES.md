# 📜 LegalOS Architecture Governance Rules (قواعد المعمارية والجودة)

**تاريخ الاعتماد:** 23 يوليو 2026  
**الإصدار:** v5.0 Master Platform  
**النطاق:** جميع المطورين والمساهمين بـ Monorepo (`apps/web`, `apps/api`, `apps/workers`, `packages/*`)

---

## 1. قواعد معمارية النطاق (DDD & Bounded Contexts)

1. **فصل النطاقات (Bounded Context Isolation)**:
   - يمنع منعاً باتاً استدعاء الموديولات مباشرة خارج نطاقها، ويتم التواصل حصراً عبر خدمات `Services` أو أحداث الـ Outbox (`DomainEventPublisher`).
2. **عزل المستأجرين (Tenant Isolation)**:
   - يجب تضمين `organizationId` في جميع الاستعلامات وإضافة قيد RLS على جداول PostgreSQL.
3. **الأسرار ومفاتيح البيئة**:
   - يمنع وضع أي API Key أو كلمة مرور داخل الكود، وتخزينها حصراً في Cloudflare / Render Secrets.

---

## 2. قواعد تسمية المسارات والرموز (Naming Conventions)

- **أسماء الجداول والموديلات**: `lowercase_snake_case` في قاعدة البيانات ومطابقتها بـ Prisma.
- **مسارات الـ API**: استخدام الأحرف الصغيرة المشرطة (Kebab-case) والتقيد بالإصدارات: `/v1/cases`, `/v1/integrations/authentica`.
- **المكونات والخدمات**: `PascalCase` في TypeScript (`CostIntelligenceService`, `DocumentIntelligenceService`).

---

## 3. قائمة فحص مراجعة البرمجيات (Pull Request Checklist)

- [x] اجتياز `npm run build` دون أي أخطاء نمطية.
- [x] عدم وجود اعتمادية دائرية (Zero Circular Dependencies).
- [x] توثيق كافة المسارات بـ Swagger OpenAPI.
