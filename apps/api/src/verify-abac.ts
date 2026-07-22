import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './shared/database/prisma.service';
import { TenantContext } from './shared/tenant/tenant.context';
import { PolicyEngineService } from './shared/policy/policy.engine';
import { Subject, Resource } from './shared/policy/types';

async function main() {
  console.log('--- Bootstrapping NestJS Context for ABAC Verification ---');
  const app = await NestFactory.createApplicationContext(AppModule);

  const prisma = app.get(PrismaService);
  const policyEngine = app.get(PolicyEngineService);

  const tenantId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  const partnerId = '33333333-3333-3333-3333-333333333333'; // Lawyer A (Partner)

  await TenantContext.run({ tenantId, userId: partnerId, role: 'Partner' }, async () => {
    try {
      console.log('\n[1] Starting Scenario 1: Dynamic ABAC Policy Evaluation & Deny Overrides');

      // Cleanup previous test policies
      await prisma.db.policy.deleteMany({
        where: { name: { in: ['Partner Delete Open Cases', 'Deny Closed Cases Delete', 'Branch Specific Case Access'] } },
      });

      // 1. Create ALLOW policy: Partners can delete cases in OPEN status
      const allowPolicy = await prisma.db.policy.create({
        data: {
          organizationId: tenantId,
          name: 'Partner Delete Open Cases',
          description: 'Allows partners to delete cases',
          effect: 'ALLOW',
          action: 'cases.delete',
          resource: 'Case',
          conditions: {
            AND: [
              { field: 'subject.role', operator: 'EQ', value: 'Partner' },
              { field: 'resource.status', operator: 'NEQ', value: 'closed' },
            ],
          } as any,
          isActive: true,
        },
      });
      console.log(`- Created ALLOW Policy: "${allowPolicy.name}"`);

      // 2. Create DENY policy: Deny deleting any CLOSED case
      const denyPolicy = await prisma.db.policy.create({
        data: {
          organizationId: tenantId,
          name: 'Deny Closed Cases Delete',
          description: 'Denies deleting closed cases regardless of role',
          effect: 'DENY',
          action: 'cases.delete',
          resource: 'Case',
          conditions: {
            field: 'resource.status',
            operator: 'EQ',
            value: 'closed',
          } as any,
          isActive: true,
        },
      });
      console.log(`- Created DENY Policy: "${denyPolicy.name}"`);

      // Evaluate Partner deleting an OPEN case
      const partnerSubject: Subject = {
        userId: partnerId,
        role: 'Partner',
        organizationId: tenantId,
        branchId: 'branch-111',
      };

      const openCaseResource: Resource = {
        type: 'Case',
        id: 'case-open-1',
        status: 'open',
        branchId: 'branch-111',
      };

      const isAllowedOpen = await policyEngine.evaluate(partnerSubject, 'cases.delete', openCaseResource);
      console.log(`- Partner deleting OPEN case evaluation result: ${isAllowedOpen} (Expected: true)`);

      if (!isAllowedOpen) {
        throw new Error('ABAC Policy Engine failed to ALLOW deleting open case for Partner');
      }

      // Evaluate Partner deleting a CLOSED case
      const closedCaseResource: Resource = {
        type: 'Case',
        id: 'case-closed-1',
        status: 'closed',
        branchId: 'branch-111',
      };

      const isAllowedClosed = await policyEngine.evaluate(partnerSubject, 'cases.delete', closedCaseResource);
      console.log(`- Partner deleting CLOSED case evaluation result: ${isAllowedClosed} (Expected: false)`);

      if (isAllowedClosed) {
        throw new Error('ABAC Policy Engine failed: DENY policy did not override ALLOW policy');
      }

      console.log('✔ Scenario 1: Dynamic ABAC Evaluation & Deny Override Verified!');

      // ----------------------------------------------------
      // Scenario 2: Dynamic Attribute Matching (Branch Alignment)
      // ----------------------------------------------------
      console.log('\n[2] Starting Scenario 2: Dynamic Attribute Matching (Branch Alignment)');

      const branchPolicy = await prisma.db.policy.create({
        data: {
          organizationId: tenantId,
          name: 'Branch Specific Case Access',
          effect: 'ALLOW',
          action: 'cases.update',
          resource: 'Case',
          conditions: {
            field: 'subject.branchId',
            operator: 'EQ',
            value: 'resource.branchId',
          } as any,
          isActive: true,
        },
      });
      console.log(`- Created Attribute-Matching Policy: "${branchPolicy.name}"`);

      const RiyadhSubject: Subject = {
        userId: partnerId,
        role: 'Partner',
        organizationId: tenantId,
        branchId: 'riyadh-hq',
      };

      const RiyadhCase: Resource = { type: 'Case', branchId: 'riyadh-hq' };
      const JeddahCase: Resource = { type: 'Case', branchId: 'jeddah-branch' };

      const canUpdateRiyadh = await policyEngine.evaluate(RiyadhSubject, 'cases.update', RiyadhCase);
      console.log(`- Riyadh user updating Riyadh case: ${canUpdateRiyadh} (Expected: true)`);

      const canUpdateJeddah = await policyEngine.evaluate(RiyadhSubject, 'cases.update', JeddahCase);
      console.log(`- Riyadh user updating Jeddah case: ${canUpdateJeddah} (Expected: false)`);

      if (!canUpdateRiyadh || canUpdateJeddah) {
        throw new Error('ABAC Policy Engine failed attribute matching (subject.branchId == resource.branchId)');
      }

      console.log('✔ Scenario 2: Dynamic Attribute Matching Verified!');

      // ----------------------------------------------------
      // Scenario 3: Prisma Query Filter Compiler
      // ----------------------------------------------------
      console.log('\n[3] Starting Scenario 3: Prisma Query Filter Compilation');

      const filter = await policyEngine.compilePrismaFilter(partnerSubject, 'cases.delete', 'Case');
      console.log(`- Compiled Prisma Filter Object:\n`, JSON.stringify(filter, null, 2));

      // Test compiled filter in an actual Prisma query
      const matches = await prisma.db.case.findMany({
        where: {
          organizationId: tenantId,
          ...filter,
        },
      });
      console.log(`- Prisma query executed with ABAC filter returned ${matches.length} matching records`);

      console.log('✔ Scenario 3: Prisma Query Filter Compiler Verified!');

      console.log('\n✅ All ABAC Policy Engine scenarios verified successfully!');
    } catch (err) {
      console.error('❌ ABAC Verification failed:', err);
      process.exit(1);
    } finally {
      await app.close();
    }
  });
}

main();
