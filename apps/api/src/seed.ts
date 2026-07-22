import { PrismaService } from './shared/database/prisma.service';
import { hashPassword } from './shared/utils/crypto';
import { TenantContext } from './shared/tenant/tenant.context';

async function main() {
  const prisma = new PrismaService();
  await prisma.$connect();
  console.log('Seeding database...');

  const defaultPasswordHash = hashPassword('password123');

  // Create Organizations
  const orgA = await prisma.organization.upsert({
    where: { id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' },
    update: {
      slug: 'firma',
    },
    create: {
      id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      slug: 'firma',
      name: 'Firm A (Tenant A)',
      planTier: 'boutique',
      status: 'active',
    },
  });

  const orgB = await prisma.organization.upsert({
    where: { id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' },
    update: {
      slug: 'firmb',
    },
    create: {
      id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
      slug: 'firmb',
      name: 'Firm B (Tenant B)',
      planTier: 'solo',
      status: 'active',
    },
  });

  // Seed permissions
  const permissions = [
    { name: 'cases.create', description: 'إضافة قضية جديدة' },
    { name: 'cases.view', description: 'استعراض قائمة القضايا' },
    { name: 'cases.update', description: 'تعديل تفاصيل القضية' },
    { name: 'cases.close', description: 'إغلاق قضية قانونية' },
    { name: 'cases.delete', description: 'حذف قضية (Soft Delete)' },
    { name: 'clients.manage', description: 'إضافة/تعديل الموكلين' },
    { name: 'billing.view', description: 'استعراض كشوفات الفواتير' },
    { name: 'billing.manage', description: 'إنشاء واعتماد فواتير جديدة' },
    { name: 'najiz.configure', description: 'ربط وتعديل مفاتيح ناجز' },
    { name: 'workspace.manage', description: 'إدارة إعدادات وهيكل بيئة العمل' },
  ];

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: { description: perm.description },
      create: { name: perm.name, description: perm.description },
    });
  }

  // Create Roles with static IDs for simplicity / consistency in relations
  const rolesData = [
    { id: '11111111-1111-1111-1111-111111111111', orgId: orgA.id, name: 'Partner', perms: permissions.map(p => p.name) },
    { id: '11111111-1111-1111-1111-111111111112', orgId: orgA.id, name: 'Associate', perms: ['cases.create', 'cases.view', 'cases.update', 'clients.manage'] },
    { id: '11111111-1111-1111-1111-111111111113', orgId: orgA.id, name: 'Paralegal', perms: ['cases.view', 'cases.update', 'clients.manage'] },

    { id: '22222222-2222-2222-2222-222222222222', orgId: orgB.id, name: 'Partner', perms: permissions.map(p => p.name) },
    { id: '22222222-2222-2222-2222-222222222223', orgId: orgB.id, name: 'Associate', perms: ['cases.create', 'cases.view', 'cases.update', 'clients.manage'] },
    { id: '22222222-2222-2222-2222-222222222224', orgId: orgB.id, name: 'Paralegal', perms: ['cases.view', 'cases.update', 'clients.manage'] },
  ];

  const roleMap: Record<string, string> = {};

  for (const r of rolesData) {
    const role = await prisma.role.upsert({
      where: { organizationId_name: { organizationId: r.orgId, name: r.name } },
      update: {},
      create: {
        id: r.id,
        organizationId: r.orgId,
        name: r.name,
      },
    });

    roleMap[`${r.orgId}_${r.name}`] = role.id;

    // Map permissions
    await prisma.rolePermission.deleteMany({
      where: { roleId: role.id },
    });

    const dbPerms = await prisma.permission.findMany({
      where: { name: { in: r.perms } },
    });

    await prisma.rolePermission.createMany({
      data: dbPerms.map(p => ({
        roleId: role.id,
        permissionId: p.id,
      })),
    });
  }

  // Create Users globally
  const userA = await prisma.user.upsert({
    where: { email: 'lawyer.a@firma.sa' },
    update: { passwordHash: defaultPasswordHash },
    create: {
      id: '33333333-3333-3333-3333-333333333333',
      fullName: 'Lawyer A (Partner)',
      email: 'lawyer.a@firma.sa',
      passwordHash: defaultPasswordHash,
      status: 'active',
    },
  });

  const associateA = await prisma.user.upsert({
    where: { email: 'associate.a@firma.sa' },
    update: { passwordHash: defaultPasswordHash },
    create: {
      id: '33333333-3333-3333-3333-333333333334',
      fullName: 'Associate A',
      email: 'associate.a@firma.sa',
      passwordHash: defaultPasswordHash,
      status: 'active',
    },
  });

  const paralegalA = await prisma.user.upsert({
    where: { email: 'paralegal.a@firma.sa' },
    update: { passwordHash: defaultPasswordHash },
    create: {
      id: '33333333-3333-3333-3333-333333333335',
      fullName: 'Paralegal A',
      email: 'paralegal.a@firma.sa',
      passwordHash: defaultPasswordHash,
      status: 'active',
    },
  });

  const userB = await prisma.user.upsert({
    where: { email: 'lawyer.b@firmb.sa' },
    update: { passwordHash: defaultPasswordHash },
    create: {
      id: '44444444-4444-4444-4444-444444444444',
      fullName: 'Lawyer B (Partner)',
      email: 'lawyer.b@firmb.sa',
      passwordHash: defaultPasswordHash,
      status: 'active',
    },
  });

  // Create Memberships within Tenant context
  await TenantContext.run({ tenantId: orgA.id }, async () => {
    await prisma.db.organizationMember.upsert({
      where: { organizationId_userId: { organizationId: orgA.id, userId: userA.id } },
      update: { roleId: roleMap[`${orgA.id}_Partner`] },
      create: {
        id: '11111111-2222-3333-4444-555555555551',
        organizationId: orgA.id,
        userId: userA.id,
        roleId: roleMap[`${orgA.id}_Partner`],
        jobTitle: 'Partner Lawyer',
        employmentType: 'FULL_TIME',
        status: 'active',
      },
    });

    await prisma.db.organizationMember.upsert({
      where: { organizationId_userId: { organizationId: orgA.id, userId: associateA.id } },
      update: { roleId: roleMap[`${orgA.id}_Associate`] },
      create: {
        id: '11111111-2222-3333-4444-555555555552',
        organizationId: orgA.id,
        userId: associateA.id,
        roleId: roleMap[`${orgA.id}_Associate`],
        jobTitle: 'Associate Lawyer',
        employmentType: 'FULL_TIME',
        status: 'active',
      },
    });

    await prisma.db.organizationMember.upsert({
      where: { organizationId_userId: { organizationId: orgA.id, userId: paralegalA.id } },
      update: { roleId: roleMap[`${orgA.id}_Paralegal`] },
      create: {
        id: '11111111-2222-3333-4444-555555555553',
        organizationId: orgA.id,
        userId: paralegalA.id,
        roleId: roleMap[`${orgA.id}_Paralegal`],
        jobTitle: 'Paralegal assistant',
        employmentType: 'FULL_TIME',
        status: 'active',
      },
    });

    // Create default Settings for Tenant A
    await prisma.db.workspaceSetting.upsert({
      where: { organizationId: orgA.id },
      update: {},
      create: {
        organizationId: orgA.id,
        branding: {
          primaryColor: '#1A365D',
          secondaryColor: '#718096',
          logoUrl: null,
        },
        localization: {
          dateFormat: 'YYYY-MM-DD',
          timeFormat: 'HH:mm',
          numberFormat: '1,000.00',
          timeZone: 'Asia/Riyadh',
          defaultLanguage: 'ar',
        },
        preferences: {
          fiscalYearStart: '01-01',
          weekStart: 0,
          defaultCurrency: 'SAR',
          workingDays: [0, 1, 2, 3, 4],
          workingHoursStart: '08:00',
          workingHoursEnd: '17:00',
        },
        numbering: {
          caseNumberPattern: 'CASE-{YYYY}-{SEQ}',
          invoiceNumberPattern: 'INV-{YYYY}-{SEQ}',
        },
        featureFlags: {
          aiEnabled: true,
          clientPortalEnabled: true,
          ocrEnabled: true,
          financeEnabled: true,
          knowledgeEnabled: true,
        },
      },
    });
  });

  await TenantContext.run({ tenantId: orgB.id }, async () => {
    await prisma.db.organizationMember.upsert({
      where: { organizationId_userId: { organizationId: orgB.id, userId: userB.id } },
      update: { roleId: roleMap[`${orgB.id}_Partner`] },
      create: {
        id: '11111111-2222-3333-4444-555555555554',
        organizationId: orgB.id,
        userId: userB.id,
        roleId: roleMap[`${orgB.id}_Partner`],
        jobTitle: 'Solo Attorney',
        employmentType: 'FULL_TIME',
        status: 'active',
      },
    });

    // Create default Settings for Tenant B
    await prisma.db.workspaceSetting.upsert({
      where: { organizationId: orgB.id },
      update: {},
      create: {
        organizationId: orgB.id,
        branding: {
          primaryColor: '#2D3748',
          secondaryColor: '#4A5568',
          logoUrl: null,
        },
        localization: {
          dateFormat: 'YYYY-MM-DD',
          timeFormat: 'HH:mm',
          numberFormat: '1,000.00',
          timeZone: 'Asia/Riyadh',
          defaultLanguage: 'ar',
        },
        preferences: {
          fiscalYearStart: '01-01',
          weekStart: 0,
          defaultCurrency: 'SAR',
          workingDays: [0, 1, 2, 3, 4],
          workingHoursStart: '09:00',
          workingHoursEnd: '18:00',
        },
        numbering: {
          caseNumberPattern: 'CASE-{YYYY}-{SEQ}',
          invoiceNumberPattern: 'INV-{YYYY}-{SEQ}',
        },
        featureFlags: {
          aiEnabled: false,
          clientPortalEnabled: false,
          ocrEnabled: false,
          financeEnabled: false,
          knowledgeEnabled: false,
        },
      },
    });
  });

  // Create Clients (RLS applies to clients table)
  let clientA: any;
  await TenantContext.run({ tenantId: orgA.id }, async () => {
    clientA = await prisma.db.client.upsert({
      where: { id: '55555555-5555-5555-5555-555555555555' },
      update: {},
      create: {
        id: '55555555-5555-5555-5555-555555555555',
        organizationId: orgA.id,
        name: 'Client A',
        nationalIdOrCr: '1010101010',
      },
    });
  });

  let clientB: any;
  await TenantContext.run({ tenantId: orgB.id }, async () => {
    clientB = await prisma.db.client.upsert({
      where: { id: '66666666-6666-6666-6666-666666666666' },
      update: {},
      create: {
        id: '66666666-6666-6666-6666-666666666666',
        organizationId: orgB.id,
        name: 'Client B',
        nationalIdOrCr: '2020202020',
      },
    });
  });

  // Create Cases (RLS applies to cases table)
  await TenantContext.run({ tenantId: orgA.id }, async () => {
    // Case A-001 (assigned to Lawyer A - Partner)
    await prisma.db.case.upsert({
      where: { organizationId_caseNumberInternal: { organizationId: orgA.id, caseNumberInternal: 'CASE-A-001' } },
      update: { assignedLawyerId: userA.id },
      create: {
        id: '77777777-7777-7777-7777-777777777777',
        organizationId: orgA.id,
        clientId: clientA.id,
        assignedLawyerId: userA.id,
        caseNumberInternal: 'CASE-A-001',
        caseType: 'commercial',
        courtName: 'Commercial Court Riyadh',
        status: 'open',
      },
    });

    // Case A-002 (assigned to Associate A)
    await prisma.db.case.upsert({
      where: { organizationId_caseNumberInternal: { organizationId: orgA.id, caseNumberInternal: 'CASE-A-002' } },
      update: { assignedLawyerId: associateA.id },
      create: {
        id: '77777777-7777-7777-7777-777777777778',
        organizationId: orgA.id,
        clientId: clientA.id,
        assignedLawyerId: associateA.id,
        caseNumberInternal: 'CASE-A-002',
        caseType: 'labor',
        courtName: 'Labor Court Riyadh',
        status: 'open',
      },
    });
  });

  await TenantContext.run({ tenantId: orgB.id }, async () => {
    await prisma.db.case.upsert({
      where: { organizationId_caseNumberInternal: { organizationId: orgB.id, caseNumberInternal: 'CASE-B-001' } },
      update: {},
      create: {
        id: '88888888-8888-8888-8888-888888888888',
        organizationId: orgB.id,
        clientId: clientB.id,
        assignedLawyerId: userB.id,
        caseNumberInternal: 'CASE-B-001',
        caseType: 'labor',
        courtName: 'Labor Court Jeddah',
        status: 'open',
      },
    });
  });

  console.log('Database seeded successfully!');
  await prisma.$disconnect();
}

main();
