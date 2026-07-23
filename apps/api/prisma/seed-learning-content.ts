import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedLearningContent() {
  console.log('🚀 [Content Enrichment] Seeding Saudi Legal Content, Guided Tours & Video Academy...');

  // 01. Seed Knowledge Base Articles (Notion-style Docs)
  const articles = [
    {
      title: 'دليل الإجراءات الشامل للمحكمة التجارية واللوائح التنفيذية 2026',
      slug: 'commercial-court-procedure-guide',
      module: 'cases',
      tags: ['تجارية', 'ناجز', 'لوائح', 'السعودية'],
      content: `
# دليل الإجراءات الشامل للمحكمة التجارية ⚖️

تعد الدعاوى التجارية من أهم ركائز العمل القانوني للمكاتب والشركات في المملكة العربية السعودية.

## خطوات تقديم صحيفة الدعوى التجارية عبر ناجز:
1. **التحقق من الاختصاص**: التأكد من أن النزاع بين تاجرين أو يتصل بأعمال تجارية مساندة وفق المادة 16 من نظام المحاكم التجارية.
2. **صياغة المذكرة الجوابية**: تضمين الوقائع، الأسانيد الشرعية والنظامية، وطلبات المدعي المحددة بدقة.
3. **مراعاة مدد اللائحة التنفيذية**: الالتزام بالمهل المحددة لإيداع المذكرات والاعتراضات (30 يوماً من تاريخ صدور الحكم).
      `,
    },
    {
      title: 'دليل الامتثال لنظام حماية البيانات الشخصية (PDPL 2026)',
      slug: 'saudi-pdpl-compliance-guide',
      module: 'compliance',
      tags: ['امتثال', 'PDPL', 'أمان', 'بيانات'],
      content: `
# دليل الامتثال لنظام حماية البيانات الشخصية (PDPL) 🛡️

يهدف نظام حماية البيانات الشخصية الصادر بالمرسوم الملكي إلى حماية سرية بيانات الموكلين والقضايا.

## التزامات مكتب المحاماة:
- **التشفير الإجباري**: تشفير سرية وثائق وقضايا الموكلين بأسلوب AES-256 و 32-bit Encrypted Invites.
- **تحديد الصلاحيات (Least Privilege)**: حصر الاطلاع على الملفات للمحامين المكلفين بالقضية فقط.
- **سجل المعالجة التدقيقي**: الاحتفاظ بسجل زمني لجميع عمليات الفتح والتعديل والمشاركة.
      `,
    },
    {
      title: 'دليل الفواتير الإلكترونية والربط مع هيئة الزكاة (ZATCA Phase 2)',
      slug: 'zatca-phase2-integration-guide',
      module: 'billing',
      tags: ['زكاة', 'ZATCA', 'فواتير', 'ضريبة'],
      content: `
# دليل إقرار الفواتير الإلكترونية ZATCA Phase 2 🧾

ربط الفواتير الصادرة من مكتب المحاماة مع منصة هيئة الزكاة والضريبة والجمارك.

## متطلبات الفاتورة الضريبية المبسطة والمعتمدة:
1. **رمز الاستجابة السريعة (QR Code)**: تضمين التوقيع الرقمي والـ Hash المشفر.
2. **الربط المباشر API**: إرسال الإشعار والتسجيل التلقائي للمبيعات والخدمات القانونية.
      `,
    },
  ];

  for (const article of articles) {
    await prisma.knowledgeArticle.upsert({
      where: { slug: article.slug },
      update: article,
      create: article,
    });
  }
  console.log(`✅ Seeded ${articles.length} Knowledge Articles.`);

  // 02. Seed Video Academy Lessons
  const videos = [
    {
      title: 'كيفية تسجيل قضية عمالية ومتابعة جلسات التسوية عبر ناجز وتراضي',
      url: 'https://cdn.legalos.sa/videos/labor-cases-tutorial.mp4',
      thumbnail: 'https://cdn.legalos.sa/thumbnails/labor-cases.jpg',
      duration: '3:45',
      module: 'cases',
    },
    {
      title: 'خطوات توثيق وتوليد دعوات المحامين والموكلين المشفرة 32-bit',
      url: 'https://cdn.legalos.sa/videos/secure-invites-tutorial.mp4',
      thumbnail: 'https://cdn.legalos.sa/thumbnails/invites.jpg',
      duration: '2:30',
      module: 'invitations',
    },
    {
      title: 'تخصيص الهوية البصرية، الألوان، وترويسة التقارير والختم المعتمد',
      url: 'https://cdn.legalos.sa/videos/white-label-tutorial.mp4',
      thumbnail: 'https://cdn.legalos.sa/thumbnails/branding.jpg',
      duration: '4:10',
      module: 'branding',
    },
    {
      title: 'استخدام المساعد القانوني الذكي في صياغة العقود ولوائح الاعتراض',
      url: 'https://cdn.legalos.sa/videos/ai-copilot-tutorial.mp4',
      thumbnail: 'https://cdn.legalos.sa/thumbnails/ai.jpg',
      duration: '5:00',
      module: 'ai',
    },
  ];

  for (const video of videos) {
    const existing = await prisma.learningVideo.findFirst({ where: { title: video.title } });
    if (!existing) {
      await prisma.learningVideo.create({ data: video });
    }
  }
  console.log(`✅ Seeded Video Academy Lessons.`);

  // 03. Seed Interactive Product Tours
  const tours = [
    {
      title: 'جولة اللوحة الرئيسية ومركز التشغيل',
      slug: 'tour-dashboard-main',
      description: 'تعرف على مؤشرات الأداء، التنبيهات الحية، والوصول السريع للجلسات والإنذارات.',
      module: 'dashboard',
      role: 'ALL',
      difficulty: 'EASY',
      duration: '2 mins',
      steps: [
        { order: 1, selector: '#header-branding', title: 'ترويسة الهوية الحية', description: 'تعرض اسم المنشأة وترخيص وزارة العدل المعتمد.', position: 'bottom' },
        { order: 2, selector: '#main-sidebar', title: 'القائمة الجانبية الموحدة', description: 'تتيح الوصول السريع لجميع الخدمات والمحركات وحوكمة الملف.', position: 'left' },
        { order: 3, selector: '#overview-cards', title: 'مؤشرات الأداء وصحة المكتب', description: 'تعرض نسبة إنجاز المكتب والجلسات القادمة والإيرادات.', position: 'bottom' },
      ],
    },
    {
      title: 'جولة إدارة القضايا وتوزيع المهام',
      slug: 'tour-cases-management',
      description: 'طريقة تسجيل قضايا جديدة، ربط الموكلين، وتعين الفريق المسؤول.',
      module: 'cases',
      role: 'ALL',
      difficulty: 'MEDIUM',
      duration: '3 mins',
      steps: [
        { order: 1, selector: '#cases-table', title: 'جدول القضايا المباشر', description: 'جدول تفاعلي مع خيارات التصفية بالنوع والحالة.', position: 'top' },
        { order: 2, selector: '#create-case-btn', title: 'زر تسجيل قضية جديدة', description: 'اضغط هنا لفتح نموذج تسجيل القضية والمحكمة.', position: 'bottom' },
      ],
    },
  ];

  for (const tour of tours) {
    const created = await prisma.learningTutorial.upsert({
      where: { slug: tour.slug },
      update: {
        title: tour.title,
        description: tour.description,
        module: tour.module,
        duration: tour.duration,
      },
      create: {
        title: tour.title,
        slug: tour.slug,
        description: tour.description,
        module: tour.module,
        role: tour.role,
        difficulty: tour.difficulty,
        duration: tour.duration,
      },
    });

    for (const step of tour.steps) {
      const existingStep = await prisma.learningStep.findFirst({
        where: { tutorialId: created.id, order: step.order },
      });
      if (!existingStep) {
        await prisma.learningStep.create({
          data: {
            tutorialId: created.id,
            order: step.order,
            selector: step.selector,
            title: step.title,
            description: step.description,
            position: step.position,
          },
        });
      }
    }
  }
  console.log(`✅ Seeded ${tours.length} Guided Product Tours.`);

  console.log('\n🎉 [SUCCESS] Content Enrichment Seeded Cleanly!');
}

seedLearningContent()
  .catch((err) => {
    console.error('❌ Seeding Error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
