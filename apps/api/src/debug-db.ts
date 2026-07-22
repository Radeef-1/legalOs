import { PrismaService } from './shared/database/prisma.service';

async function main() {
  const prisma = new PrismaService();
  await prisma.$connect();
  
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Set the tenant context parameter
      await tx.$executeRawUnsafe(`SET LOCAL app.current_tenant_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';`);
      
      // 2. Query the parameter value back to verify it was set
      const setting = await tx.$queryRawUnsafe(`SELECT current_setting('app.current_tenant_id', true) as val;`);
      
      // 3. Query all cases in the table through RLS
      const cases = await tx.$queryRawUnsafe(`SELECT id, organization_id, case_number_internal, court_name FROM cases;`);
      
      // 4. Check current role and database user
      const dbUser = await tx.$queryRawUnsafe(`SELECT current_user, session_user;`);
      
      return { setting, cases, dbUser };
    });

    console.log('Debug Result:', JSON.stringify(result, null, 2));
  } catch (err: any) {
    console.error('Debug Error:', err.message);
  }

  await prisma.$disconnect();
}

main();
