import { PrismaService } from './shared/database/prisma.service';
import { TenantContext } from './shared/tenant/tenant.context';

async function main() {
  const prisma = new PrismaService();
  await prisma.$connect();
  console.log('Connected to database successfully!');

  try {
    const orgs = await prisma.organization.findMany();
    console.log('Organizations in DB:', orgs.length);
  } catch (err: any) {
    console.error('Error querying organizations. Maybe tables do not exist?', err.message);
    process.exit(1);
  }

  // Define mock tenant context for validation
  const tenantId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

  await TenantContext.run({ tenantId }, async () => {
    try {
      console.log('Running query with Tenant ID context:', tenantId);
      // Query cases using the extended client 'db' which wraps it with SET LOCAL
      const cases = await prisma.db.case.findMany();
      console.log(`Cases visible to Tenant A: ${cases.length}`);
      cases.forEach(c => {
        console.log(`- Case Internal ID: ${c.caseNumberInternal}, Organization ID: ${c.organizationId}`);
      });
    } catch (err: any) {
      console.error('Error during Tenant context query:', err.message);
    }
  });

  await prisma.$disconnect();
}

main();
