import { PrismaClient, PlanTier, OrganizationStatus } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedDevelopmentData() {
  console.log('🌱 [Development Seed] Populating 5 Saudi Law Firms & Initial Data...');

  const devFirms = [
    { slug: 'salman-law-dev', name: 'مكتب السلمان للمحاماة (بيئة التطوير)', cr: '1010998811', unn: '7001010998' },
    { slug: 'aladl-law-dev', name: 'شركة العدل والتميز (بيئة التطوير)', cr: '4030192837', unn: '7009988112' },
  ];

  for (const firm of devFirms) {
    await prisma.organization.upsert({
      where: { slug: firm.slug },
      update: { name: firm.name },
      create: {
        slug: firm.slug,
        name: firm.name,
        commercialRegistration: firm.cr,
        unifiedNationalNumber: firm.unn,
        planTier: PlanTier.enterprise,
        status: OrganizationStatus.active,
      },
    });
  }

  console.log('✅ [Development Seed] Completed 🟢');
}
