import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './shared/database/prisma.service';
import { TenantContext } from './shared/tenant/tenant.context';
import { WorkflowDefinitionsService } from './workflow/definitions/workflow-definitions.service';
import { WorkflowEventListener } from './workflow/engine/workflow-event.listener';
import { ApprovalsService } from './workflow/approvals/approvals.service';
import { SlasService } from './workflow/slas/slas.service';
import { WorkflowTriggerType, WorkflowExecutionStatus, ApprovalStatus } from '@prisma/client';

async function main() {
  console.log('--- Bootstrapping NestJS Context for Enterprise Workflow Engine Verification ---');
  const app = await NestFactory.createApplicationContext(AppModule);

  const prisma = app.get(PrismaService);
  const definitionsService = app.get(WorkflowDefinitionsService);
  const eventListener = app.get(WorkflowEventListener);
  const approvalsService = app.get(ApprovalsService);
  const slasService = app.get(SlasService);

  const tenantAId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  const tenantBId = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
  const partnerAId = '33333333-3333-3333-3333-333333333333';

  await TenantContext.run({ tenantId: tenantAId, userId: partnerAId, role: 'Partner' }, async () => {
    try {
      console.log('\n[1] Fetching OrganizationMember context');
      const member = await prisma.db.organizationMember.findUnique({
        where: { organizationId_userId: { organizationId: tenantAId, userId: partnerAId } },
      });

      if (!member) throw new Error('OrganizationMember not found for partner');

      // ----------------------------------------------------
      // Scenario 1: Creating Workflow Definition
      // ----------------------------------------------------
      console.log('\n[2] Scenario 1: Creating "Commercial Case Onboarding Workflow" Definition');
      const def = await definitionsService.create({
        name: 'مسار تجهيز القضايا التجارية الجدد',
        description: 'مسار عمل آلي يفحص نوع القضية وينشئ التكليفات ويتطلب موافقة الشريك',
        triggerType: WorkflowTriggerType.CASE_CREATED,
        entityType: 'Case',
        nodesJson: [
          {
            id: 'node-0',
            type: 'CONDITION',
            title: 'فحص نوع القضية',
            field: 'caseType',
            operator: 'EQUALS',
            value: 'commercial',
          },
          {
            id: 'node-1',
            type: 'CREATE_TASK',
            title: 'تأطير التكليف القانوني',
            taskTitle: 'إعداد لائحة الدعوى التجارية خلال 3 أيام',
            assignedToId: member.userId,
          },
          {
            id: 'node-2',
            type: 'REQUIRE_APPROVAL',
            title: 'اعتماد البدء في الترافع التجاري',
            approverId: member.id,
          },
          {
            id: 'node-3',
            type: 'SEND_NOTIFICATION',
            title: 'إشعار الفريق بالموافقة',
            message: 'تمت موافقة الشريك على الترافع في القضية التجارية وبدء العمل فوراً',
          },
        ],
      });

      console.log(`- Created WorkflowDefinition [ID: ${def.id}]: "${def.name}" (Nodes: ${def.nodesJson ? (def.nodesJson as any[]).length : 0})`);

      // ----------------------------------------------------
      // Scenario 2: Event Listener & Automatic Execution
      // ----------------------------------------------------
      console.log('\n[3] Scenario 2: Simulating CaseCreatedEvent & Automatic Execution');
      const client = await prisma.db.client.create({
        data: {
          organization: { connect: { id: tenantAId } },
          name: 'شركة سير العمل التجارية',
          nationalIdOrCr: '1010998877',
        },
      });

      const testCase = await prisma.db.case.create({
        data: {
          organization: { connect: { id: tenantAId } },
          client: { connect: { id: client.id } },
          caseNumberInternal: `COMM-2026-${Date.now()}`,
          caseType: 'commercial',
          status: 'open',
        },
      });

      const executions = await eventListener.handleCaseCreatedEvent({
        caseId: testCase.id,
        organizationId: tenantAId,
        caseType: 'commercial',
        caseNumberInternal: testCase.caseNumberInternal,
      });

      if (!executions || executions.length === 0) {
        throw new Error('WorkflowEventListener failed to trigger execution for CaseCreatedEvent');
      }

      const execId = executions[0].id;
      console.log(`- Auto-spawned Workflow Execution [ID: ${execId}]`);

      // Verify created task
      const createdTask = await prisma.db.task.findFirst({
        where: { organizationId: tenantAId, caseId: testCase.id },
      });

      if (!createdTask || !createdTask.title.includes('لائحة الدعوى التجارية')) {
        throw new Error('Workflow Engine failed to automatically create Task node');
      }
      console.log(`✔ Node 1 (CREATE_TASK) executed! Task [ID: ${createdTask.id}]: "${createdTask.title}" created.`);

      // Verify execution paused at Node 2 (REQUIRE_APPROVAL)
      const pausedExec = await prisma.db.workflowExecution.findUnique({
        where: { id: execId },
      });

      if (pausedExec?.status !== WorkflowExecutionStatus.WAITING_APPROVAL) {
        throw new Error(`Workflow Execution status expected WAITING_APPROVAL but got ${pausedExec?.status}`);
      }
      console.log('✔ Node 2 (REQUIRE_APPROVAL) paused execution with status WAITING_APPROVAL!');

      // ----------------------------------------------------
      // Scenario 3: Partner Approval Inbox & Resuming Execution
      // ----------------------------------------------------
      console.log('\n[4] Scenario 3: Partner Approval Inbox & Resuming Paused Execution');
      const pendingApprovals = await approvalsService.findPendingForApprover(member.id);
      console.log(`- Found ${pendingApprovals.length} pending approval requests for Partner ${member.id}`);

      const targetApproval = pendingApprovals.find((a) => a.executionId === execId);
      if (!targetApproval) {
        throw new Error('Approval request not found in Partner inbox');
      }

      console.log(`- Approving Request [ID: ${targetApproval.id}]: "${targetApproval.title}"`);
      const approvalDecision = await approvalsService.decide(targetApproval.id, 'APPROVED', 'تمت دراسة الملف والموافقة على البدء');

      if (approvalDecision.status !== ApprovalStatus.APPROVED) {
        throw new Error('Approval decision status mismatch');
      }

      // Check that execution resumed and COMPLETED
      const finalExec = await prisma.db.workflowExecution.findUnique({
        where: { id: execId },
      });

      if (finalExec?.status !== WorkflowExecutionStatus.COMPLETED) {
        throw new Error(`Workflow Execution expected COMPLETED but got ${finalExec?.status}`);
      }
      console.log(`✔ Workflow Execution [ID: ${execId}] automatically resumed and reached COMPLETED status!`);

      // Verify Step Logs
      const stepLogs = await prisma.db.workflowStepLog.findMany({
        where: { executionId: execId },
        orderBy: { stepIndex: 'asc' },
      });

      console.log(`- Execution Step Logs Recorded: ${stepLogs.length} steps`);
      stepLogs.forEach((log) => {
        console.log(`  Step ${log.stepIndex} [${log.nodeType}]: Status=${log.status}`);
      });

      // ----------------------------------------------------
      // Scenario 4: SLA Tracking Setup
      // ----------------------------------------------------
      console.log('\n[5] Scenario 4: SLA Process Duration Tracker');
      const sla = await slasService.create({
        workflowDefinitionId: def.id,
        targetDurationMinutes: 120, // 2 hours
        warningThresholdMinutes: 90,
        escalateToMemberId: member.id,
      });

      console.log(`- Configured SLA Rule [ID: ${sla.id}]: Target=${sla.targetDurationMinutes} mins, Warning=${sla.warningThresholdMinutes} mins`);
      const slaCheck = await slasService.checkOverdueExecutions();
      console.log(`- SLA Overdue Check: RunningExecutions=${slaCheck.checkedExecutionsCount}, OverdueCount=${slaCheck.overdueCount}`);
      console.log('✔ SLA Tracking Engine verified successfully!');

      // ----------------------------------------------------
      // Scenario 5: Multi-Tenant RLS Security Isolation
      // ----------------------------------------------------
      console.log('\n[6] Scenario 5: Multi-Tenant RLS Security Isolation Test');
      await TenantContext.run({ tenantId: tenantBId, userId: 'other-user', role: 'Partner' }, async () => {
        const tenantBDefs = await definitionsService.findAll();
        const tenantBApprovals = await approvalsService.findPendingForApprover(member.id);

        console.log(`- Tenant B Workflow Definitions Count: ${tenantBDefs.length} (Expected: 0 from Tenant A)`);
        console.log(`- Tenant B Pending Approvals Count: ${tenantBApprovals.length} (Expected: 0 from Tenant A)`);

        const isIsolated = !tenantBDefs.some((d) => d.id === def.id) && tenantBApprovals.length === 0;
        if (!isIsolated) {
          throw new Error('SECURITY VIOLATION: Tenant B accessed Tenant A workflow data!');
        }
        console.log('✔ Tenant Workflow Engine RLS Isolation Verified!');
      });

      console.log('\n✅ All Enterprise Workflow Engine Domain scenarios verified successfully!');
    } catch (err) {
      console.error('❌ Workflow Engine Verification failed:', err);
      process.exit(1);
    } finally {
      await app.close();
    }
  });
}

main();
