import { PrismaService } from './shared/database/prisma.service';
import { TenantContext } from './shared/tenant/tenant.context';
import { CasesService } from './cases/application/cases.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

async function main() {
  const prisma = new PrismaService();
  await prisma.$connect();
  console.log('--- RBAC Verification Script ---');

  // 1. Verify roles & permissions mapping in Database
  const roles = await prisma.role.findMany({
    include: {
      permissions: {
        include: {
          permission: true,
        },
      },
    },
  });

  console.log('\n[1] Roles & Permissions in DB:');
  for (const role of roles) {
    const permNames = role.permissions.map(rp => rp.permission.name);
    console.log(`- Role: "${role.name}" (Tenant ID: ${role.organizationId})`);
    console.log(`  Permissions: [${permNames.join(', ')}]`);
  }

  const mockEventPublisher: any = {
    publish: async () => {},
    publishMany: async () => {},
    publishAsync: async () => {},
    schedule: async () => {},
  };
  const casesService = new CasesService(prisma, mockEventPublisher);

  // Tenant A Info
  const tenantAId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  const partnerAId = '33333333-3333-3333-3333-333333333333';
  const associateAId = '33333333-3333-3333-3333-333333333334';
  const paralegalAId = '33333333-3333-3333-3333-333333333335';

  // Case IDs (from seed)
  const caseA001Id = '77777777-7777-7777-7777-777777777777'; // Assigned to Partner A
  const caseA002Id = '77777777-7777-7777-7777-777777777778'; // Assigned to Associate A

  // 2. Test Partner A (should see all cases for Tenant A, and be able to close/delete)
  console.log('\n[2] Testing Partner A Context:');
  await TenantContext.run({ tenantId: tenantAId, userId: partnerAId, role: 'Partner' }, async () => {
    const result = await casesService.findAll(1, 10);
    console.log(`- Partner A sees ${result.items.length} cases (Expected: 2)`);
    result.items.forEach(c => console.log(`  * Case: ${c.caseNumberInternal}, assigned to: ${c.assignedLawyerId}`));

    const case1 = await casesService.findOne(caseA001Id);
    console.log(`- Partner A can find Case A-001: ${case1.caseNumberInternal}`);

    const case2 = await casesService.findOne(caseA002Id);
    console.log(`- Partner A can find Case A-002: ${case2.caseNumberInternal}`);
  });

  // 3. Test Associate A (should see ONLY Case A-002, and findOne for Case A-001 should throw NotFound)
  console.log('\n[3] Testing Associate A Context:');
  await TenantContext.run({ tenantId: tenantAId, userId: associateAId, role: 'Associate' }, async () => {
    const result = await casesService.findAll(1, 10);
    console.log(`- Associate A sees ${result.items.length} cases (Expected: 1)`);
    result.items.forEach(c => console.log(`  * Case: ${c.caseNumberInternal}, assigned to: ${c.assignedLawyerId}`));

    // Test findOne for Case A-002 (Assigned to Associate A) -> Should succeed
    const case2 = await casesService.findOne(caseA002Id);
    console.log(`- Associate A can view assigned Case A-002: ${case2.caseNumberInternal}`);

    // Test findOne for Case A-001 (Assigned to Partner A) -> Should throw NotFound
    try {
      await casesService.findOne(caseA001Id);
      console.error('- ERROR: Associate A was able to find Case A-001!');
    } catch (err) {
      if (err instanceof NotFoundException) {
        console.log('- OK: Associate A received NotFoundException for unassigned Case A-001');
      } else {
        console.error('- ERROR: Unexpected error for unassigned Case A-001:', err);
      }
    }

    // Test updating status to "closed" -> Should throw ForbiddenException (only Partners can close)
    try {
      await casesService.update(caseA002Id, { status: 'closed' });
      console.error('- ERROR: Associate A was able to close Case A-002!');
    } catch (err) {
      if (err instanceof ForbiddenException) {
        console.log('- OK: Associate A received ForbiddenException when attempting to close a case');
      } else {
        console.error('- ERROR: Unexpected error when attempting to close case:', err);
      }
    }
  });

  // 4. Test Tenant B (should be completely isolated from Tenant A)
  const tenantBId = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
  const partnerBId = '44444444-4444-4444-4444-444444444444';
  
  console.log('\n[4] Testing Tenant B Isolation:');
  await TenantContext.run({ tenantId: tenantBId, userId: partnerBId, role: 'Partner' }, async () => {
    const result = await casesService.findAll(1, 10);
    console.log(`- Partner B sees ${result.items.length} cases (Expected: 1)`);
    result.items.forEach(c => console.log(`  * Case: ${c.caseNumberInternal}, Tenant: ${c.organizationId}`));

    // Test finding Tenant A's case -> Should throw NotFound
    try {
      await casesService.findOne(caseA001Id);
      console.error('- ERROR: Partner B was able to find Tenant A\'s case!');
    } catch (err) {
      if (err instanceof NotFoundException) {
        console.log('- OK: Partner B received NotFoundException for Tenant A\'s case (Tenant isolation intact)');
      } else {
        console.error('- ERROR: Unexpected error:', err);
      }
    }
  });

  console.log('\n--- Verification Complete ---');
  await prisma.$disconnect();
}

main();
