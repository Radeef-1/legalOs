import { PrismaClient, PlanTier, OrganizationStatus, UserStatus, CaseType, CaseStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting LegalOS Production Database Seeder...');

  // 1. Create 5 Saudi Law Firms (Organizations)
  const firmsData = [
    {
      slug: 'salman-law-firm',
      name: 'مكتب السلمان للمحاماة والاستشارات القانونية',
      commercialRegistration: '1010998811',
      unifiedNationalNumber: '7001010998',
      planTier: PlanTier.enterprise,
      status: OrganizationStatus.active,
    },
    {
      slug: 'al-adl-law-firm',
      name: 'شركة العدل والتميز الدولية للمحاماة',
      commercialRegistration: '4030192837',
      unifiedNationalNumber: '7009988112',
      planTier: PlanTier.boutique,
      status: OrganizationStatus.active,
    },
    {
      slug: 'altamimi-lawyers',
      name: 'مكتب التميمي والرويس محامون ومستشارون قانونيون',
      commercialRegistration: '1010887722',
      unifiedNationalNumber: '7008877665',
      planTier: PlanTier.enterprise,
      status: OrganizationStatus.active,
    },
    {
      slug: 'khalid-alghamdi-law',
      name: 'مكتب خالد الغامدي للمحاماة والترافع الشرعي',
      commercialRegistration: '4030881122',
      unifiedNationalNumber: '7005544332',
      planTier: PlanTier.solo,
      status: OrganizationStatus.active,
    },
    {
      slug: 'al-khubara-legal',
      name: 'شركة الخبراء القانونية للاستشارات والتحكيم',
      commercialRegistration: '1010332211',
      unifiedNationalNumber: '7003322110',
      planTier: PlanTier.boutique,
      status: OrganizationStatus.active,
    },
  ];

  for (const firm of firmsData) {
    const org = await prisma.organization.upsert({
      where: { slug: firm.slug },
      update: {
        name: firm.name,
        commercialRegistration: firm.commercialRegistration,
        unifiedNationalNumber: firm.unifiedNationalNumber,
        planTier: firm.planTier,
        status: firm.status,
      },
      create: firm,
    });

    console.log(`✓ Organization Created/Updated: [${org.name}] (ID: ${org.id})`);

    // Create Profile for Firm
    await prisma.organizationProfile.upsert({
      where: { organizationId: org.id },
      update: {
        address: 'طريق الملك فهد، برج العليا السكني، الدور 14، الرياض',
        phone: '+966114902000',
        email: `info@${org.slug}.sa`,
        website: `https://${org.slug}.sa`,
        taxNumber: `31092${Math.floor(100000000 + Math.random() * 900000000)}00003`,
      },
      create: {
        organizationId: org.id,
        address: 'طريق الملك فهد، برج العليا السكني، الدور 14، الرياض',
        phone: '+966114902000',
        email: `info@${org.slug}.sa`,
        website: `https://${org.slug}.sa`,
        taxNumber: `31092${Math.floor(100000000 + Math.random() * 900000000)}00003`,
      },
    });
  }

  console.log('✅ Database Seeding Completed Successfully! 5 Firms, Profiles, and Configurations Armed.');
}

main()
  .catch((e) => {
    console.error('❌ Error Seeding Database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
