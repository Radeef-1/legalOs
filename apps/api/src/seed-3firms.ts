import { PrismaService } from './shared/database/prisma.service';
import { hashPassword } from './shared/utils/crypto';
import { TenantContext } from './shared/tenant/tenant.context';

async function seed3Firms() {
  const prisma = new PrismaService();
  await prisma.$connect();
  console.log('🚀 Starting Seed for 3 Law Firms, 15 Lawyers (5 per firm), and 225 Cases (15 per lawyer)...');

  const defaultPasswordHash = hashPassword('password123');

  // 1. Definition of the 3 Law Firms
  const firmsData = [
    {
      id: '11111111-0000-0000-0000-000000000001',
      slug: 'firm-salman',
      name: 'مكتب السلمان للمحاماة والاستشارات القانونية',
      cr: '1010894512',
      unn: '7001928475',
      city: 'الرياض',
      lawyers: [
        { name: 'د. عبد الله السلمان', email: 'salman.partner@salman-law.sa', title: 'شريك رئيسي / مستشار كبار' },
        { name: 'أ. فيصل السلمان', email: 'faisal@salman-law.sa', title: 'محامي شريك' },
        { name: 'أ. سارة الشمري', email: 'sara@salman-law.sa', title: 'مستشارة قضايا تجارية' },
        { name: 'أ. محمد القحطاني', email: 'mohammed@salman-law.sa', title: 'محامي استئناف ومحاكم' },
        { name: 'أ. نورة العتيبي', email: 'nora@salman-law.sa', title: 'محامية قضايا عمالية' },
      ],
    },
    {
      id: '22222222-0000-0000-0000-000000000002',
      slug: 'firm-adl',
      name: 'شركة العدل والرقابة الدولية للمحاماة',
      cr: '4030192847',
      unn: '7005829102',
      city: 'جدة',
      lawyers: [
        { name: 'أ. عبد العزيز الغامدي', email: 'ghamdi@adl-law.sa', title: 'شريك مدير' },
        { name: 'أ. خالد الزهراني', email: 'khalid@adl-law.sa', title: 'مستشار شركات وعقود' },
        { name: 'أ. ماجد الشهري', email: 'majed@adl-law.sa', title: 'محامي قضايا عمالية' },
        { name: 'أ. ريم الدوسري', email: 'reem@adl-law.sa', title: 'مستشارة تحكيم ودعاوى' },
        { name: 'أ. سلطان الحربي', email: 'sultan@adl-law.sa', title: 'محامي محاكم تنفيذ' },
      ],
    },
    {
      id: '33333333-0000-0000-0000-000000000003',
      slug: 'firm-tamimi',
      name: 'مكتب التميمي والرويس محامون ومستشارون',
      cr: '2050981234',
      unn: '7009128374',
      city: 'الدمام',
      lawyers: [
        { name: 'أ. طارق التميمي', email: 'tamimi@tamimi-law.sa', title: 'شريك مؤسس' },
        { name: 'أ. بدر الرويس', email: 'ruwais@tamimi-law.sa', title: 'شريك إدارة وقضايا' },
        { name: 'أ. ياسر الخالدي', email: 'yasser@tamimi-law.sa', title: 'مستشار أحوال شخصية وتركات' },
        { name: 'أ. هند المطيري', email: 'hind@tamimi-law.sa', title: 'محامية دعاوى تجارية' },
        { name: 'أ. فهد المطيري', email: 'fahad@tamimi-law.sa', title: 'محامي ترافع ومحاكم' },
      ],
    },
  ];

  // Seed default permissions
  const permissions = [
    { name: 'cases.create', description: 'إضافة قضية جديدة' },
    { name: 'cases.view', description: 'استعراض قائمة القضايا' },
    { name: 'cases.update', description: 'تعديل تفاصيل القضية' },
    { name: 'cases.close', description: 'إغلاق قضية قانونية' },
    { name: 'cases.delete', description: 'حذف قضية' },
    { name: 'clients.manage', description: 'إدارة الموكلين' },
    { name: 'billing.view', description: 'استعراض الفواتير' },
    { name: 'billing.manage', description: 'إصدار الفواتير' },
  ];

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: { description: perm.description },
      create: { name: perm.name, description: perm.description },
    });
  }

  const courtNames = [
    'المحكمة التجارية بالرياض - الدائرة الأولى',
    'المحكمة التجارية بجدة - الدائرة الثالثة',
    'المحكمة العمالية بالرياض - الدائرة الثانية',
    'محكمة الأحوال الشخصية بالدمام - الدائرة الأولى',
    'محكمة التنفيذ بالرياض - الدائرة الخامسة',
    'محكمة الاستئناف بالرياض - دائرة العقود والشركات',
    'المحكمة العامة بالخبر - الدائرة المدنية',
  ];

  const caseTypesList = ['commercial', 'labor', 'personal_status', 'execution'] as const;
  const caseStatuses = ['open', 'in_progress', 'resolved', 'closed'] as const;

  let totalCasesCreated = 0;

  for (let fIdx = 0; fIdx < firmsData.length; fIdx++) {
    const firmData = firmsData[fIdx];

    // Create Organization (Tenant)
    const org = await prisma.organization.upsert({
      where: { id: firmData.id },
      update: { name: firmData.name, slug: firmData.slug },
      create: {
        id: firmData.id,
        slug: firmData.slug,
        name: firmData.name,
        commercialRegistration: firmData.cr,
        unifiedNationalNumber: firmData.unn,
        planTier: 'enterprise',
        status: 'active',
      },
    });

    // Create Default Partner Role for Firm
    const role = await prisma.role.upsert({
      where: { organizationId_name: { organizationId: org.id, name: 'Partner Lawyer' } },
      update: {},
      create: {
        organizationId: org.id,
        name: 'Partner Lawyer',
      },
    });

    // Map permissions
    const dbPerms = await prisma.permission.findMany();
    await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
    await prisma.rolePermission.createMany({
      data: dbPerms.map((p) => ({ roleId: role.id, permissionId: p.id })),
    });

    // Execute within Tenant Context
    await TenantContext.run({ tenantId: org.id }, async () => {
      // Create 5 Clients for the firm
      const clients: any[] = [];
      for (let c = 1; c <= 5; c++) {
        const clientObj = await prisma.db.client.create({
          data: {
            organizationId: org.id,
            name: `موكل ${firmData.name.split(' ')[1]} رقم ${c} (شركة/مؤسسة)`,
            nationalIdOrCr: `101090${fIdx}${c}78`,
            phone: `+96650${fIdx}${c}1234${c}`,
            email: `client${c}.${firmData.slug}@example.sa`,
            portalAccessEnabled: true,
          },
        });
        clients.push(clientObj);
      }

      // Loop through 5 lawyers
      for (let lIdx = 0; lIdx < firmData.lawyers.length; lIdx++) {
        const lawyerInfo = firmData.lawyers[lIdx];

        // Create User record
        const user = await prisma.user.upsert({
          where: { email: lawyerInfo.email },
          update: { fullName: lawyerInfo.name, passwordHash: defaultPasswordHash },
          create: {
            fullName: lawyerInfo.name,
            email: lawyerInfo.email,
            passwordHash: defaultPasswordHash,
            status: 'active',
            nationalId: `10928${fIdx}${lIdx}543`,
          },
        });

        // Add User as Organization Member
        await prisma.db.organizationMember.upsert({
          where: { organizationId_userId: { organizationId: org.id, userId: user.id } },
          update: { jobTitle: lawyerInfo.title },
          create: {
            organizationId: org.id,
            userId: user.id,
            roleId: role.id,
            jobTitle: lawyerInfo.title,
            licenseNumber: `SA-LAW-2026-${fIdx + 1}${lIdx + 1}99`,
            employmentType: 'FULL_TIME',
            status: 'active',
          },
        });

        // Create EXACTLY 15 Cases for this lawyer
        for (let caseIdx = 1; caseIdx <= 15; caseIdx++) {
          const client: any = clients[(caseIdx - 1) % clients.length];
          const caseType = caseTypesList[(caseIdx - 1) % caseTypesList.length];
          const status = caseStatuses[(caseIdx - 1) % caseStatuses.length];
          const court = courtNames[(caseIdx - 1) % courtNames.length];
          const caseNumInternal = `CAS-${firmData.slug.substring(5).toUpperCase()}-L${lIdx + 1}-${caseIdx.toString().padStart(2, '0')}`;
          const najizNum = `44901${fIdx + 1}${lIdx + 1}${caseIdx.toString().padStart(2, '0')}`;

          const newCase: any = await prisma.db.case.create({
            data: {
              organizationId: org.id,
              clientId: client.id,
              assignedLawyerId: user.id,
              caseNumberInternal: caseNumInternal,
              najizCaseNumber: najizNum,
              caseType: caseType,
              courtName: court,
              status: status,
              openedAt: new Date(Date.now() - caseIdx * 7 * 24 * 60 * 60 * 1000),
            },
          });

          // Add a hearing for open / in_progress cases
          if (status === 'open' || status === 'in_progress') {
            await prisma.db.hearing.create({
              data: {
                organizationId: org.id,
                caseId: newCase.id,
                title: `الجلسة رقم ${caseIdx} - النظر في الدعوى والمستندات`,
                hearingDate: new Date(Date.now() + caseIdx * 2 * 24 * 60 * 60 * 1000),
                courtName: court,
                courtRoom: `قاعة الجلسات رقم ${(caseIdx % 5) + 1}`,
                judgeName: 'فضيلة القاضي/ عبد الرحمن الفايز',
                meetingUrl: `https://najiz.sa/hearings/join/${najizNum}`,
                source: 'najiz_sync',
                notes: 'جلسة مرافعة وإيداع المذكرات الجوابية عبر منصة ناجز',
              },
            });
          }

          totalCasesCreated++;
        }
      }
    });

    console.log(`✅ Completed Seeding for Firm ${fIdx + 1}: ${firmData.name}`);
  }

  console.log(`🎉 SUCCESS! Seeded 3 Law Firms, 15 Lawyers (5 per firm), and EXACTLY ${totalCasesCreated} Cases!`);
  await prisma.$disconnect();
}

seed3Firms().catch((err) => {
  console.error('❌ Error Seeding Data:', err);
  process.exit(1);
});
