import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './shared/database/prisma.service';
import { TenantContext } from './shared/tenant/tenant.context';
import { CasesService } from './cases/application/cases.service';
import { OutboxWorker } from './shared/events/outbox/outbox.worker';
import { OUTBOX_REPOSITORY_TOKEN } from './shared/events/tokens';
import { IOutboxRepository } from './shared/events/contracts/outbox-repository.interface';
import { CaseType, OutboxStatus } from '@prisma/client';

async function main() {
  console.log('--- Bootstrapping NestJS Context for Event Verification ---');
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const prisma = app.get(PrismaService);
  const casesService = app.get(CasesService);
  const outboxRepo = app.get<IOutboxRepository>(OUTBOX_REPOSITORY_TOKEN);
  const outboxWorker = app.get(OutboxWorker);

  // Setup context for Tenant A
  const tenantId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  const partnerId = '33333333-3333-3333-3333-333333333333'; // Partner A

  await TenantContext.run({ tenantId, userId: partnerId, role: 'Partner' }, async () => {
    try {
      console.log('\n[1] Starting Scenario: Create Case inside Transaction & check Outbox');
      
      // Clean up previous test cases/outbox events if any
      await prisma.db.task.deleteMany({ where: { title: 'مراجعة ملف القضية وتعبئة المستندات الأولية' } });
      await prisma.db.outboxEvent.deleteMany({ where: { eventType: 'case.created' } });
      await prisma.db.auditLog.deleteMany({ where: { action: 'CREATE', entityType: 'Case' } });
      await prisma.db.notification.deleteMany({ where: { type: 'CASE_CREATED' } });

      // Create a test client first
      const client = await prisma.db.client.findFirst({ where: { organizationId: tenantId } });
      if (!client) {
        throw new Error('No client found for Tenant A to create case');
      }

      const caseNumber = `TEST-EV-${Date.now()}`;
      console.log(`Creating Case: ${caseNumber} for client: ${client.name}`);

      const createdCase = await casesService.create({
        clientId: client.id,
        caseNumberInternal: caseNumber,
        caseType: CaseType.commercial,
        courtName: 'محكمة الاستئناف الإدارية بالرياض',
      });

      console.log(`Case created successfully: ID: ${createdCase.id}`);

      // Query outbox_events immediately to check transaction boundary insertion
      const outboxRecords = await prisma.db.outboxEvent.findMany({
        where: { aggregateId: createdCase.id },
      });

      console.log(`Outbox records found for this case: ${outboxRecords.length}`);
      if (outboxRecords.length === 1) {
        const record = outboxRecords[0];
        console.log(`- Event ID: ${record.id}`);
        console.log(`- Event Type: ${record.eventType}`);
        console.log(`- Tenant ID: ${record.tenantId}`);
        console.log(`- User ID: ${record.userId}`);
        console.log(`- Status: ${record.status} (Expected: PENDING)`);
        
        if (record.status !== OutboxStatus.PENDING) {
          throw new Error('Outbox event status should be PENDING immediately after case creation');
        }
        console.log('✔ Scenario 1: Outbox Event inserted inside transaction boundary successfully!');
      } else {
        throw new Error('Expected exactly 1 outbox event for the created case');
      }

      console.log('\n[2] Starting Scenario: Process Outbox & check multiple Handlers execution');
      
      // Trigger outbox worker manually to process the pending event
      console.log('Manually running OutboxWorker.processOutbox()...');
      await outboxWorker.processOutbox();
      // Allow async event handlers to complete execution in the event loop
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Check status updated to PROCESSED
      const updatedRecord = await prisma.db.outboxEvent.findUnique({
        where: { id: outboxRecords[0].id },
      });
      console.log(`- Updated Outbox Event Status: ${updatedRecord?.status} (Expected: PROCESSED)`);
      if (updatedRecord?.status !== OutboxStatus.PROCESSED) {
        throw new Error('Outbox event should be PROCESSED after worker execution');
      }

      // Check Handler 1: Audit Log
      const auditLogs = await prisma.db.auditLog.findMany({
        where: { entityId: createdCase.id },
      });
      console.log(`- Handler 1 (Audit Log): Created ${auditLogs.length} audit logs. (Expected: 1)`);
      if (auditLogs.length !== 1) {
        throw new Error('AuditLog handler failed to insert record');
      }

      // Check Handler 2: Timeline (Task creation)
      const tasks = await prisma.db.task.findMany({
        where: { caseId: createdCase.id },
      });
      console.log(`- Handler 2 (Timeline Task): Created ${tasks.length} tasks. (Expected: 1)`);
      if (tasks.length !== 1) {
        throw new Error('Timeline handler failed to auto-create welcome task');
      }

      // Check Handler 3: Notifications (In-app Notification)
      const notifications = await prisma.db.notification.findMany({
        where: { userId: partnerId },
      });
      console.log(`- Handler 3 (Notifications): Created ${notifications.length} notifications. (Expected: 1)`);
      if (notifications.length < 1) {
        throw new Error('Notification handler failed to create welcome notification');
      }

      console.log('✔ Scenario 2: One event successfully reached multiple handlers!');

      console.log('\n[3] Starting Scenario: Outbox Event Failure & Retry Mechanism');
      
      // Create a mock failing event by saving an outbox record with invalid payload
      // or event payload that will fail when parsed
      const failingEventId = 'fefefefe-fefe-fefe-fefe-fefefefefefe';
      await prisma.db.outboxEvent.create({
        data: {
          id: failingEventId,
          eventType: 'case.created',
          aggregateType: 'Case',
          aggregateId: createdCase.id,
          tenantId: tenantId,
          userId: partnerId,
          payload: { invalid: 'payload_without_metadata_will_fail' } as any,
          status: OutboxStatus.PENDING,
        },
      });

      console.log(`Inserted mock failing Outbox Event ID: ${failingEventId}`);
      console.log('Manually running OutboxWorker.processOutbox()...');
      await outboxWorker.processOutbox();
      // Allow async event handlers to complete execution in the event loop
      await new Promise((resolve) => setTimeout(resolve, 500));

      const retriedRecord = await prisma.db.outboxEvent.findUnique({
        where: { id: failingEventId },
      });

      console.log(`- Outbox Event Status: ${retriedRecord?.status} (Expected: FAILED)`);
      console.log(`- Retry Count: ${retriedRecord?.retryCount} (Expected: 1)`);
      console.log(`- Next Retry At: ${retriedRecord?.nextRetryAt}`);
      console.log(`- Error Recorded: "${retriedRecord?.error?.substring(0, 80)}..."`);

      if (retriedRecord?.status !== OutboxStatus.FAILED || retriedRecord?.retryCount !== 1) {
        throw new Error('Retry mechanism failed to increment retries or update status to FAILED');
      }
      console.log('✔ Scenario 3: Failing events correctly log errors and schedules retries!');

    } catch (err: any) {
      console.error('\n❌ Verification Failed:', err.message);
      process.exit(1);
    }
  });

  await app.close();
  console.log('\n--- All Scenarios Successfully Verified & Passed! ---');
  process.exit(0);
}

main();
